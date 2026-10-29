# Skill & Career Development Platform

A full-stack web application that helps users manage their skills, track professional development, explore career paths, and build a professional portfolio.

## Live Demo

- **Live Demo:** [https://skill-career-platform.onrender.com/](https://skill-career-platform.onrender.com/)
- **GitHub Repository:** [https://github.com/Sahan619/skill-career-development-platform.git](https://github.com/Sahan619/skill-career-development-platform.git)

## Screenshots

No application screenshots are currently included in the repository. Capture and save the following pages in `docs/screenshots/`, then add them here:

- Login page: `docs/screenshots/login.png`
- Main dashboard: `docs/screenshots/dashboard.png`
- Skills or progress tracking page: `docs/screenshots/skills-progress.png`
- Career roadmap or portfolio page: `docs/screenshots/roadmap-portfolio.png`

## Overview

The Skill & Career Development Platform brings skill management, career planning, progress tracking, and portfolio building into one place. It also integrates Gemini AI to generate personalized career recommendations and learning resources.

## Features

### User Authentication
- User registration and login.
- JWT-based authentication for protected API endpoints.

### Profile Management
- View and update profile information.
- Upload a profile photo using Cloudinary.

### Skill Management
- Add, view, update, and delete skills.
- Organize and manage professional skills.

### Progress Tracking
- Record and manage learning progress.
- Track progress toward professional development goals.

### Career Path Recommendations
- Explore career paths.
- Generate AI-powered career recommendations using Gemini.
- Select a career path to guide your development.

### Personalized Learning Roadmap
- Explore skills associated with a selected career path.
- Generate learning resources, including courses and books, using Gemini AI.
- View suggested learning durations and practical tasks.

### Professional Portfolio
- Manage portfolio projects.
- Add project information and upload project images.
- Remove projects when they are no longer needed.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| AI Integration | Google Gemini API |
| Image Storage | Cloudinary |
| API Communication | Axios / Fetch API |
| Deployment | Render (planned or in progress) |

## Project Structure

```text
skill-career-development-platform/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
├── server/
│   ├── models/
│   ├── middleware/
│   ├── index.js
│   └── package.json
└── README.md
```

*Note: The structure above highlights the main project directories. Individual files may differ as development continues.*

## Prerequisites

Install the following before running the project locally:

- Node.js and npm
- A MongoDB database, such as MongoDB Atlas
- A Google Gemini API key
- A Cloudinary account for image uploads

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sahan619/skill-career-development-platform.git
cd skill-career-development-platform
```

### 2. Configure the backend

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the example values with your own credentials. Set `MONGO_URI` to your MongoDB connection string.

Start the backend:

```bash
npm start
```

The backend should run on `http://localhost:5000`, provided that port 5000 is available.

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `GEMINI_API_KEY` | Access to Gemini AI services |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `VITE_API_URL` | Base URL used by the frontend to communicate with the backend |

Never commit real credentials or API keys to GitHub. Keep environment files out of version control.

## API Overview

The backend exposes REST API endpoints for:

- Authentication and user profiles
- Profile photo uploads
- Skill management
- Progress tracking
- Career path retrieval and recommendations
- Selected career paths
- AI-generated roadmap resources
- Portfolio project management and image uploads

Protected endpoints require valid authentication where applicable.

## Deployment

The application can be deployed using Render:

- **Frontend:** Render Static Site
- **Backend:** Render Web Service
- **Database:** MongoDB Atlas
- **Image storage:** Cloudinary
- **AI services:** Google Gemini API

For deployment, configure the backend environment variables in Render and set `VITE_API_URL` to the deployed backend URL in the frontend's build environment. Rebuild the frontend after changing its environment variables.

The backend must also permit requests from the deployed frontend through its CORS configuration.

## Future Improvements

- Persist generated learning resources for reuse.
- Add automated backend and frontend tests.
- Improve validation, error handling, and loading states.
- Add more detailed progress analytics.
- Enhance deployment automation with CI/CD.

## Author

**Sahan Sampath**

Computer Engineering Undergraduate  
University of Ruhuna, Sri Lanka

GitHub: [Sahan619](https://github.com/Sahan619)

---

*Developed as a full-stack software engineering portfolio project focused on career development, REST APIs, authentication, database integration, and AI-powered learning support.*
