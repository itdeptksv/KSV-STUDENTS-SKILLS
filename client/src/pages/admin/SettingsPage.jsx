import { useEffect, useState } from 'react';
import { settings as settingsApi } from '../../services';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = [
  { key: 'school_name', label: 'School Name', defaultValue: 'KSV School' },
  { key: 'portal_name', label: 'Portal Name', defaultValue: 'KSV Skill Sets' },
  { key: 'upload_max_mb', label: 'Max Upload Size (MB)', defaultValue: '5' },
  { key: 'assessment_approval_required', label: 'Assessment Approval Required (true/false)', defaultValue: 'true' },
  { key: 'parent_access_enabled', label: 'Parent Access Enabled (true/false)', defaultValue: 'true' },
  { key: 'student_access_enabled', label: 'Student Access Enabled (true/false)', defaultValue: 'true' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    settingsApi.get()
      .then((res) => {
        const data = res.data.data || {};
        const defaults = {};
        DEFAULT_SETTINGS.forEach((s) => { defaults[s.key] = data[s.key] ?? s.defaultValue; });
        reset(defaults);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(values)) {
        await settingsApi.set({ key, value });
      }
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Application Settings</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {DEFAULT_SETTINGS.map((s) => (
            <Input key={s.key} label={s.label} {...register(s.key)} />
          ))}
          <div className="pt-2">
            <Button type="submit" loading={saving}>Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
