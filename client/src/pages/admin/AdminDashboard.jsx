import { useEffect, useState } from 'react';
import { reports } from '../../services';
import StatCard from '../../components/common/StatCard';
import { PageLoader } from '../../components/common/Spinner';
import { Users, School, ClipboardList, Image, Trophy, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reports.dashboard().then((r) => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Students" value={stats?.students} icon={Users} color="blue" />
        <StatCard title="Teachers" value={stats?.teachers} icon={School} color="teal" />
        <StatCard title="Pending Assessments" value={stats?.assessmentsPending} icon={ClipboardList} color="yellow" />
        <StatCard title="Gallery Pending" value={stats?.galleryPending} icon={Image} color="purple" />
        <StatCard title="Active Competitions" value={stats?.upcomingComps} icon={Trophy} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/users', label: 'Manage Users', icon: Users, desc: 'Add and manage staff accounts' },
          { to: '/dashboard/students', label: 'Manage Students', icon: Users, desc: 'View and manage student records' },
          { to: '/dashboard/assessments', label: 'Review Assessments', icon: ClipboardList, desc: 'Approve or reject submitted assessments' },
          { to: '/dashboard/competitions', label: 'Competitions', icon: Trophy, desc: 'Create and manage competitions' },
          { to: '/dashboard/gallery', label: 'Gallery Approvals', icon: Image, desc: 'Review gallery submissions' },
          { to: '/dashboard/reports', label: 'Reports', icon: Bell, desc: 'Generate and download reports' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600"><Icon size={20} /></div>
            <div>
              <p className="font-semibold text-slate-800">{label}</p>
              <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
