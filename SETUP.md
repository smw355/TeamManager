# Tiko Setup Instructions

## Quick Start

### 1. Start Frontend (React)
```bash
cd frontend
npm start
```
The frontend will be available at: **http://localhost:3000**

### 2. Start Backend (FastAPI) - In a new terminal
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The backend will be available at: **http://localhost:8000**
API documentation at: **http://localhost:8000/docs**

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Current Features

### Frontend:
- ✅ **Firebase Authentication** with login/signup pages
- ✅ **Protected Routes** - authentication required
- ✅ **Role-aware dashboard** (Coach, Parent, Player views)
- ✅ **Schedule page** with event management
- ✅ **Team messaging interface**
- ✅ **Tiko AI chat modal** (floating assistant connected to backend)
- ✅ **Responsive sidebar navigation**
- ✅ **Modern UI** with Tailwind CSS
- ✅ **API Integration** - frontend connected to backend

### Backend:
- ✅ **FastAPI REST API** with working endpoints
- ✅ **Claude AI integration** for team assistance
- ✅ **User, team, event, and message endpoints**
- ✅ **AI chat, practice plan generation**
- ✅ **CORS configured** for frontend
- ✅ **Health check** and API documentation

### Authentication:
- ✅ **Firebase Auth** setup (works in demo mode)
- ✅ **Email/Password** sign-in
- ✅ **Google Sign-in** support
- ✅ **Protected routes** and auth context
- ✅ **Sign out** functionality

## Test the Application

1. **Authentication**: Visit http://localhost:3000 - you'll see the login page
   - Demo credentials: `coach@demo.com` / `password123` (won't actually work without Firebase)
   - Or set up real Firebase authentication (see FIREBASE_SETUP.md)

2. **Dashboard**: After login, explore the role-based dashboard

3. **AI Chat**: Click "Ask Tiko" button to test the AI assistant (connects to backend)

4. **Backend API**: Visit http://localhost:8000/docs to see the API documentation

5. **Navigation**: Use the sidebar to explore Schedule, Messages, and other pages

## Next Steps

- [ ] Set up Firebase Authentication
- [ ] Configure PostgreSQL database
- [ ] Connect frontend to backend APIs
- [ ] Add real-time messaging
- [ ] Implement user authentication flow