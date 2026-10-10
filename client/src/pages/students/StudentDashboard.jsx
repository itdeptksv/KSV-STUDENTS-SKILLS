import { useEffect, useState } from 'react';
import { assessments as assessmentsApi, reports } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { LEVEL_LABELS, LEVEL_COLORS, formatDate, downloadBlob } from '../../utils/helpers';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    assessmentsApi.list({ limit: 100, status: 'approved' })
      .then((res) => {
        const data = res.data.data || [];
        setAssessmentData(data);
        if (data[0]?.student?._id) setStudentId(data[0].student._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async () => {
    if (!studentId) return;
    setDownloading(true);
    try {
      const res = await reports.studentReportPdf(studentId);
      downloadBlob(res.data, 'my_skill_report.pdf');
    } catch { toast.error('Failed to download'); }
    finally { setDownloading(false); }
  };

  // Build radar chart data by skill area
  const radarData = Object.entries(
    assessmentData.reduce((acc, a) => {
      const area = a.skillArea?.name;
      if (!area) return acc;
      if (!acc[area]) acc[area] = { total: 0, count: 0 };
      acc[area].total += a.level;
      acc[area].count++;
      return acc;
    }, {})
  ).map(([area, v]) => ({ area: area.substring(0, 10), level: +(v.total / v.count).toFixed(1) }));

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Skills</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome, {user?.name}</p>
        </div>
        {studentId && (
          <Button variant="secondary" onClick={downloadPdf} loading={downloading} size="sm">
            <Download size={14} />Download Report
          </Button>
        )}
      </div>

      {assessmentData.length === 0 ? (
        <EmptyState title="No assessments yet" description="Your approved skill assessments will appear here." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {radarData.length >= 3 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Skill Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <Radar dataKey="level" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Recent Assessments</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {assessmentData.slice(0, 20).map((a) => (
                <div key={a._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.subSkill?.name}</p>
                    <p className="text-xs text-slate-400">{a.skillArea?.name} · {a.term?.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[a.level]}`}>
                    L{a.level} {LEVEL_LABELS[a.level]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
