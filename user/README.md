# 🐻‍❄️ White Bear Mobile Application

A premium personal growth, productivity, and mindfulness mobile application built with **React Native (CLI)**. The **White Bear** app empowers users to track daily habits, manage long-term goals, maintain a mindfulness journal, view data-driven analytics, and receive context-aware AI growth insights.

## ✨ Core Features

- **🔐 Secure Onboarding & Identity**

- Password-less or secure password authentication supported by an optimized **OTP verification** workflow.
- **📈 Habit & Task Engine**

- **Habit Tracker:** Build consistent streaks, log daily habits, and visualize routine execution.
- **To-Do Micro-Tasks:** Clear, reactive checklists for immediate daily operations.
- **🎯 Goal Milestone Strategy**

- Set long-term macro goals and break them down into actionable milestones.
- **📖 Mindfulness Journaling**

- Log daily thoughts, moods, and contextual sentiment markers to maintain a steady emotional reflection log.
- **🤖 AI Insights & Smart Analytics**

- Visual dashboard mapping completion metrics, streaks, and trends.
- Personalized feedback summaries generated securely through server-side Google Gemini AI integration.
- **💳 Premium Tier Gating**

- Native subscription screens hooked into a secure backend Stripe billing ecosystem.
- **🔔 Smart Push Notifications**

- Deep-linked reminders powered by **Firebase Cloud Messaging (FCM)** to keep streaks alive.

## 📁 Project Structure

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

## 🛠️ Tech Stack

| Component              | Technology                                                  | Purpose                                     |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| **Core Framework**     | React Native (CLI Engine)                                   | Mobile application development              |
| **State Architecture** | Redux Toolkit + Async Thunk / RTK Query                     | Global state management and API integration |
| **Navigation**         | React Navigation (Native Stack, Bottom Tabs)                | Screen navigation and tab management        |
| **Notifications**      | Firebase Cloud Messaging (FCM) via `@react-native-firebase` | Push notifications and deep-linking         |
| **HTTP Client**        | Axios with centralized interceptors                         | API communication with JWT injection        |
| **UI Components**      | Vector Icons, Animated, Custom Utilities                    | Modular design system and animations        |

# 📬 Contact

For any questions, suggestions, or contributions:

Name: Muhammad Zain-Ul-Abideen
Email: zabideen639@gmail.com
GitHub: https://github.com/zain100000
LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/
