import { useEffect, useState } from 'react';
import { parents, assessments as assessmentsApi, reports } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { LEVEL_LABELS, LEVEL_COLORS, downloadBlob } from '../../utils/helpers';
import { Download, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childAssessments, setChildAssessments] = useState([]);
  const [assLoading, setAssLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    parents.myChildren()
      .then((res) => {
        const data = res.data.data || [];
        setChildren(data);
        if (data[0]) setSelectedChild(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setAssLoading(true);
    assessmentsApi.list({ student: selectedChild._id, status: 'approved', limit: 50 })
      .then((res) => setChildAssessments(res.data.data || []))
      .catch(() => {})
      .finally(() => setAssLoading(false));
  }, [selectedChild]);

  const downloadPdf = async () => {
    if (!selectedChild) return;
    setDownloading(true);
    try {
      const res = await reports.studentReportPdf(selectedChild._id);
      downloadBlob(res.data, `${selectedChild.name}_skill_report.pdf`);
    } catch { toast.error('Failed to download'); }
    finally { setDownloading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Parent Dashboard</h1>

      {children.length === 0 ? (
        <EmptyState title="No children linked" description="Contact the school administrator to link your children to this account." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Children list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 text-sm">My Children</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {children.map((child) => (
                <button key={child._id} onClick={() => setSelectedChild(child)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left ${selectedChild?._id === child._id ? 'bg-blue-50' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{child.name}</p>
                    <p className="text-xs text-slate-400">{child.class?.name} {child.section}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Child details */}
          <div className="lg:col-span-3">
            {selectedChild && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{selectedChild.name}</h2>
                    <p className="text-sm text-slate-500">{selectedChild.class?.name} · Section {selectedChild.section} · {selectedChild.admissionNumber}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={downloadPdf} loading={downloading}>
                    <Download size={14} />Download Report
                  </Button>
                </div>

                {assLoading ? <PageLoader /> : childAssessments.length === 0 ? (
                  <EmptyState title="No approved assessments yet" />
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">Skill Assessments</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                          <tr>{['Skill Area', 'Sub-Skill', 'Level', 'Term', 'Remarks'].map((h) => (
                            <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {childAssessments.map((a) => (
                            <tr key={a._id} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 text-slate-700">{a.skillArea?.name}</td>
                              <td className="px-4 py-2.5 text-slate-600">{a.subSkill?.name}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[a.level]}`}>
                                  L{a.level} {LEVEL_LABELS[a.level]}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-500">{a.term?.name}</td>
                              <td className="px-4 py-2.5 text-slate-400 text-xs">{a.remarks || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
