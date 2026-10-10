import { useState } from 'react';
import { reports, students as studentsApi } from '../../services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Spinner';
import { FileText, Download, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const [studentId, setStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const searchStudents = async () => {
    if (!studentSearch.trim()) return;
    try {
      const res = await studentsApi.list({ search: studentSearch, limit: 10 });
      setStudentResults(res.data.data || []);
    } catch { toast.error('Search failed'); }
  };

  const loadReport = async (id) => {
    setLoading(true);
    setStudentId(id);
    try {
      const res = await reports.studentReport(id);
      setReportData(res.data.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const downloadPdf = async () => {
    if (!studentId) return;
    setDownloading(true);
    try {
      const res = await reports.studentReportPdf(studentId);
      downloadBlob(res.data, `skill_report.pdf`);
    } catch { toast.error('Failed to download PDF'); }
    finally { setDownloading(false); }
  };

  // Build chart data from assessments
  const chartData = reportData ? Object.entries(
    reportData.assessments.reduce((acc, a) => {
      const area = a.skillArea?.name || 'Unknown';
      if (!acc[area]) acc[area] = { area, total: 0, count: 0 };
      acc[area].total += a.level;
      acc[area].count++;
      return acc;
    }, {})
  ).map(([, v]) => ({ area: v.area.substring(0, 12), avgLevel: +(v.total / v.count).toFixed(1) })) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} />Student Skill Report</h2>
        <div className="flex gap-3 mb-4">
          <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
            placeholder="Search student by name or admission no..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button variant="secondary" onClick={searchStudents}>Search</Button>
        </div>

        {studentResults.length > 0 && (
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 mb-4 max-h-48 overflow-y-auto">
            {studentResults.map((s) => (
              <button key={s._id} onClick={() => { loadReport(s._id); setStudentResults([]); setStudentSearch(s.name); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left text-sm">
                <span className="font-medium text-slate-800">{s.name}</span>
                <span className="text-slate-400 text-xs">{s.admissionNumber} · {s.class?.name} {s.section}</span>
              </button>
            ))}
          </div>
        )}

        {loading && <PageLoader />}

        {reportData && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-800">{reportData.student?.name}</p>
                <p className="text-sm text-slate-500">{reportData.student?.class?.name} {reportData.student?.section} · {reportData.student?.admissionNumber}</p>
              </div>
              <Button onClick={downloadPdf} loading={downloading} variant="secondary" size="sm">
                <Download size={14} />Download PDF
              </Button>
            </div>

            {chartData.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2"><BarChart2 size={16} />Average Level by Skill Area</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="avgLevel" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {reportData.assessments?.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No approved assessments found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>{['Skill Area', 'Sub-Skill', 'Level', 'Term', 'Remarks'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.assessments.map((a) => (
                      <tr key={a._id}>
                        <td className="px-3 py-2 text-slate-700">{a.skillArea?.name}</td>
                        <td className="px-3 py-2 text-slate-600">{a.subSkill?.name}</td>
                        <td className="px-3 py-2 font-medium text-blue-700">L{a.level}</td>
                        <td className="px-3 py-2 text-slate-500">{a.term?.name}</td>
                        <td className="px-3 py-2 text-slate-400 text-xs">{a.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
