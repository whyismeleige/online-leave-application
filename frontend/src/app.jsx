// app.jsx
// Main application component with inline authentication state

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './home-page';
import LoginPage from './login-page';
import RegisterPage from './register-page';
import DashboardPage from './dashboard-page';
import ApplyLeavePage from './apply-leave-page';
import MyLeavesPage from './my-leaves-page';
import EditLeavePage from './edit-leave-page';
import AdminPanelPage from './admin-panel-page';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Not authenticated - that's fine
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#FDFBF7'
      }}>
        <div style={{
          border: '3px solid #E7E5E4',
          borderTopColor: '#1C1917',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage user={user} isAuthenticated={isAuthenticated} />} />
        
        {/* Auth Routes - redirect if already logged in */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage setUser={setUser} />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage setUser={setUser} />} 
        />
        
        {/* Protected Routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <DashboardPage user={user} setUser={setUser} isAdmin={isAdmin} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/apply-leave" 
          element={isAuthenticated ? <ApplyLeavePage user={user} setUser={setUser} isAdmin={isAdmin} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/my-leaves" 
          element={isAuthenticated ? <MyLeavesPage user={user} setUser={setUser} isAdmin={isAdmin} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/edit-leave/:id" 
          element={isAuthenticated ? <EditLeavePage user={user} setUser={setUser} isAdmin={isAdmin} /> : <Navigate to="/login" replace />} 
        />
        
        {/* Admin Routes - require admin role */}
        <Route 
          path="/admin" 
          element={
            !isAuthenticated ? <Navigate to="/login" replace /> :
            !isAdmin ? <Navigate to="/dashboard" replace /> :
            <AdminPanelPage user={user} setUser={setUser} isAdmin={isAdmin} />
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}