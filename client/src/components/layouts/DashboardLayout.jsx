import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  Users, BookOpen, Award, Image, FileText, Settings, School, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navByRole = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/users', icon: Users, label: 'Users' },
    { to: '/dashboard/classes', icon: School, label: 'Classes' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/academic', icon: BookOpen, label: 'Academic Years' },
    { to: '/dashboard/skills', icon: Award, label: 'Skill Areas' },
    { to: '/dashboard/assessments', icon: ClipboardList, label: 'Assessments' },
    { to: '/dashboard/competitions', icon: Award, label: 'Competitions' },
    { to: '/dashboard/gallery', icon: Image, label: 'Gallery' },
    { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { to: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  class_teacher: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/students', icon: Users, label: 'My Students' },
    { to: '/dashboard/assessments', icon: ClipboardList, label: 'Assessments' },
    { to: '/dashboard/competitions', icon: Award, label: 'Competitions' },
    { to: '/dashboard/gallery', icon: Image, label: 'Gallery' },
    { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
  ],
  skill_teacher: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/assessments', icon: ClipboardList, label: 'Assessments' },
    { to: '/dashboard/gallery', icon: Image, label: 'Gallery' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/dashboard/my-profile', icon: User, label: 'My Skills' },
    { to: '/dashboard/my-achievements', icon: Award, label: 'Achievements' },
  ],
  parent: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/children', icon: Users, label: 'My Children' },
  ],
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = navByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a5f] text-white flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <GraduationCap size={22} className="text-teal-400" />
          <span className="font-bold text-sm">KSV Skill Sets</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === to ? 'bg-white/15 text-white font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white w-full transition-colors">
            <LogOut size={17} />Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
            </Link>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block font-medium text-slate-700">{user?.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={14} />Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
