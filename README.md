# TalentFlow: AI-Powered Interview Practice Platform

TalentFlow is an elite, full-stack web application designed to help software engineers practice DBMS, Core OOP, DSA, and Behavioral interview prompts. It simulates realistic time pressure, tracks chronological progress on a pure SVG trendline, and leverages the Gemini 1.5 Flash API to deliver structured feedback (scores, positive insights, gaps, and model answers).

---

## 🛠️ Step-by-Step Guide to Run Locally

Follow these 5 steps to get the entire project running from scratch on your local machine:

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **PostgreSQL** (Ensure the PostgreSQL daemon is active. If you use macOS Homebrew: `brew services start postgresql@18`)

---

### 2. Verify Server Environment variables
Navigate to the server directory `backend/` and verify the `.env` configuration file exists:
```text
backend/.env
```
Ensure it contains the following keys (pre-configured for your database and Gemini model):
```env
PORT=5001
DATABASE_URL="postgresql://kushalsharma@localhost:5432/ai_interview_practice?schema=public"
GEMINI_API_KEY="AIzaSyB7HHMvZxEFa6ZRhpTImbXF1WQS0fCc_xU"
```

---

### 3. Install Workspace Dependencies
Open a terminal in the root directory (`/Users/kushalsharma/Desktop/untitled folder`) and run the dynamic workspace installer script. This installs all packages for the orchestrator, Express server, and React client simultaneously:
```bash
npm run install:all
```

---

### 4. Initialize Database Schema & Inject Interview Questions
To compile the SQL tables using Prisma and pre-populate **12 core practice questions** (covering SQL Joins, B-Trees, SOLID, STAR behavioral, etc.), run the database bootstrapper:
```bash
npm run db:init
```

---

### 5. Launch both Servers Concurrently
Run the startup orchestrator to boot both the Express REST API (Port 5001) and Vite React Client (Port 5173) concurrently:
```bash
npm start
```

Vite will ready the client in less than a second! Open your browser and navigate to:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🏗️ Folder Structure

```text
untitled folder/
├── package.json              # Workspace start scripts orchestrator
├── backend/                  # Express API Server
│   ├── server.js             # API bootstrappers
│   ├── services/
│   │   └── ai.service.js     # Strict JSON Gemini evaluator
│   └── prisma/
│       ├── schema.prisma     # Prisma DB configuration
│       └── seed.js           # Seeds default questions and user
└── frontend/                 # React client
    ├── postcss.config.js     # PostCSS configurations (Tailwind v4)
    └── src/
        ├── App.jsx           # App state container
        └── components/
            ├── CategoryCard.jsx      # Subject selection grids
            ├── CountdownTimer.jsx    # Circular SVG countdown clocks
            ├── PerformanceChart.jsx  # Pure SVG Score trendlines
            └── FeedbackModal.jsx     # Tabs-based grading reports
```

---

## 🛸 Deployed Production Mode
If you are ready to host the platform on the web, please check out our detailed **[Production Deployment Manual](file:///Users/kushalsharma/.gemini/antigravity/brain/d5dd5327-dbaa-4f79-979a-c4bd7d022100/deployment_guide.md)**, which outlines Neon PostgreSQL integration, Render server configuration, and Vercel CDN static builds.
