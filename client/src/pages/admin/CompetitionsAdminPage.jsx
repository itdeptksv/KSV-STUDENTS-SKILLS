import { useEffect, useState, useCallback } from 'react';
import { competitions as compApi, skills as skillsApi, classes as classesApi, academic } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, Eye, Edit, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const STATUS_VARIANT = { draft: 'gray', upcoming: 'blue', open: 'green', closed: 'yellow', results_out: 'teal', cancelled: 'red' };
const VALID_NEXT = { draft: ['upcoming', 'cancelled'], upcoming: ['open', 'cancelled'], open: ['closed', 'cancelled'], closed: ['results_out'] };

export default function CompetitionsAdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillAreas, setSkillAreas] = useState([]);
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    Promise.all([skillsApi.listAreas(), classesApi.list(), academic.listYears()])
      .then(([a, c, y]) => { setSkillAreas(a.data.data || []); setClasses(c.data.data || []); setYears(y.data.data || []); });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await compApi.list({ page, limit: 20 });
      setData(res.data.data || []);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await compApi.create(values);
      toast.success('Competition created');
      setCreateModal(false);
      reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (comp, newStatus) => {
    try {
      await compApi.updateStatus(comp._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const areaOptions = skillAreas.map((a) => ({ value: a._id, label: a.name }));
  const yearOptions = years.map((y) => ({ value: y._id, label: y.label }));
  const formatOptions = ['individual', 'team', 'class', 'house'].map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }));
  const levelOptions = ['school', 'inter_school', 'district', 'state', 'national'].map((l) => ({ value: l, label: l.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Competitions</h1>
        {isAdmin && <Button onClick={() => { reset(); setCreateModal(true); }}><Plus size={16} />New Competition</Button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="No competitions yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>{['Title', 'Event Date', 'Format', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.title}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.eventDate)}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{c.format}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[c.status]}>{c.status?.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(c); setDetailModal(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Eye size={14} /></button>
                        {isAdmin && VALID_NEXT[c.status]?.map((next) => (
                          <button key={next} onClick={() => handleStatusChange(c, next)}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                            → {next.replace('_', ' ')}
                          </button>
                        ))}
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

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Competition" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Title" required {...register('title', { required: true })} />
          </div>
          <Select label="Skill Area" options={areaOptions} placeholder="Select area" {...register('skillArea')} />
          <Select label="Academic Year" options={yearOptions} placeholder="Select year" {...register('academicYear')} />
          <Select label="Format" options={formatOptions} {...register('format')} />
          <Select label="Level" options={levelOptions} {...register('level')} />
          <Input label="Event Date" type="date" required {...register('eventDate', { required: true })} />
          <Input label="Registration Deadline" type="date" {...register('registrationDeadline')} />
          <Input label="Venue" {...register('venue')} />
          <Input label="Time Limit (minutes)" type="number" {...register('timeLimit', { valueAsNumber: true })} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Competition Details" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Title', selected.title], ['Status', selected.status?.replace('_', ' ')],
                ['Event Date', formatDate(selected.eventDate)], ['Venue', selected.venue],
                ['Format', selected.format], ['Level', selected.level],
              ].map(([k, v]) => (
                <div key={k}><p className="text-xs text-slate-400">{k}</p><p className="font-medium text-slate-800">{v || '—'}</p></div>
              ))}
            </div>
            {selected.description && <div className="pt-2 border-t border-slate-100"><p className="text-xs text-slate-400 mb-1">Description</p><p className="text-slate-700">{selected.description}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
