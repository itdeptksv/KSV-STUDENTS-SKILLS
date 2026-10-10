import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { competitions as compApi } from '../../services';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';
import { Trophy, Calendar, MapPin } from 'lucide-react';

const STATUS_VARIANT = { upcoming: 'blue', open: 'green', closed: 'gray', results_out: 'teal', cancelled: 'red', draft: 'gray' };

export default function CompetitionsPage() {
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    compApi.list({ limit: 50 }).then((r) => setComps(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? comps.filter((c) => c.status === filter) : comps;

  if (loading) return <PublicLayout><PageLoader /></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Competitions</h1>
        <p className="text-slate-500 mb-6">Skill competitions open to KSV students.</p>
        <div className="flex gap-2 mb-8 flex-wrap">
          {['', 'upcoming', 'open', 'closed', 'results_out'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s ? s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No competitions found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((comp) => (
              <Link key={comp._id} to={`/competitions/${comp._id}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Trophy size={20} className="text-yellow-500 mt-0.5" />
                  <Badge variant={STATUS_VARIANT[comp.status] || 'gray'}>{comp.status?.replace('_', ' ')}</Badge>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{comp.title}</h3>
                {comp.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{comp.description}</p>}
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1"><Calendar size={12} />{formatDate(comp.eventDate)}</div>
                  {comp.venue && <div className="flex items-center gap-1"><MapPin size={12} />{comp.venue}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
