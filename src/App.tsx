import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubjectList from './pages/SubjectList';
import ChapterPage from './pages/ChapterPage';
import { UserRole } from './types';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen italic font-black uppercase tracking-widest text-slate-400">Synchronizing Identity...</div>;
  if (!user) return <Navigate to="/" />;
  
  if (user.isBlocked) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-8">
           <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <span className="text-4xl text-rose-500 font-bold italic">!</span>
           </div>
           <h2 className="text-4xl font-display font-black text-white italic tracking-tight">Access Restricted</h2>
           <p className="text-slate-400 font-medium leading-relaxed">Your network identity has been restricted by the Hub Administrators. Please contact system support for re-calibration.</p>
           <button 
             onClick={() => window.location.href = '/'}
             className="px-10 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-rose-500 hover:text-white transition-all"
           >
             Return to Landing
           </button>
        </div>
      </div>
    );
  }

  if (adminOnly && user.role !== UserRole.ADMIN) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/class/:classId/subjects" 
            element={
              <ProtectedRoute>
                <SubjectList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chapter/:chapterId" 
            element={
              <ProtectedRoute>
                <ChapterPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
