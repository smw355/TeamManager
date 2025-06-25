# Firebase Authentication Setup Guide

## 🔥 Firebase Setup (Optional for Demo)

### For Development/Demo Mode:
The app will work with mock Firebase configuration. You'll see a demo login screen but authentication won't actually work until you set up a real Firebase project.

### For Production Setup:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it "Tiko" or your preferred name
   - Enable Google Analytics (optional)

2. **Enable Authentication:**
   - In your Firebase project, go to "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
   - Enable "Google" (optional)

3. **Get Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" icon to add a web app
   - Register app with nickname "Tiko Frontend"
   - Copy the configuration object

4. **Configure Environment:**
   - Copy `frontend/.env.example` to `frontend/.env`
   - Replace the values with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   # ... etc
   ```

## 🚀 Testing Authentication

### Demo Mode (No Firebase setup needed):
1. Start both servers
2. Visit http://localhost:3000
3. You'll see the login page with demo credentials
4. The app uses mock authentication for development

### With Real Firebase:
1. Complete Firebase setup above
2. Create test user in Firebase Console
3. Use real email/password to sign in
4. Google Sign-in will also work if enabled

## 🎯 Current Authentication Features

✅ **Login Page**: Beautiful branded login with email/password and Google sign-in
✅ **Protected Routes**: All app pages require authentication
✅ **Auth Context**: Global user state management
✅ **Sign Out**: Working sign-out functionality in user menu
✅ **Loading States**: Proper loading indicators during auth
✅ **Error Handling**: User-friendly error messages
✅ **Auto-Redirect**: Redirects to login when not authenticated