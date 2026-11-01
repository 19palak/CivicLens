# CivicLens — Smart Civic Issue Reporting Platform

CivicLens is a web-based civic issue reporting and monitoring platform designed to help citizens report local problems such as potholes, garbage accumulation, water leakage, drainage issues, and broken streetlights.

The platform provides a centralized dashboard where civic issues can be reported, monitored, and analyzed, helping communities improve transparency and civic engagement.

## 🌐 Live Demo

**[Visit CivicLens](https://civic-lens-lyart.vercel.app/)**

**[GitHub Repository](https://github.com/19palak/CivicLens)**

---

## 🌍 Problem Statement

Citizens often face difficulties reporting local civic problems and tracking whether those problems have been resolved.

Traditional reporting methods can lack transparency, centralized tracking, and accessible information about the status of reported issues.

This can lead to delayed action, repeated complaints, and limited communication between citizens and civic authorities.

## 💡 Our Solution

CivicLens provides a centralized digital platform where citizens can report civic issues and monitor their status.

The platform allows users to submit issue details, upload supporting photographs, view reported problems on a community map, and explore dashboard analytics to understand the distribution and status of civic issues.

## ✨ Key Features

- **Civic Issue Reporting:** Report problems such as potholes, garbage accumulation, water leakage, drainage issues, and streetlight failures.
- **Issue Management Dashboard:** View and monitor reported civic issues through a centralized dashboard.
- **Community Map:** Visualize reported issues based on their locations.
- **Analytics Dashboard:** Explore issue statistics, categories, priorities, and statuses.
- **Issue Tracking:** Monitor reported issues through different statuses, including Under Review, In Progress, and Resolved.
- **Photo Upload:** Attach images to reports to provide visual evidence of the issue.
- **Priority Classification:** Categorize issues based on their urgency.
- **Issue Deletion:** Delete issue reports from the Issue Reports section.
- **Search and Filtering:** Search issue reports and filter them based on their status.
- **Responsive Interface:** A user-friendly interface designed for convenient issue reporting and monitoring.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Leaflet
- Leaflet

### Backend
- Python
- FastAPI

### Database
- SQLite
- SQLAlchemy

### Deployment
- Vercel — Frontend
- Render — Backend

### Tools
- Git
- GitHub
- VS Code

## 🏗️ Project Architecture

CivicLens follows a frontend-backend architecture.

```text
CivicLens/
│
├── backend/
│   ├── uploads/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── Auth.css
│   │   ├── Auth.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── .gitignore
```

## 🚀 Getting Started

Follow these steps to run CivicLens locally.

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Python 3
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/19palak/CivicLens.git
```

Navigate to the project directory:

```bash
cd CivicLens
```

### 2. Setup the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment on macOS/Linux:

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The backend will run at:

http://127.0.0.1:8000

FastAPI documentation is available at:

http://127.0.0.1:8000/docs

### 3. Setup the Frontend

Open another terminal window.

Navigate to the frontend directory from the project root:

```bash
cd CivicLens/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run at the local URL displayed in the terminal, usually:

http://localhost:5173

## 📊 Project Impact

CivicLens aims to:

- Improve accessibility of civic issue reporting.
- Encourage citizen participation in local governance.
- Provide better visibility into reported civic problems.
- Support efficient monitoring of issue statuses.
- Promote transparency and accountability in civic issue management.

## 🎯 Hackathon

**NexHack 3.0 — Build What's Next**

**Track:** Smart Society and Social Impact

## 🔮 Future Enhancements

- AI-based civic issue classification.
- Automatic prioritization of reported issues.
- Duplicate issue detection.
- Smart notifications when issue statuses change.
- Integration with municipal complaint systems.
- AI-powered analytics and insights.
- Citizen feedback and resolution ratings.

## 👥 Team

Developed by:

- Palak Jain
- Vedika Therokar

---

