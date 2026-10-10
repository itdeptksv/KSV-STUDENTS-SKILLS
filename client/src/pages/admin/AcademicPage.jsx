import { useEffect, useState, useCallback } from 'react';
import { academic } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, Lock, Unlock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function AcademicPage() {
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearModal, setYearModal] = useState(false);
  const [termModal, setTermModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const yearForm = useForm();
  const termForm = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [y, t] = await Promise.all([academic.listYears(), academic.listTerms()]);
      setYears(y.data.data || []);
      setTerms(t.data.data || []);
      const current = y.data.data?.find((yr) => yr.isCurrent);
      if (current && !selectedYear) setSelectedYear(current._id);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCreateYear = async (values) => {
    setSaving(true);
    try {
      await academic.createYear(values);
      toast.success('Academic year created');
      setYearModal(false);
      yearForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const onCreateTerm = async (values) => {
    setSaving(true);
    try {
      await academic.createTerm({ ...values, academicYear: selectedYear });
      toast.success('Term created');
      setTermModal(false);
      termForm.reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const setCurrent = async (id) => {
    try { await academic.setCurrentYear(id); toast.success('Current year updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleLock = async (term) => {
    try {
      if (term.isLocked) await academic.unlockTerm(term._id);
      else await academic.lockTerm(term._id);
      toast.success(term.isLocked ? 'Term unlocked' : 'Term locked');
      load();
    } catch { toast.error('Failed'); }
  };

  const filteredTerms = terms.filter((t) => t.academicYear?._id === selectedYear || t.academicYear === selectedYear);

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Academic Years & Terms</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Years */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Academic Years</h2>
            <Button size="sm" onClick={() => setYearModal(true)}><Plus size={14} />Add Year</Button>
          </div>
          <div className="divide-y divide-slate-100">
            {years.map((y) => (
              <div key={y._id} onClick={() => setSelectedYear(y._id)}
                className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 ${selectedYear === y._id ? 'bg-blue-50' : ''}`}>
                <div>
                  <p className="font-medium text-slate-800">{y.label}</p>
                  <p className="text-xs text-slate-400">{formatDate(y.startDate)} – {formatDate(y.endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {y.isCurrent && <Badge variant="green">Current</Badge>}
                  {!y.isCurrent && (
                    <button onClick={(e) => { e.stopPropagation(); setCurrent(y._id); }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400" title="Set as current">
                      <Star size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Terms {selectedYear ? `— ${years.find((y) => y._id === selectedYear)?.label}` : ''}</h2>
            {selectedYear && <Button size="sm" onClick={() => setTermModal(true)}><Plus size={14} />Add Term</Button>}
          </div>
          <div className="divide-y divide-slate-100">
            {filteredTerms.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-400 text-center">No terms for this year.</p>
            ) : filteredTerms.map((t) => (
              <div key={t._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{formatDate(t.startDate)} – {formatDate(t.endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.isLocked && <Badge variant="red">Locked</Badge>}
                  <button onClick={() => toggleLock(t)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" title={t.isLocked ? 'Unlock' : 'Lock'}>
                    {t.isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={yearModal} onClose={() => setYearModal(false)} title="Add Academic Year" size="sm">
        <form onSubmit={yearForm.handleSubmit(onCreateYear)} className="space-y-4">
          <Input label="Label (e.g. 2024-25)" required {...yearForm.register('label', { required: true })} />
          <Input label="Start Date" type="date" required {...yearForm.register('startDate', { required: true })} />
          <Input label="End Date" type="date" required {...yearForm.register('endDate', { required: true })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setYearModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={termModal} onClose={() => setTermModal(false)} title="Add Term" size="sm">
        <form onSubmit={termForm.handleSubmit(onCreateTerm)} className="space-y-4">
          <Input label="Term Name (e.g. Term 1)" required {...termForm.register('name', { required: true })} />
          <Input label="Term Number" type="number" min="1" max="3" required {...termForm.register('termNumber', { required: true, valueAsNumber: true })} />
          <Input label="Start Date" type="date" required {...termForm.register('startDate', { required: true })} />
          <Input label="End Date" type="date" required {...termForm.register('endDate', { required: true })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setTermModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
