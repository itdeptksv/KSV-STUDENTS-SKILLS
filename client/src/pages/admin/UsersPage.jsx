import { useEffect, useState, useCallback } from 'react';
import { users as usersApi } from '../../services';
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
  role: z.enum(['class_teacher', 'skill_teacher', 'student', 'parent']),
  phone: z.string().optional(),
});

const ROLE_OPTIONS = [
  { value: 'class_teacher', label: 'Class Teacher' },
  { value: 'skill_teacher', label: 'Skill Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const ROLE_BADGE = { admin: 'blue', class_teacher: 'teal', skill_teacher: 'purple', student: 'green', parent: 'yellow' };

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: 20, search, role: roleFilter });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); reset({ name: '', email: '', password: '', role: 'class_teacher', phone: '' }); setModalOpen(true); };
  const openEdit = (u) => { setEditing(u); reset({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setModalOpen(true); };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        const { password, ...rest } = values;
        await usersApi.update(editing._id, rest);
        toast.success('User updated');
      } else {
        await usersApi.create(values);
        toast.success('User created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <Button onClick={openCreate}><Plus size={16} />Add User</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="No users found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={ROLE_BADGE[u.role] || 'gray'}>{ROLE_LABELS[u.role] || u.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Edit size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" required {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" required {...register('email')} error={errors.email?.message} />
          {!editing && <Input label="Password" type="password" required {...register('password')} error={errors.password?.message} />}
          <Select label="Role" required options={ROLE_OPTIONS} {...register('role')} error={errors.role?.message} />
          <Input label="Phone" {...register('phone')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
