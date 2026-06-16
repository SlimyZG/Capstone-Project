import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ 
  user: any; 
  requiredRole: string; 
  element: React.ReactNode;
}> = ({ user, requiredRole, element }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'department') return <Navigate to="/department" replace />;
    return <Navigate to="/student" replace />;
  }
  return <>{element}</>;
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Google Fonts */}
        {/* Navbar only shown when logged in (except for students and department/staff) */}
        {user && user.role !== 'student' && user.role !== 'department' && <Navbar user={user} onLogout={handleLogout} />}

        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              user
                ? <Navigate to={`/${user.role === 'admin' ? 'admin' : user.role === 'department' ? 'department' : 'student'}`} replace />
                : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/register"
            element={
              user
                ? <Navigate to="/student" replace />
                : <Register onLoginSuccess={handleLoginSuccess} />
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute user={user} requiredRole="student"
                element={<StudentDashboard />}
              />
            }
          />

          {/* Department */}
          <Route
            path="/department"
            element={
              <ProtectedRoute user={user} requiredRole="department"
                element={<DepartmentDashboard />}
              />
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredRole="admin"
                element={<AdminDashboard />}
              />
            }
          />

          {/* Root redirect */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to={`/${user.role === 'admin' ? 'admin' : user.role === 'department' ? 'department' : 'student'}`} replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <h1 className="text-6xl font-extrabold text-slate-700 mb-4">404</h1>
                <p className="text-slate-400 mb-6">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
