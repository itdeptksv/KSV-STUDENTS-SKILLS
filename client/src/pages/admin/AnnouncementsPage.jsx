import { useEffect, useState, useCallback } from 'react';
import { announcements as annApi } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function AnnouncementsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await annApi.list(); setData(res.data.data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); reset({ title: '', content: '', isPublic: false }); setModal(true); };
  const openEdit = (a) => { setEditing(a); reset({ title: a.title, content: a.content, isPublic: a.isPublic }); setModal(true); };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) await annApi.update(editing._id, values);
      else await annApi.create(values);
      toast.success(editing ? 'Updated' : 'Created');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
        <Button onClick={openCreate}><Plus size={16} />New Announcement</Button>
      </div>

      {data.length === 0 ? <EmptyState title="No announcements yet" /> : (
        <div className="space-y-4">
          {data.map((a) => (
            <div key={a._id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{a.title}</h3>
                    <Badge variant={a.isPublic ? 'green' : 'gray'}>{a.isPublic ? 'Public' : 'Internal'}</Badge>
                    <Badge variant={a.isActive ? 'blue' : 'red'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{a.content}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
                </div>
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 ml-4"><Edit size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" required {...register('title', { required: true })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea {...register('content', { required: true })} rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('isPublic')} className="rounded" />
            <span>Visible to public (website)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="rounded" />
            <span>Active</span>
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Publish'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
