import { useEffect, useState } from 'react';
import { skills as skillsApi } from '../../services';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';

const SKILL_ICONS = ['📖', '✍️', '🎤', '👂', '🔢', '💻', '🎨', '🎵', '⚽', '🌟'];

export default function SkillsPage() {
  const [areas, setAreas] = useState([]);
  const [subSkills, setSubSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([skillsApi.listAreas(), skillsApi.listSubSkills()])
      .then(([a, s]) => { setAreas(a.data.data || []); setSubSkills(s.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PublicLayout><PageLoader /></PublicLayout>;

  const getSubSkills = (areaId) => subSkills.filter((s) => s.skillArea?._id === areaId || s.skillArea === areaId);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Skill Areas</h1>
        <p className="text-slate-500 mb-8">Explore the 10 core skill areas developed at KSV School.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area, i) => (
            <div key={area._id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(selected === area._id ? null : area._id)}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{SKILL_ICONS[i] || '⭐'}</span>
                <h3 className="font-semibold text-slate-800">{area.name}</h3>
              </div>
              {area.description && <p className="text-sm text-slate-500 mb-3">{area.description}</p>}
              {selected === area._id && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Sub-skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {getSubSkills(area._id).map((s) => (
                      <span key={s._id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
