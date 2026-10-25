import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const DEMO_ACCOUNTS = [
  { role: 'admin',         label: 'Admin',          email: 'admin@demo.ksv',        password: 'Demo@1234', color: 'bg-blue-100 text-blue-800' },
  { role: 'class_teacher', label: 'Class Teacher',  email: 'classteacher@demo.ksv', password: 'Demo@1234', color: 'bg-teal-100 text-teal-800' },
  { role: 'skill_teacher', label: 'Skills Teacher', email: 'skillteacher@demo.ksv', password: 'Demo@1234', color: 'bg-purple-100 text-purple-800' },
];

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  if (user) {
    return <Navigate to="/skills" replace />;
  }

  const fillDemo = (account) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
  };

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome, ${loggedUser.name}!`);
      navigate('/skills', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0d9488] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Demo credentials panel — shown only in demo mode */}
        {DEMO_MODE && (
          <div className="bg-white/95 rounded-2xl shadow-xl border border-amber-200">
            <button
              type="button"
              onClick={() => setDemoOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-amber-800 bg-amber-50 rounded-t-2xl hover:bg-amber-100 transition-colors"
            >
              <span>🎓 Demo Login Credentials</span>
              {demoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {demoOpen && (
              <div className="px-4 pb-4 pt-2 space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  Development only — click <strong>Use</strong> to auto-fill credentials, then click Sign In.
                </p>
                {DEMO_ACCOUNTS.map((a) => (
                  <div key={a.role} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${a.color}`}>
                        {a.label}
                      </span>
                      <span className="text-xs text-slate-600 truncate">{a.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillDemo(a)}
                      className="shrink-0 text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-700 rounded-2xl mb-4">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">KSV Skill Sets</h1>
            <p className="text-slate-500 text-sm mt-1">Staff Portal (Admin & Teachers)</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@school.edu"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
