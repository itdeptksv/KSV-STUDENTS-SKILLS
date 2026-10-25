import { useEffect, useState, useCallback } from 'react';
import { students as studentsApi, classes as classesApi, academic } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, Search, Edit, Download, Upload, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/helpers';
import StudentPortfolio from '../../components/students/StudentPortfolio';

export default function StudentsPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importClassId, setImportClassId] = useState('');
  const [importYearId, setImportYearId] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [portfolioStudent, setPortfolioStudent] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const selectedClass = watch('class');

  useEffect(() => {
    classesApi.list().then((r) => setClasses(r.data.data || []));
    academic.listYears().then((r) => setYears(r.data.data || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsApi.list({ page, limit: 20, search, class: classFilter, section: sectionFilter });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search, classFilter, sectionFilter]);

  useEffect(() => { load(); }, [load]);

  const classOptions = classes.map((c) => ({ value: c._id, label: c.name }));
  const yearOptions = years.map((y) => ({ value: y._id, label: y.label }));

  const getSections = (classId) => {
    const cls = classes.find((c) => c._id === classId);
    return cls?.sections?.map((s) => ({ value: s.name, label: `Section ${s.name}` })) || [];
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', admissionNumber: '', class: '', section: '', rollNumber: '', academicYear: years.find((y) => y.isCurrent)?._id || '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    reset({ name: s.name, admissionNumber: s.admissionNumber, class: s.class?._id || s.class, section: s.section, rollNumber: s.rollNumber || '', academicYear: s.academicYear?._id || s.academicYear });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) await studentsApi.update(editing._id, values);
      else await studentsApi.create(values);
      toast.success(editing ? 'Student updated' : 'Student created');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await studentsApi.downloadTemplate();
      downloadBlob(res.data, 'student_import_template.xlsx');
    } catch { toast.error('Failed to download template'); }
  };

  const handleImportPreview = async () => {
    if (!importFile || !importClassId || !importYearId) { toast.error('Select file, class and year'); return; }
    setImportLoading(true);
    const fd = new FormData();
    fd.append('file', importFile);
    fd.append('classId', importClassId);
    fd.append('academicYearId', importYearId);
    try {
      const res = await studentsApi.importPreview(fd);
      setImportPreview(res.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Preview failed'); }
    finally { setImportLoading(false); }
  };

  const handleImportSave = async () => {
    if (!importFile || !importClassId || !importYearId) return;
    setImportLoading(true);
    const fd = new FormData();
    fd.append('file', importFile);
    fd.append('classId', importClassId);
    fd.append('academicYearId', importYearId);
    try {
      const res = await studentsApi.importSave(fd);
      toast.success(`Imported: ${res.data.data.created} students`);
      if (res.data.data.errors?.length) toast.error(`${res.data.data.errors.length} rows had errors`);
      setImportModal(false);
      setImportPreview(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    finally { setImportLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownloadTemplate} size="sm"><Download size={14} />Template</Button>
          <Button variant="secondary" onClick={() => setImportModal(true)} size="sm"><Upload size={14} />Import</Button>
          <Button onClick={openCreate}><Plus size={16} />Add Student</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or admission no..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input value={sectionFilter} onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }} placeholder="Section"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="No students found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>{['Name', 'Admission No', 'Class', 'Section', 'Roll No', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.admissionNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{s.class?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.section}</td>
                    <td className="px-4 py-3 text-slate-500">{s.rollNumber || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} title="Edit Student" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Edit size={15} /></button>
                        <button onClick={() => setPortfolioStudent(s)} title="Skills & Performance Portfolio" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Award size={15} /></button>
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

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" required {...register('name', { required: 'Required' })} error={errors.name?.message} />
          <Input label="Admission Number" required {...register('admissionNumber', { required: 'Required' })} error={errors.admissionNumber?.message} />
          <Select label="Class" required options={classOptions} placeholder="Select class" {...register('class', { required: 'Required' })} error={errors.class?.message} />
          <Select label="Section" required options={getSections(selectedClass)} placeholder="Select section" {...register('section', { required: 'Required' })} error={errors.section?.message} />
          <Input label="Roll Number" {...register('rollNumber')} />
          <Select label="Academic Year" required options={yearOptions} placeholder="Select year" {...register('academicYear', { required: 'Required' })} error={errors.academicYear?.message} />
          <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
          <Select label="Gender" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} placeholder="Select gender" {...register('gender')} />
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => { setImportModal(false); setImportPreview(null); }} title="Import Students" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Class" required options={classOptions} placeholder="Select class" value={importClassId} onChange={(e) => setImportClassId(e.target.value)} />
            <Select label="Academic Year" required options={yearOptions} placeholder="Select year" value={importYearId} onChange={(e) => setImportYearId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Excel File (.xlsx)</label>
            <input type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <Button variant="secondary" onClick={handleImportPreview} loading={importLoading}>Preview Import</Button>

          {importPreview && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Preview: {importPreview.valid} valid / {importPreview.total} total rows</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50"><tr>
                    <th className="px-3 py-2 text-left">Row</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Admission No</th>
                    <th className="px-3 py-2 text-left">Errors</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.rows.map((r) => (
                      <tr key={r.rowNum} className={r.errors?.length ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">{r.rowNum}</td>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2">{r.admissionNumber}</td>
                        <td className="px-3 py-2 text-red-600">{r.errors?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setImportPreview(null)}>Cancel</Button>
                <Button onClick={handleImportSave} loading={importLoading} disabled={importPreview.valid === 0}>
                  Import {importPreview.valid} Students
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Student Portfolio Modal */}
      <Modal
        open={!!portfolioStudent}
        onClose={() => setPortfolioStudent(null)}
        title={portfolioStudent ? `${portfolioStudent.name} — Skills & Performance Portfolio` : 'Student Portfolio'}
        size="xl"
      >
        {portfolioStudent && (
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <StudentPortfolio
              studentId={portfolioStudent._id}
              studentName={portfolioStudent.name}
              studentClass={portfolioStudent.class?.name || ''}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
