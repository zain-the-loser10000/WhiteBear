# 🐻‍❄️ White Bear Backend

A robust, scalable Node.js/Express.js backend built for the White Bear productivity and wellness ecosystem. Designed to empower users through intelligent goal management, habit loop tracking, reflective journaling, and deep analytics powered by AI.

# ✨ Features

- 🔐 Advanced Auth & Identity

- JWT-based access control with secure password hashing (bcrypt)
- OTP verification pipelines for registration/password resets
- Firebase Admin SDK integration for seamless cross-platform notification handling

- 📈 Habit & Goal Tracker

- Comprehensive CRUD for daily habits, long-term goals, and targeted to-do lists
- Configurable constant maps for strict category management

- 📖 Mindfulness & Journaling

- Secure daily journal logging with mood/context markers

- 🤖 AI Insights & Analytics

- Integrated with Google Gemini AI (gemini.service.js) to provide personalized, context-aware growth recommendations
- Automated background metrics computation powered by localized cron workers (analytic.schedular.js)

- 💳 Premium Subscriptions

- Full Stripe tier billing integration with automated webhooks processing for subscription lifecycle state updates

- ⚡ Performance & Security

- Redis configuration layer for lighting-fast caching policies
- Helmet, CORS, rate-limiting, and deep query sanitization out of the box

# 🛠️ Tech Stack

| Component              | Technology                                             | Purpose                                 |
| ---------------------- | ------------------------------------------------------ | --------------------------------------- |
| **Runtime**            | Node.js                                                | Server environment                      |
| **Framework**          | Express.js                                             | Web framework for REST API              |
| **Database**           | MongoDB (Mongoose ODM)                                 | NoSQL database with object modeling     |
| **Caching & Queueing** | Redis                                                  | Fast in-memory data storage and caching |
| **AI Integration**     | Google Gemini API                                      | Personalized growth recommendations     |
| **Payment Gateway**    | Stripe                                                 | Subscription billing and transactions   |
| **Push Notifications** | Firebase Cloud Messaging (FCM)                         | Cross-platform push notifications       |
| **Security**           | Helmet, CORS, Rate Limiting, bcrypt, Express Sanitizer | API security and data protection        |

# 📁 Project Structure

```bash
backend/
├── src/
│   ├── config/              # DB, Redis, Stripe, and Firebase Admin configurations
│   ├── constants/           # Business rule mappings (goals, subscriptions, habits)
│   ├── controllers/         # Request controllers handling resource cycles
│   ├── errors/              # Express central application error handling classes
│   ├── helpers/             # Cryptographic, hashing, and token signing layers
│   ├── middlewares/         # Authorization locks and security layers
│   ├── models/              # Mongoose structural document schemas
│   ├── routes/              # Express operational path definitions
│   ├── services/            # Gemini AI integration, Notifications, and business logic
│   ├── utils/               # Decoupled tools (Cloudinary, Email, OTP managers)
│   └── workers/             # Background automation tasks (`analytic.schedular.js`)
├── .env
├── package.json
└── README.md

# 🧩 Core Ecosystem Modules

| Module           | Purpose                    | Features Engaged                                                    |
| ---------------- | -------------------------- | ------------------------------------------------------------------- |
| **User & Auth**  | Lifecycle Management       | JWT verification, OTP challenges, registration & security profiling |
| **Habit & Todo** | Performance Micro-tracking | Custom progression intervals, state triggers, status toggles        |
| **Goal Tracker** | Milestone Strategy         | Categorized macro-objectives mapping directly to daily analytics    |
| **Mindfulness**  | Self-reflection Logging    | Encrypted journal logs tracking daily sentiment contexts            |
| **Analytics**    | Data Aggregation Engines   | Background worker computation mapping streaks and AI-summaries      |
| **Billing**      | Commercial Monetization    | Tiered structures, dynamic Stripe checkout gates, secure Webhook    |

# 📬 Contact

For any questions, suggestions, or contributions:

Name: Muhammad Zain-Ul-Abideen
Email: zabideen639@gmail.com
GitHub: https://github.com/zain100000
LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.
```
