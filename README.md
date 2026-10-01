# 🐻‍❄️ White Bear Personal Growth Platform

A complete, high-performance personal growth, productivity, and mindfulness ecosystem consisting of two integrated components:

- **White Bear Backend** – Node.js/Express REST API with Redis & Google Gemini AI
- **White Bear User App** – React Native Mobile Application for end-users

---

## 🌟 Overview

**White Bear** is an advanced ecosystem designed to help individuals architect their lives through structured execution and mindful reflection. By blending performance tracking (habits, goals, to-dos) with mindfulness (journaling) and cutting-edge artificial intelligence, White Bear turns daily data into actionable self-improvement blueprints.

### ✨ Core Features

- **Habit Loop & Tasks** – Track daily consistency streaks and manage short-term checklists.
- **🎯 Goal Milestones** – Map out macro-level life objectives and break them down dynamically.
- **📖 Mindfulness Journaling** – Log thoughts, capture mood contexts, and record emotional trends.
- **🤖 Gemini AI Coach** – Get tailored growth analytics and intelligent feedback summaries.
- **💳 Tiered Billing Integration** – Monitored via secure Stripe subscription checks and automated webhooks.
- **🔔 Real-time Engagement** – Smart automated reminders backed by Firebase Cloud Messaging (FCM).

---

## 🏗️ Architecture

The ecosystem relies on an ultra-responsive, zero-trust infrastructure:

| Component       | Technology                          | Core Purpose                                                 |
| --------------- | ----------------------------------- | ------------------------------------------------------------ |
| **Backend API** | Node.js + Express + MongoDB + Redis | Core Business Logic, AI Processing, Caching, Stripe Webhooks |
| **Mobile App**  | React Native (CLI) + Redux Toolkit  | High-fidelity, client-side tracking and user interaction hub |

---

## 📁 Project Structures

### 1. backend (`backend`)

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
```

### 2. user (`user`)

```bash
user/
├── src/
│   ├── assets/              # Native icons, design packages, and Lottie animations
│   ├── constants/           # Core app dimensions, themes, and configuration flags
│   ├── navigation/          # Native bottom tab structures and animated routing stacks
│   ├── redux/               # Global state layers (RTK queries and slice management)
│   ├── screens/             # End-user high-end application views
│   │   ├── auth/            # Password-less validation and registration modules
│   │   ├── dashboard/       # Core Hub showing streaks and personalized AI coach cards
│   │   ├── habit-screen/    # Habit interaction view matrix
│   │   ├── goal-screen/     # Long-term goal milestone track map
│   │   ├── journal-screen/  # Contextual daily mood log entries
│   │   ├── todo-screen/     # Instant response to-do item list
│   │   ├── billing-screen/  # Premium subscription upgrade portal
│   │   └── profile-screen/  # App preferences, credentials, and notification settings
│   ├── styles/              # Global Tailwind style tokens
│   └── utilities/           # Atomized custom UI primitives (buttons, feedback views)
├── App.jsx                  # Master providers layout context
├── index.js                 # Metro engine root link
└── package.json
```

---

## 🔗 API Integration

- The **Mobile Application** connects directly to the centralized **White Bear Backend**.
- Dev Endpoint Target: `http://localhost:8000` (Overridable via user config file in `user/src/redux`).
- Prod Endpoint Target: `https://white-bear-backend.vercel.app` (Live backend hosted on Vercel).

---

## 🛠️ Tech Stack Matrix

| Layer                  | Technology                                          |
| ---------------------- | --------------------------------------------------- |
| **Backend Runtime**    | Node.js & Express.js                                |
| **Database & Cache**   | MongoDB (Mongoose ODM), Redis (High-speed caching)  |
| **AI Integration**     | Google Gemini AI Engine API                         |
| **Payment Processing** | Stripe Billing Gateway                              |
| **Security**           | Helmet, CORS protection, custom Rate-Limiting rules |
| **Mobile Framework**   | React Native (CLI Engine)                           |
| **State Management**   | Redux Toolkit + RTK Query                           |
| **Navigation**         | React Navigation Stack & Tab elements               |
| **Cloud Messaging**    | Firebase Admin SDK / Cloud Messaging                |

---

## 📋 Platform Modules

- **Authentication & Security** – Handled via JWT, local device Keychain lockers, and dynamic OTP verification.
- **Habit & Task Engines** – Track streaks and execute micro-level daily checking.
- **Milestone Management** – Track high-level life objectives and sub-goal trees.
- **Mindfulness Log System** – Analyze moods and record encrypted journals.
- **Analytical Workers** – Internal engine cron loops processing user metrics via Gemini AI.
- **Monetization Gateways** – Validate and gate premium tiers through server-verified Stripe webhooks.

---

# 📬 Contact

For any questions, suggestions, or contributions:

| Field        | Details                                                         |
| ------------ | --------------------------------------------------------------- |
| **Name**     | Muhammad Zain-Ul-Abideen                                        |
| **Email**    | zabideen639@gmail.com                                           |
| **GitHub**   | https://github.com/zain100000                                   |
| **LinkedIn** | https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/ |
