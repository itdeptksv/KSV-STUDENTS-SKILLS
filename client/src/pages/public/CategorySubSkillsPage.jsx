import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';
import SkillIcon from '../../components/common/SkillIcon';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { findSkillArea, SKILL_AREAS_CONFIG } from '../../config/skillsTaxonomy';
import { classroomPerformances, competitionPerformances } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ArrowRight, Award, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CategorySubSkillsPage() {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [area, setArea] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundArea = findSkillArea(areaId);
    if (foundArea) {
      setArea(foundArea);

      // Load counts of classroom and competition records for each sub-skill
      Promise.all([
        classroomPerformances.list({ skillArea: foundArea._id }).catch(() => ({ data: { data: [] } })),
        competitionPerformances.list({ skillArea: foundArea._id }).catch(() => ({ data: { data: [] } })),
      ]).then(([crpRes, cmpRes]) => {
        const crpList = crpRes.data?.data || [];
        const cmpList = cmpRes.data?.data || [];
        const subCounts = {};

        foundArea.subSkills.forEach((sub) => {
          const classCount = crpList.filter((r) => r.subSkill?._id === sub._id || r.subSkill === sub._id).length;
          const compCount = cmpList.filter((r) => r.subSkill?._id === sub._id || r.subSkill === sub._id).length;
          subCounts[sub._id] = { classroom: classCount, competition: compCount, total: classCount + compCount };
        });

        setCounts(subCounts);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [areaId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="py-20">
          <PageLoader />
        </div>
      </PublicLayout>
    );
  }

  if (user?.role === 'skill_teacher' && user?.assignedSkillAreas?.length > 0 && !user.assignedSkillAreas.includes(areaId)) {
    const assignedArea = findSkillArea(user.assignedSkillAreas[0]);
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-700 mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Assigned Skill Area Only</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            You are logged in as a Skills Teacher. You have permission to view and track only your assigned skill area: <strong>{assignedArea?.name || 'Assigned Skill Area'}</strong>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/skills"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              Back to My Skills
            </Link>
            {assignedArea && (
              <Link
                to={`/skills/${assignedArea._id}`}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
              >
                Go to {assignedArea.name}
              </Link>
            )}
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!area) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Skill Area Not Found</h2>
          <p className="text-slate-600 mb-6">The requested skill area could not be located.</p>
          <Link
            to="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to All Skill Areas
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            items={[
              { label: 'Skill Areas', to: '/skills' },
              { label: area.name },
            ]}
          />

          {/* Top Bar with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/skills')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to Skill Areas</span>
            </button>
          </div>

          {/* Hero Header for the Selected Skill Area */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-10 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 bottom-0 w-2"
              style={{ backgroundColor: area.color || '#2563eb' }}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pl-2">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: area.color || '#2563eb' }}
                >
                  <SkillIcon iconName={area.icon} emoji={area.emoji} size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Category #{area.order}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {area.subSkills.length} Sub-Skills
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {area.name}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-2xl">
                    {area.description}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Sub-Skill Tracking</span>
                <span>Classroom & Competition</span>
              </div>
            </div>
          </div>

          {/* Sub-Skills Section Title */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Sub-Skills under {area.name}
              </h2>
              <p className="text-sm text-slate-500">
                Click any sub-skill below to view records, record classroom observations, or log competition awards.
              </p>
            </div>
          </div>

          {/* Sub-Skills Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {area.subSkills.map((sub, idx) => {
              const subCount = counts[sub._id] || { classroom: 0, competition: 0, total: 0 };
              const targetRoute = `/skills/${area._id}/${sub._id}`;

              return (
                <div
                  key={sub._id}
                  onClick={() => navigate(targetRoute)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {area.name}
                      </span>
                    </div>

                    {/* Sub-skill title */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Standardized competency assessment & tracking
                    </p>

                    {/* Stats pills */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                        <ClipboardList size={14} className="text-blue-500" />
                        <span>Class: <strong>{subCount.classroom}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                        <Award size={14} className="text-amber-500" />
                        <span>Comp: <strong>{subCount.competition}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Active Sub-Skill
                    </span>
                    <Link
                      to={targetRoute}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all"
                    >
                      <span>Track Performance</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
