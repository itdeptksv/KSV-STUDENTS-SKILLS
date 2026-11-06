import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/Spinner';
import toast from 'react-hot-toast';

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/skills', label: 'Skill Areas' },
    { to: '/gallery', label: 'Gallery' },
  ];

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <PageLoader />;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return { label: 'Admin', color: 'bg-blue-600 text-white' };
    if (role === 'class_teacher') return { label: 'Class Teacher', color: 'bg-teal-600 text-white' };
    if (role === 'skill_teacher') return { label: 'Skills Teacher', color: 'bg-purple-600 text-white' };
    return { label: 'Staff', color: 'bg-slate-600 text-white' };
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/home" className="flex items-center gap-2 font-bold text-lg">
              <GraduationCap size={24} className="text-teal-400" />
              <span>KSV Skill Sets</span>
            </Link>
            <div className="hidden md:flex items-center gap-5">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to}
                  className={`text-sm transition-colors hover:text-teal-300 ${location.pathname === l.to ? 'text-teal-300 font-medium' : 'text-slate-200'}`}>
                  {l.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Clearly visible Dashboard button */}
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-lg shadow transition-colors"
                    title={user.role === 'admin' ? 'Open Admin Dashboard' : user.role === 'class_teacher' ? 'Open Class Teacher Dashboard' : 'Open Skills Teacher Dashboard'}
                  >
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link to="/login"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  Login
                </Link>
              )}
            </div>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#162d4a] px-4 pb-4 space-y-2">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-teal-300">{l.label}</Link>
            ))}
            {user ? (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-300">{user.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="w-full text-left py-1.5 text-xs text-red-300 hover:text-red-200 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-teal-300 font-medium">
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="bg-[#1e3a5f] text-slate-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap size={20} className="text-teal-400" />
            <span className="font-semibold text-white">KSV Skill Sets</span>
          </div>
          <p className="text-sm">Student Skills Development Portal</p>
          <p className="text-xs mt-2 text-slate-400">© {new Date().getFullYear()} KSV School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
