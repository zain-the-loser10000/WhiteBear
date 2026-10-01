/**
 * @file webhook.controller.js
 * @module controllers/webHookController
 * @description Secure controller that processes Stripe Dashboard Payment Links and handles subscription lifecycles.
 */

const stripe = require('../config/stripe.config');
const User = require('../models/user.schema');
require('dotenv').config();

class WebhookController {
  static async handleWebhook(req, res) {
    try {
      console.log('================================================');
      console.log('🔥 SECURE WEBHOOK HIT');

      const signature = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('✅ STRIPE SIGNATURE PASSED. EVENT TYPE:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          await WebhookController.handleCheckoutSessionCompleted(
            event.data.object
          );
          break;

        case 'customer.subscription.updated':
          await WebhookController.subscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await WebhookController.subscriptionDeleted(event.data.object);
          break;

        // 🟢 SILENCE DUMMY NOISE: Accept these events silently without logging warnings
        case 'charge.succeeded':
        case 'invoice.created':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.payment_succeeded':
        case 'payment_intent.created':
        case 'payment_intent.succeeded':
        case 'payment_method.attached':
        case 'customer.created':
        case 'customer.updated':
        case 'customer.subscription.created':
          // Valid event loop states; return quickly to acknowledge receipt
          break;

        default:
          console.log('⚠️ Unhandled operational event type:', event.type);
      }

      console.log('================================================');
      return res.json({ received: true });
    } catch (error) {
      console.error('❌ SECURE WEBHOOK ERROR:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  // ==========================================
  // 🟢 CHECKOUT SESSION COMPLETED (DASHBOARD LINKS)
  // ==========================================
  static async handleCheckoutSessionCompleted(session) {
    console.log('🚀 PROCESSING COMPLETED CHECKOUT SESSION');

    let userId = session.client_reference_id;
    let customerEmail = session.customer_details?.email;

    // 🟢 FIX: Log the session data
    console.log('📋 SESSION DATA:', JSON.stringify(session, null, 2));
    console.log('🆔 USER ID FROM SESSION:', userId);
    console.log('📧 CUSTOMER EMAIL:', customerEmail);

    if (!userId && customerEmail) {
      console.log(
        `⚠️ client_reference_id missing. Querying MongoDB fallback for email: ${customerEmail}`
      );
      const user = await User.findOne({
        email: customerEmail.toLowerCase().trim(),
      });
      userId = user?._id?.toString();
      console.log('🔍 FOUND USER BY EMAIL:', userId);
    }

    if (!userId) {
      console.log('❌ ABORTING: Could not resolve user identity.');
      return;
    }

    // Get subscription details
    const subscriptionId = session.subscription;
    console.log('📋 SUBSCRIPTION ID:', subscriptionId);

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('📋 SUBSCRIPTION DATA:', JSON.stringify(subscription, null, 2));

    const priceId = subscription.items.data[0].price.id;
    const interval = subscription.items.data[0].price.recurring?.interval;

    console.log('💰 PRICE ID:', priceId);
    console.log('📅 INTERVAL:', interval);

    // Update Stripe customer and subscription metadata
    await stripe.customers.update(session.customer, {
      metadata: { userId },
    });

    await stripe.subscriptions.update(subscriptionId, {
      metadata: { userId },
    });

    const validStart =
      subscription.current_period_start &&
      subscription.current_period_start > 0;
    const validEnd =
      subscription.current_period_end && subscription.current_period_end > 0;

    // 🟢 FIX: Explicitly create the data object
    const data = {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      subscriptionPlan: interval === 'year' ? 'yearly' : 'monthly',
      subscriptionStatus: subscription.status,
      currentPeriodStart: validStart
        ? new Date(subscription.current_period_start * 1000)
        : new Date(),
      currentPeriodEnd: validEnd
        ? new Date(subscription.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    };

    console.log('💾 SAVING DATA TO MONGODB:', JSON.stringify(data, null, 2));

    // 🟢 FIX: Try multiple save attempts
    let saveAttempts = 0;
    let saved = false;

    while (saveAttempts < 3 && !saved) {
      saveAttempts++;
      console.log(`🔄 SAVE ATTEMPT ${saveAttempts}...`);

      try {
        await User.findByIdAndUpdate(userId, { $set: data });
        saved = true;
        console.log(`✅ SAVE ATTEMPT ${saveAttempts} SUCCESSFUL`);
      } catch (error) {
        console.error(`❌ SAVE ATTEMPT ${saveAttempts} FAILED:`, error);
        if (saveAttempts === 3) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 🟢 FINAL VERIFICATION: Read back the data
    const finalData = await User.findById(userId).select('-password -__v');
    console.log('🔍 FINAL VERIFICATION:', JSON.stringify(finalData, null, 2));

    if (finalData?.subscriptionPlan !== data.subscriptionPlan) {
      console.error('❌ CRITICAL: Data mismatch after save!');
      console.error('Expected:', data.subscriptionPlan);
      console.error('Got:', finalData?.subscriptionPlan);
    }

    console.log('✅ MONGODB STORAGE UPDATE COMPLETED');
  }

  // ==========================================
  // 🔄 SUBSCRIPTION UPDATED (RENEWALS / UPGRADES)
  // ==========================================
  static async subscriptionUpdated(subscription) {
    console.log('🔄 PROCESSING SUBSCRIPTION UPDATED EVENT');

    let userId = subscription?.metadata?.userId;
    if (!userId) {
      const customer = await stripe.customers.retrieve(subscription.customer);
      userId = customer?.metadata?.userId;
    }

    if (!userId)
      return console.log('❌ LIFECYCLE ABORTED: Missing user mapping linkage.');

    // 🟢 SAFE TIMESTAMP CALCULATION
    const validEnd =
      subscription.current_period_end && subscription.current_period_end > 0;

    const data = {
      subscriptionStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: validEnd
        ? new Date(subscription.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    await User.findByIdAndUpdate(userId, { $set: data });
    console.log('✅ MONGODB SUBSCRIPTION CHANGES APPLIED');
  }

  // ==========================================
  // 🗑️ SUBSCRIPTION DELETED (CANCELLATIONS / CHURN)
  // ==========================================
  static async subscriptionDeleted(subscription) {
    console.log('🗑️ PROCESSING SUBSCRIPTION DELETED EVENT');

    let userId = subscription?.metadata?.userId;
    if (!userId) {
      const customer = await stripe.customers.retrieve(subscription.customer);
      userId = customer?.metadata?.userId;
    }

    if (!userId)
      return console.log('❌ LIFECYCLE ABORTED: Missing user mapping linkage.');

    const data = {
      subscriptionPlan: 'free_trial',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
    };

    await User.findByIdAndUpdate(userId, { $set: data });
    console.log('✅ MONGODB ACCOUNT PLAN REVERTED TO FREE TRIAL STATUS');
  }
}

module.exports = WebhookController;
