import { useEffect, useState, useCallback } from 'react';
import { classes as classesApi } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const GROUP_OPTIONS = [
  { value: 'Pre-KG–2', label: 'Pre-KG – Class 2' },
  { value: 'Classes 3–5', label: 'Classes 3–5' },
  { value: 'Classes 6–8', label: 'Classes 6–8' },
  { value: 'Classes 9–12', label: 'Classes 9–12' },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [classModal, setClassModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const classForm = useForm();
  const sectionForm = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classesApi.list();
      setClasses(res.data.data || []);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCreateClass = async (values) => {
    setSaving(true);
    try {
      await classesApi.create({ ...values, order: classes.length + 1 });
      toast.success('Class created');
      setClassModal(false);
      classForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const onAddSection = async (values) => {
    if (!selected) return;
    setSaving(true);
    try {
      await classesApi.addSection(selected._id, values);
      toast.success('Section added');
      setSectionModal(false);
      sectionForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const selectedClass = classes.find((c) => c._id === selected?._id);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Classes & Sections</h1>
        <Button onClick={() => setClassModal(true)}><Plus size={16} />Add Class</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Classes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {classes.map((cls) => (
              <button key={cls._id} onClick={() => setSelected(cls)}
                className={`w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-left ${selected?._id === cls._id ? 'bg-blue-50' : ''}`}>
                <div>
                  <p className="font-medium text-slate-800">{cls.name}</p>
                  <p className="text-xs text-slate-400">{cls.classGroup} · {cls.sections?.length || 0} sections</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {selectedClass && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Sections — {selectedClass.name}</h2>
              <Button size="sm" onClick={() => setSectionModal(true)}><Plus size={14} />Add Section</Button>
            </div>
            <div className="divide-y divide-slate-100">
              {selectedClass.sections?.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-400 text-center">No sections yet.</p>
              ) : selectedClass.sections?.map((s) => (
                <div key={s._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-slate-800">Section {s.name}</p>
                    {s.classTeacher && <p className="text-xs text-slate-400">Teacher: {s.classTeacher.name}</p>}
                  </div>
                  <Badge variant={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={classModal} onClose={() => setClassModal(false)} title="Add Class" size="sm">
        <form onSubmit={classForm.handleSubmit(onCreateClass)} className="space-y-4">
          <Input label="Class Name (e.g. Class 6)" required {...classForm.register('name', { required: true })} />
          <Input label="Short Name (e.g. C6)" required {...classForm.register('shortName', { required: true })} />
          <Select label="Class Group" required options={GROUP_OPTIONS} placeholder="Select group" {...classForm.register('classGroup', { required: true })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setClassModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={sectionModal} onClose={() => setSectionModal(false)} title={`Add Section to ${selectedClass?.name}`} size="sm">
        <form onSubmit={sectionForm.handleSubmit(onAddSection)} className="space-y-4">
          <Input label="Section Name (e.g. A)" required {...sectionForm.register('name', { required: true })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setSectionModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
