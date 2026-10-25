import { useEffect, useState, useCallback } from 'react';
import { users as usersApi, classes as classesApi, skills as skillsApi } from '../../services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { Plus, Search, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROLE_LABELS } from '../../utils/helpers';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
  role: z.enum(['admin', 'class_teacher', 'skill_teacher']),
  phone: z.string().optional(),
});

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin / Principal' },
  { value: 'class_teacher', label: 'Class Teacher' },
  { value: 'skill_teacher', label: 'Skills Teacher' },
];

const ROLE_BADGE = { admin: 'blue', class_teacher: 'teal', skill_teacher: 'purple' };

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Assignment states
  const [classList, setClassList] = useState([]);
  const [skillAreaList, setSkillAreaList] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSkillAreas, setSelectedSkillAreas] = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'class_teacher' },
  });

  const selectedRole = watch('role');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, cRes, sRes] = await Promise.all([
        usersApi.list({ page, limit: 20, search, role: roleFilter }),
        classesApi.list().catch(() => ({ data: { data: [] } })),
        skillsApi.listAreas().catch(() => ({ data: { data: [] } })),
      ]);
      setData(uRes.data.data);
      setPagination(uRes.data.pagination);
      setClassList(cRes.data?.data || []);
      setSkillAreaList(sRes.data?.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setSelectedClasses([]);
    setSelectedSkillAreas([]);
    reset({ name: '', email: '', password: '', role: 'class_teacher', phone: '' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setSelectedClasses(u.assignedClasses || []);
    setSelectedSkillAreas(u.assignedSkillAreas || []);
    reset({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setModalOpen(true);
  };

  const toggleClassAssignment = (classId) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const toggleSkillAreaAssignment = (areaId) => {
    setSelectedSkillAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    );
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        assignedClasses: values.role === 'class_teacher' ? selectedClasses : [],
        assignedSkillAreas: values.role === 'skill_teacher' ? selectedSkillAreas : [],
      };

      if (editing) {
        const { password, ...rest } = payload;
        await usersApi.update(editing._id, rest);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(payload);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const getAssignmentsDisplay = (u) => {
    if (u.role === 'admin') {
      return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">All School Access</span>;
    }
    if (u.role === 'class_teacher') {
      if (!u.assignedClasses?.length) return <span className="text-xs text-amber-600 font-medium">None Assigned</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {u.assignedClasses.map((cId) => {
            const cls = classList.find((c) => c._id === cId);
            return (
              <span key={cId} className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                {cls ? cls.name : cId}
              </span>
            );
          })}
        </div>
      );
    }
    if (u.role === 'skill_teacher') {
      if (!u.assignedSkillAreas?.length) return <span className="text-xs text-amber-600 font-medium">None Assigned</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {u.assignedSkillAreas.map((aId) => {
            const area = skillAreaList.find((a) => a._id === aId);
            return (
              <span key={aId} className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                {area ? area.name : aId}
              </span>
            );
          })}
        </div>
      );
    }
    return <span className="text-xs text-slate-400">—</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff & Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Admin, Class Teacher, and Skills Teacher accounts and assignments</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} />Add User</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="No users found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Assignments</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={ROLE_BADGE[u.role] || 'gray'}>{ROLE_LABELS[u.role] || u.role}</Badge></td>
                    <td className="px-4 py-3">{getAssignmentsDisplay(u)}</td>
                    <td className="px-4 py-3"><Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" title="Edit User">
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff Account' : 'Add Staff Account'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" required {...register('name')} error={errors.name?.message} />
          <Input label="Email Address" type="email" required {...register('email')} error={errors.email?.message} />
          {!editing && <Input label="Password" type="password" required {...register('password')} error={errors.password?.message} />}
          <Select label="Role" required options={ROLE_OPTIONS} {...register('role')} error={errors.role?.message} />
          <Input label="Phone (Optional)" {...register('phone')} />

          {/* Conditional Class Assignment for Class Teacher */}
          {selectedRole === 'class_teacher' && (
            <div className="border border-teal-200 bg-teal-50/50 rounded-lg p-3.5 space-y-2">
              <label className="block text-xs font-semibold text-teal-900 uppercase tracking-wider">
                Assign Classes to Class Teacher
              </label>
              <p className="text-xs text-slate-500">
                Select the classes this teacher will manage. The teacher will ONLY be able to view and manage these classes and their students.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto">
                {classList.map((c) => (
                  <label key={c._id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(c._id)}
                      onChange={() => toggleClassAssignment(c._id)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Skill Area Assignment for Skills Teacher */}
          {selectedRole === 'skill_teacher' && (
            <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-3.5 space-y-2">
              <label className="block text-xs font-semibold text-purple-900 uppercase tracking-wider">
                Assign Skill Areas to Skills Teacher
              </label>
              <p className="text-xs text-slate-500">
                Select the skill areas this teacher will manage. The teacher will ONLY be able to view, assess, and manage these assigned skills.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1 max-h-44 overflow-y-auto">
                {skillAreaList.map((a) => (
                  <label key={a._id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedSkillAreas.includes(a._id)}
                      onChange={() => toggleSkillAreaAssignment(a._id)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-medium text-slate-700">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update Account' : 'Create Account'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

