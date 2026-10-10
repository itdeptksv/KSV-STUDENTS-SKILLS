import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skill Areas' },
  { to: '/competitions', label: 'Competitions' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/announcements', label: 'Announcements' },
];

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <GraduationCap size={24} className="text-teal-400" />
              <span>KSV Skill Sets</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to}
                  className={`text-sm transition-colors hover:text-teal-300 ${location.pathname === l.to ? 'text-teal-300 font-medium' : 'text-slate-200'}`}>
                  {l.label}
                </Link>
              ))}
              <Link to={isAuthenticated ? '/dashboard' : '/login'}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Link>
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
            <Link to={isAuthenticated ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-teal-300 font-medium">
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </Link>
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
