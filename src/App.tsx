import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Layout/Navigation';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import RecordDream from './pages/RecordDream';
import Profile from './pages/Profile';
import History from './pages/History';
import SharedDream from './pages/SharedDream';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
          />
          
          {/* Public Shared Dream Route */}
          <Route
            path="/shared/:token"
            element={<SharedDream />}
          />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <>
                <Navigation />
                {isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
              </>
            }
          />
          <Route
            path="/journal"
            element={
              <>
                <Navigation />
                {isAuthenticated ? <Journal /> : <Navigate to="/login" />}
              </>
            }
          />
          <Route
            path="/record-dream"
            element={
              <>
                <Navigation />
                {isAuthenticated ? <RecordDream /> : <Navigate to="/login" />}
              </>
            }
          />
          <Route
            path="/history"
            element={
              <>
                <Navigation />
                {isAuthenticated ? <History /> : <Navigate to="/login" />}
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Navigation />
                {isAuthenticated ? <Profile /> : <Navigate to="/login" />}
              </>
            }
          />
          
          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;