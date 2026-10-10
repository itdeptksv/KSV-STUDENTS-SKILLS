export const LEVEL_LABELS = { 1: 'Beginner', 2: 'Developing', 3: 'Proficient', 4: 'Advanced' };
export const LEVEL_COLORS = { 1: 'bg-red-100 text-red-700', 2: 'bg-yellow-100 text-yellow-700', 3: 'bg-blue-100 text-blue-700', 4: 'bg-green-100 text-green-700' };

export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const getErrorMessage = (err) => err?.response?.data?.message || err?.message || 'An error occurred';

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const ROLE_LABELS = {
  admin: 'Admin / Principal',
  class_teacher: 'Class Teacher',
  skill_teacher: 'Skill Teacher',
  student: 'Student',
  parent: 'Parent',
};
