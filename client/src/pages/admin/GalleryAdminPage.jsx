import { useEffect, useState, useCallback } from 'react';
import { gallery as galleryApi, skills as skillsApi, academic } from '../../services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle, XCircle, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function GalleryAdminPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumModal, setAlbumModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillAreas, setSkillAreas] = useState([]);
  const [years, setYears] = useState([]);
  const [tab, setTab] = useState('albums');

  const albumForm = useForm();
  const itemForm = useForm();

  useEffect(() => {
    Promise.all([skillsApi.listAreas(), academic.listYears()])
      .then(([a, y]) => { setSkillAreas(a.data.data || []); setYears(y.data.data || []); });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        galleryApi.listAlbums(),
        user?.role === 'admin' ? galleryApi.pendingItems() : Promise.resolve({ data: { data: [] } }),
      ]);
      setAlbums(a.data.data || []);
      setPending(p.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onCreateAlbum = async (values) => {
    setSaving(true);
    try {
      await galleryApi.createAlbum(values);
      toast.success('Album created');
      setAlbumModal(false);
      albumForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const onSubmitItem = async (values) => {
    if (!selectedAlbum) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      if (values.file?.[0]) fd.set('file', values.file[0]);
      fd.set('consentVerified', 'true');
      await galleryApi.submitItem(selectedAlbum._id, fd);
      toast.success('Submitted for approval');
      setSubmitModal(false);
      itemForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    try { await galleryApi.approveItem(id); toast.success('Approved'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    try { await galleryApi.rejectItem(id, { reason }); toast.success('Rejected'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const areaOptions = skillAreas.map((a) => ({ value: a._id, label: a.name }));
  const yearOptions = years.map((y) => ({ value: y._id, label: y.label }));
  const typeOptions = ['photo', 'video', 'artwork', 'project'].map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gallery</h1>
        <Button onClick={() => setAlbumModal(true)}><Plus size={16} />New Album</Button>
      </div>

      <div className="flex gap-2 mb-6">
        {['albums', 'pending'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t === 'pending' ? `Pending Approval (${pending.length})` : 'Albums'}
          </button>
        ))}
      </div>

      {tab === 'albums' && (
        albums.length === 0 ? <EmptyState title="No albums yet" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <div key={album._id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Image size={18} className="text-blue-600" /></div>
                  <Badge variant={album.isPublic ? 'green' : 'gray'}>{album.isPublic ? 'Public' : 'Private'}</Badge>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{album.title}</h3>
                {album.description && <p className="text-sm text-slate-500 mb-3">{album.description}</p>}
                <Button size="sm" variant="secondary" onClick={() => { setSelectedAlbum(album); itemForm.reset(); setSubmitModal(true); }}>
                  <Plus size={13} />Add Item
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'pending' && (
        pending.length === 0 ? <EmptyState title="No pending items" /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>{['Title', 'Type', 'Album', 'Submitted By', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{item.type}</td>
                    <td className="px-4 py-3 text-slate-500">{item.album?.title}</td>
                    <td className="px-4 py-3 text-slate-500">{item.submittedBy?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(item._id)} className="p-1.5 hover:bg-green-50 rounded text-green-600"><CheckCircle size={15} /></button>
                        <button onClick={() => handleReject(item._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><XCircle size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <Modal open={albumModal} onClose={() => setAlbumModal(false)} title="New Album" size="sm">
        <form onSubmit={albumForm.handleSubmit(onCreateAlbum)} className="space-y-4">
          <Input label="Title" required {...albumForm.register('title', { required: true })} />
          <Input label="Description" {...albumForm.register('description')} />
          <Select label="Skill Area" options={areaOptions} placeholder="Select area" {...albumForm.register('skillArea')} />
          <Select label="Academic Year" options={yearOptions} placeholder="Select year" {...albumForm.register('academicYear')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setAlbumModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={submitModal} onClose={() => setSubmitModal(false)} title={`Add Item to "${selectedAlbum?.title}"`} size="md">
        <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
          <Input label="Title" required {...itemForm.register('title', { required: true })} />
          <Select label="Type" required options={typeOptions} {...itemForm.register('type', { required: true })} />
          <Input label="Caption" {...itemForm.register('caption')} />
          <Select label="Skill Area" options={areaOptions} placeholder="Select area" {...itemForm.register('skillArea')} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image File</label>
            <input type="file" accept="image/*" {...itemForm.register('file')}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700" />
          </div>
          <Input label="Or External Video URL" {...itemForm.register('externalUrl')} placeholder="https://..." />
          <p className="text-xs text-slate-400">By submitting, you confirm consent has been verified for all tagged students.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setSubmitModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Submit for Approval</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
