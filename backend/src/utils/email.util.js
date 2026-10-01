/**
 * @file email.util.js
 * @module utils/email.util
 * @description Nodemailer-based engine exclusively for OTP verification management (WhiteBear Edition)
 */

const nodemailer = require('nodemailer');

// Guard check: Validate critical environment configurations at runtime
const requiredEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(
      `💥 Deployment Interruption: Missing critical mail matrix variable [${envVar}]`
    );
  }
});

const mailPort = parseInt(process.env.EMAIL_PORT, 10);

/**
 * Configured Nodemailer transporter instance
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: mailPort,
  secure: mailPort === 465, // True for 465 (SSL/Direct Connection)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Dispatches the structured transactional email
 */
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to.trim(),
      subject: subject,
      html: html,
      text: html.replace(/<[^>]+>/g, ' ').substring(0, 200) + '...',
    });

    console.log(
      `📡 Security Token Transmitted | To: [${to}] | MsgId: [${info.messageId}]`
    );
    return true;
  } catch (error) {
    console.error(
      `💥 Mail Dispatch Failure Context [To: ${to}]:`,
      error.message
    );
    return false;
  }
};

/**
 * Wraps functional fragments inside the WhiteBear master corporate design frame
 */
exports.getEmailTemplate = (content, title = 'WhiteBear System') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #F5F7F6; /* Tertiary (Bear) */
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      line-height: 1.6; 
      color: #516870; /* Secondary */
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #F5F7F6; /* Tertiary (Bear) */
      padding: 40px 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff; 
      border-radius: 20px; 
      overflow: hidden; 
      border: 1px solid #C6CCD2; /* Outline (Bear Outline) */
      box-shadow: 0 10px 25px -5px rgba(81, 104, 112, 0.05);
    }
    .header { 
      background-color: #516870; /* Secondary */
      padding: 40px 40px; 
      text-align: center;
    }
   .logo-img {
  max-width: 160px;
  height: auto;
  margin-bottom: 12px;
  display: inline-block;
  background: transparent; /* 👈 Set to completely transparent */
}
    .logo-text {
      color: #ffffff;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-accent {
      color: #A7BCA5; /* Primary */
    }
    .main-content { 
      padding: 56px 48px; 
      background: #ffffff; 
    }
    .info-card { 
      background: #F5F7F6; /* Tertiary (Bear) */
      border-radius: 12px; 
      padding: 24px; 
      margin: 32px 0; 
      border-left: 4px solid #A7BCA5; /* Primary */
    }
    .otp-display {
      font-size: 40px; 
      letter-spacing: 8px; 
      color: #516870; /* Secondary */
      margin: 0; 
      font-weight: 800; 
      font-family: 'Courier New', Courier, monospace;
    }
    .support-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px dashed #C6CCD2; /* Outline */
      font-size: 14px;
      color: #516870;
    }
    .support-link {
      color: #516870;
      font-weight: 700;
      text-decoration: underline;
    }
    .footer { 
      background: #516870; /* Secondary */
      padding: 32px 40px; 
      text-align: center; 
      color: #F5F7F6; /* Tertiary */
    }
    .footer-copy { 
      font-size: 13px; 
      margin: 0 0 8px; 
      color: #F5F7F6;
      opacity: 0.9;
    }
    .footer-note { 
      font-size: 11px; 
      color: #F5F7F6; 
      line-height: 1.5; 
      margin-top: 12px;
      opacity: 0.7;
    }
    @media (max-width: 600px) { 
      .main-content { padding: 40px 24px; } 
      .header { padding: 36px 24px; } 
    }
  </style>
</head>
<body>
  <table class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1780584822/WHITE_BEAR/logo/logo_xot90h.png" alt="WhiteBear Logo" class="logo-img" onerror="this.style.display='none';" />
            <h1 class="logo-text">White<span class="logo-accent">Bear</span></h1>
          </div>
          
          <div class="main-content">
            ${content}
          </div>
          
          <div class="footer">
            <p class="footer-copy">© ${new Date().getFullYear()} <strong>WhiteBear</strong>. All rights reserved.</p>
            <p class="footer-note">
              This communication contains automated security records designated exclusively for your account context.<br>
              If you did not authenticate this intent, please secure your credentials.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Dispatches a 6-digit mixed alphanumeric OTP code layout
 */
exports.sendEmailVerificationOtp = async (toEmail, fullName, otp) => {
  const content = `
    <div style="text-align: left;">
      <h2 style="color: #516870; font-size: 24px; margin-top: 0; margin-bottom: 16px; font-weight: 700;">
        Verify Your Email
      </h2>
      
      <p style="color: #516870; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
        Hello ${fullName},
      </p>

      <p style="color: #516870; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
        Enter the OTP which is shown below to confirm your verification request:
      </p>
      
      <div class="info-card" style="text-align: center; background-color: #F5F7F6; border: 1px dashed #C6CCD2; border-left: 4px solid #A7BCA5;">
        <p style="color: #516870; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px; font-weight: 700; opacity: 0.8;">
          One-Time Alphanumeric Passcode
        </p>
        <h1 class="otp-display">${otp}</h1>
      </div>

      <p style="color: #516870; font-size: 15px; line-height: 1.6; margin: 24px 0;">
        This security token will expire automatically in <strong>10 minutes</strong>.
      </p>
      
      <div class="support-section">
        <strong>Need Assistance?</strong><br>
        If you run into issues verifying your passcode or need assistance with your credentials, please get in touch with our operations team directly at 
        <a href="mailto:support.whitebear@gmail.com" class="support-link">support.whitebear@gmail.com</a>.
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: toEmail,
    subject: 'WhiteBear • Secure Verification Passcode',
    html: exports.getEmailTemplate(content, 'Identity Authorization Pipeline'),
  });
};
