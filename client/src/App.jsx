import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

import HomePage from './pages/public/HomePage';
import SkillsPage from './pages/public/SkillsPage';
import CompetitionsPage from './pages/public/CompetitionsPage';
import GalleryPage from './pages/public/GalleryPage';
import LoginPage from './pages/auth/LoginPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import StudentsPage from './pages/admin/StudentsPage';
import ClassesPage from './pages/admin/ClassesPage';
import AcademicPage from './pages/admin/AcademicPage';
import SkillsAdminPage from './pages/admin/SkillsAdminPage';
import AssessmentsPage from './pages/admin/AssessmentsPage';
import CompetitionsAdminPage from './pages/admin/CompetitionsAdminPage';
import GalleryAdminPage from './pages/admin/GalleryAdminPage';
import ReportsPage from './pages/reports/ReportsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import SettingsPage from './pages/admin/SettingsPage';
import StudentDashboard from './pages/students/StudentDashboard';
import ParentDashboard from './pages/parents/ParentDashboard';
import { announcements as annApi } from './services';
import { formatDate } from './utils/helpers';

const ADMIN = ['admin'];
const TEACHERS = ['admin', 'class_teacher', 'skill_teacher'];
const ALL_AUTH = ['admin', 'class_teacher', 'skill_teacher', 'student', 'parent'];

function RoleDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'parent') return <ParentDashboard />;
  return <AdminDashboard />;
}

function AnnouncementsPublicPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { annApi.list().then((r) => setItems(r.data.data || [])).catch(() => {}); }, []);
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-6">Announcements</h1>
        {items.length === 0 ? <p className="text-slate-400">No announcements at this time.</p> : (
          <div className="space-y-4">
            {items.map((a) => (
              <div key={a._id} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-1">{a.title}</h3>
                <p className="text-sm text-slate-600">{a.content}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

function DashboardRoutes() {
  return (
    <ProtectedRoute roles={ALL_AUTH}>
      <DashboardLayout>
        <Routes>
          <Route index element={<RoleDashboard />} />
          <Route path="users" element={<ProtectedRoute roles={ADMIN}><UsersPage /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute roles={ADMIN}><ClassesPage /></ProtectedRoute>} />
          <Route path="academic" element={<ProtectedRoute roles={ADMIN}><AcademicPage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute roles={ADMIN}><SettingsPage /></ProtectedRoute>} />
          <Route path="announcements" element={<ProtectedRoute roles={ADMIN}><AnnouncementsPage /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute roles={TEACHERS}><StudentsPage /></ProtectedRoute>} />
          <Route path="skills" element={<ProtectedRoute roles={ADMIN}><SkillsAdminPage /></ProtectedRoute>} />
          <Route path="assessments" element={<ProtectedRoute roles={TEACHERS}><AssessmentsPage /></ProtectedRoute>} />
          <Route path="competitions" element={<ProtectedRoute roles={TEACHERS}><CompetitionsAdminPage /></ProtectedRoute>} />
          <Route path="gallery" element={<ProtectedRoute roles={TEACHERS}><GalleryAdminPage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={TEACHERS}><ReportsPage /></ProtectedRoute>} />
          <Route path="my-profile" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="children" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/announcements" element={<AnnouncementsPublicPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
