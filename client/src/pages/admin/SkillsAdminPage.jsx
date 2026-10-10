import { useEffect, useState, useCallback } from 'react';
import { skills as skillsApi } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, ChevronRight, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkillsAdminPage() {
  const [areas, setAreas] = useState([]);
  const [subSkills, setSubSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [areaModal, setAreaModal] = useState(false);
  const [subModal, setSubModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [saving, setSaving] = useState(false);

  const areaForm = useForm();
  const subForm = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([skillsApi.listAreas({ active: 'false' }), skillsApi.listSubSkills({ active: 'false' })]);
      setAreas(a.data.data || []);
      setSubSkills(s.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreateArea = () => { setEditingArea(null); areaForm.reset({ name: '', description: '', color: '#3b82f6' }); setAreaModal(true); };
  const openEditArea = (a) => { setEditingArea(a); areaForm.reset({ name: a.name, description: a.description || '', color: a.color || '#3b82f6', isActive: a.isActive }); setAreaModal(true); };

  const onSaveArea = async (values) => {
    setSaving(true);
    try {
      if (editingArea) await skillsApi.updateArea(editingArea._id, values);
      else await skillsApi.createArea(values);
      toast.success(editingArea ? 'Updated' : 'Created');
      setAreaModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const onSaveSubSkill = async (values) => {
    if (!selected) return;
    setSaving(true);
    try {
      await skillsApi.createSubSkill({ ...values, skillArea: selected._id });
      toast.success('Sub-skill created');
      setSubModal(false);
      subForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const areaSubSkills = subSkills.filter((s) => s.skillArea?._id === selected?._id || s.skillArea === selected?._id);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Skill Areas & Sub-Skills</h1>
        <Button onClick={openCreateArea}><Plus size={16} />Add Skill Area</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">Skill Areas</h2></div>
          <div className="divide-y divide-slate-100">
            {areas.map((area) => (
              <div key={area._id} onClick={() => setSelected(area)}
                className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 ${selected?._id === area._id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color || '#3b82f6' }} />
                  <div>
                    <p className="font-medium text-slate-800">{area.name}</p>
                    <p className="text-xs text-slate-400">{subSkills.filter((s) => s.skillArea?._id === area._id || s.skillArea === area._id).length} sub-skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={area.isActive ? 'green' : 'gray'}>{area.isActive ? 'Active' : 'Disabled'}</Badge>
                  <button onClick={(e) => { e.stopPropagation(); openEditArea(area); }} className="p-1 hover:bg-slate-100 rounded text-slate-400"><Edit size={14} /></button>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Sub-Skills — {selected.name}</h2>
              <Button size="sm" onClick={() => { subForm.reset(); setSubModal(true); }}><Plus size={14} />Add</Button>
            </div>
            <div className="divide-y divide-slate-100">
              {areaSubSkills.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-400 text-center">No sub-skills yet.</p>
              ) : areaSubSkills.map((s) => (
                <div key={s._id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm text-slate-700">{s.name}</p>
                  <Badge variant={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'Active' : 'Disabled'}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={areaModal} onClose={() => setAreaModal(false)} title={editingArea ? 'Edit Skill Area' : 'Add Skill Area'} size="sm">
        <form onSubmit={areaForm.handleSubmit(onSaveArea)} className="space-y-4">
          <Input label="Name" required {...areaForm.register('name', { required: true })} />
          <Input label="Description" {...areaForm.register('description')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Color</label>
            <input type="color" {...areaForm.register('color')} className="h-10 w-20 rounded border border-slate-300 cursor-pointer" />
          </div>
          {editingArea && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...areaForm.register('isActive')} />
              Active
            </label>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setAreaModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingArea ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={subModal} onClose={() => setSubModal(false)} title={`Add Sub-Skill to ${selected?.name}`} size="sm">
        <form onSubmit={subForm.handleSubmit(onSaveSubSkill)} className="space-y-4">
          <Input label="Sub-Skill Name" required {...subForm.register('name', { required: true })} />
          <Input label="Description" {...subForm.register('description')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setSubModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
