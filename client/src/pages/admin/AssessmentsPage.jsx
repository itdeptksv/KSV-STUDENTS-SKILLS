import { useEffect, useState, useCallback } from 'react';
import { assessments as assessmentsApi, students as studentsApi, skills as skillsApi, academic, classes as classesApi } from '../../services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle, XCircle, Eye, FileText, Image as ImageIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, LEVEL_LABELS, LEVEL_COLORS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { storeFile } from '../../services/indexedDb';

const STATUS_VARIANT = { draft: 'gray', submitted: 'yellow', approved: 'green', rejected: 'red' };

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [skillAreas, setSkillAreas] = useState([]);
  const [subSkills, setSubSkills] = useState([]);
  const [terms, setTerms] = useState([]);
  const [years, setYears] = useState([]);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceDesc, setEvidenceDesc] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const watchClass = watch('class');
  const watchSkillArea = watch('skillArea');

  useEffect(() => {
    Promise.all([
      classesApi.list(), skillsApi.listAreas(), skillsApi.listSubSkills(),
      academic.listTerms(), academic.listYears(),
    ]).then(([c, a, s, t, y]) => {
      setClasses(c.data.data || []);
      setSkillAreas(a.data.data || []);
      setSubSkills(s.data.data || []);
      setTerms(t.data.data || []);
      setYears(y.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (watchClass) {
      studentsApi.list({ class: watchClass, limit: 100 }).then((r) => setStudents(r.data.data || []));
    }
  }, [watchClass]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assessmentsApi.list({ page, limit: 20, status: statusFilter });
      setData(res.data.data || []);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load assessments'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const onSubmitForm = async (values) => {
    setSaving(true);
    try {
      let evidence = [];
      if (evidenceFile) {
        const stored = await storeFile(evidenceFile, evidenceDesc);
        evidence.push({
          id: stored.id,
          name: stored.name,
          type: stored.type,
          size: stored.size,
          description: evidenceDesc || stored.name,
          dataUrl: stored.dataUrl,
          createdAt: stored.createdAt,
        });
      }

      await assessmentsApi.create({
        ...values,
        assessmentDate: values.assessmentDate || new Date().toISOString(),
        level: parseInt(values.level, 10),
        evidence,
      });
      toast.success('Assessment created');
      setCreateModal(false);
      reset();
      setEvidenceFile(null);
      setEvidenceDesc('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleSubmitForReview = async (id) => {
    try { await assessmentsApi.submit(id); toast.success('Submitted for review'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    try { await assessmentsApi.approve(id, {}); toast.success('Approved'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const note = prompt('Rejection reason:');
    if (note === null) return;
    try { await assessmentsApi.reject(id, { note }); toast.success('Rejected'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const classOptions = classes.map((c) => ({ value: c._id, label: c.name }));
  const studentOptions = students.map((s) => ({ value: s._id, label: `${s.name} (${s.admissionNumber})` }));
  const areaOptions = skillAreas.map((a) => ({ value: a._id, label: a.name }));
  const subSkillOptions = subSkills.filter((s) => s.skillArea?._id === watchSkillArea || s.skillArea === watchSkillArea).map((s) => ({ value: s._id, label: s.name }));
  const termOptions = terms.map((t) => ({ value: t._id, label: `${t.name} (${t.academicYear?.label || ''})` }));
  const yearOptions = years.map((y) => ({ value: y._id, label: y.label }));
  const levelOptions = [1, 2, 3, 4].map((l) => ({ value: l, label: `Level ${l} — ${LEVEL_LABELS[l]}` }));

  const canCreate = ['admin', 'class_teacher', 'skill_teacher'].includes(user?.role);
  const canApprove = user?.role === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
        {canCreate && <Button onClick={() => { reset(); setCreateModal(true); }}><Plus size={16} />New Assessment</Button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
          {['', 'draft', 'submitted', 'approved', 'rejected'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="No assessments found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>{['Student', 'Skill Area', 'Sub-Skill', 'Level', 'Term', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.student?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{a.skillArea?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{a.subSkill?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[a.level]}`}>
                        L{a.level} {LEVEL_LABELS[a.level]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.term?.name}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(a); setViewModal(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Eye size={14} /></button>
                        {canApprove && a.status === 'submitted' && (
                          <>
                            <button onClick={() => handleApprove(a._id)} className="p-1.5 hover:bg-green-50 rounded text-green-600"><CheckCircle size={14} /></button>
                            <button onClick={() => handleReject(a._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><XCircle size={14} /></button>
                          </>
                        )}
                        {canCreate && a.status === 'draft' && (
                          <button onClick={() => handleSubmitForReview(a._id)} className="text-xs text-blue-600 hover:underline px-1">Submit</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Assessment" size="lg">
        <form onSubmit={handleSubmit(onSubmitForm)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Class" required options={classOptions} placeholder="Select class" {...register('class', { required: true })} />
          <Select label="Student" required options={studentOptions} placeholder="Select student" {...register('student', { required: true })} />
          <Select label="Skill Area" required options={areaOptions} placeholder="Select area" {...register('skillArea', { required: true })} />
          <Select label="Sub-Skill" required options={subSkillOptions} placeholder="Select sub-skill" {...register('subSkill', { required: true })} />
          <Select label="Academic Year" required options={yearOptions} placeholder="Select year" {...register('academicYear', { required: true })} />
          <Select label="Term" required options={termOptions} placeholder="Select term" {...register('term', { required: true })} />
          <Select label="Level" required options={levelOptions} placeholder="Select level" {...register('level', { required: true })} />
          <Input label="Assessment Date" type="date" {...register('assessmentDate')} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea {...register('remarks')} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Evidence Attachment (Photo / Document)</label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {evidenceFile && (
              <div className="mt-2">
                <Input
                  label="Photo / File Description"
                  placeholder="e.g. Photo of student artwork, project or certificate"
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setCreateModal(false); setEvidenceFile(null); setEvidenceDesc(''); }}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Draft</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Assessment Details" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Student', selected.student?.name],
                ['Skill Area', selected.skillArea?.name],
                ['Sub-Skill', selected.subSkill?.name],
                ['Level', `${selected.level} — ${LEVEL_LABELS[selected.level]}`],
                ['Term', selected.term?.name],
                ['Date', formatDate(selected.assessmentDate)],
                ['Status', selected.status],
                ['Created By', selected.createdBy?.name],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-medium text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {selected.remarks && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Remarks</p>
                <p className="text-slate-700">{selected.remarks}</p>
              </div>
            )}
            {selected.evidence && selected.evidence.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Evidence & Photos</p>
                <div className="space-y-2">
                  {selected.evidence.map((ev, i) => (
                    <div key={ev.id || i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      {ev.dataUrl && (ev.type?.startsWith('image/') || ev.dataUrl.startsWith('data:image/')) && (
                        <div className="mb-2">
                          <img src={ev.dataUrl} alt={ev.description || ev.name} className="max-h-48 rounded object-cover border border-slate-200" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ev.type?.startsWith('image/') ? <ImageIcon size={16} className="text-blue-600 shrink-0" /> : <FileText size={16} className="text-amber-600 shrink-0" />}
                          <span className="font-medium text-slate-800 text-xs truncate max-w-[200px]">{ev.name}</span>
                          {ev.size ? <span className="text-xs text-slate-400">({Math.round(ev.size / 1024)} KB)</span> : null}
                        </div>
                        {ev.dataUrl && (
                          <a href={ev.dataUrl} download={ev.name} className="text-xs text-blue-600 hover:underline flex items-center gap-1 shrink-0">
                            <Download size={12} /> Download
                          </a>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-600 mt-1 pl-6">
                          <strong>Description:</strong> {ev.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
