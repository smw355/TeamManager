import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/LocalAuthContext';
import { TeamProvider } from './contexts/TeamContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Messages from './pages/Messages';
import Roster from './pages/Roster';
import ScheduledPractices from './pages/ScheduledPractices';
import PracticePlans from './pages/PracticePlans';
import ActivityLibrary from './pages/ActivityLibrary';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <Dashboard user={currentUser!} />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <Schedule />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <Messages />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/roster" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <Roster />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/practice-plans" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <PracticePlans />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/scheduled-practices" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <ScheduledPractices />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
          <Route path="/activity-library" element={
            <ProtectedRoute>
              <TeamProvider userId={currentUser!.id}>
                <Layout user={currentUser!}>
                  <ActivityLibrary />
                </Layout>
              </TeamProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
