import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';
import SkillIcon from '../../components/common/SkillIcon';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SKILL_AREAS_CONFIG } from '../../config/skillsTaxonomy';
import {
  skills as skillsApi,
  classes as classesApi,
  students as studentsApi,
  classroomPerformances as classroomApi,
  assessments as assessmentsApi,
  competitionPerformances as competitionApi,
  reports as reportsApi,
} from '../../services';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/auth';
import { formatDate, LEVEL_LABELS, LEVEL_COLORS } from '../../utils/helpers';
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  School,
  Users,
  Award,
  ClipboardList,
  Trophy,
  Search,
  Eye,
  FileText,
  Image as ImageIcon,
  Download,
} from 'lucide-react';

export default function SkillsPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const activeUser = authUser;

  // Data states
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated staff records states
  const [activeTab, setActiveTab] = useState('classroom');
  const [classroomList, setClassroomList] = useState([]);
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [competitionsList, setCompetitionsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSkillAreas, setAvailableSkillAreas] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [skillAreaFilter, setSkillAreaFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [viewRecord, setViewRecord] = useState(null);
  const [recordCategory, setRecordCategory] = useState('classroom');

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [areasRes, clsRes, stRes, crRes, asRes, cpRes, statsRes] = await Promise.all([
        skillsApi.listAreas(),
        activeUser ? classesApi.list() : Promise.resolve({ data: { data: [] } }),
        activeUser ? studentsApi.list({ limit: 200 }) : Promise.resolve({ data: { data: [] } }),
        activeUser ? classroomApi.list({ limit: 100 }) : Promise.resolve({ data: { data: [] } }),
        activeUser ? assessmentsApi.list({ limit: 100 }) : Promise.resolve({ data: { data: [] } }),
        activeUser ? competitionApi.list({ limit: 100 }) : Promise.resolve({ data: { data: [] } }),
        activeUser ? reportsApi.dashboard().catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } }),
      ]);

      const data = areasRes.data?.data || [];
      const merged = data.map((area, idx) => {
        const config = SKILL_AREAS_CONFIG.find((c) => c._id === area._id || c.name === area.name) || SKILL_AREAS_CONFIG[idx] || {};
        return {
          ...config,
          ...area,
          subSkillsCount: config.subSkills?.length || area.subSkillsCount || 0,
        };
      });

      setAreas(merged);
      setAvailableSkillAreas(merged);
      setAvailableClasses(clsRes.data?.data || []);
      setStudentsList(stRes.data?.data || []);
      setClassroomList(crRes.data?.data || []);
      setAssessmentsList(asRes.data?.data || []);
      setCompetitionsList(cpRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch {
      setAreas(SKILL_AREAS_CONFIG.map((a) => ({ ...a, subSkillsCount: a.subSkills.length })));
    } finally {
      setLoading(false);
    }
  }, [activeUser?._id, activeUser?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Role Access Label Description & Permissions
  const roleAccessInfo = useMemo(() => {
    if (activeUser?.role === 'admin') {
      return {
        role: 'admin',
        title: 'School-Wide Student Skill Records',
        badge: 'Admin View',
        roleLabel: 'School Administrator',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        dashboardLabel: 'Admin Dashboard',
        text: 'All School Records — Full school-wide access across all classes, sections, skills, and teachers.',
        assignmentSummary: 'School-Wide Full Access',
      };
    }
    if (activeUser?.role === 'class_teacher') {
      const classNames = availableClasses.map((c) => c.name).join(', ') || 'Class 5';
      return {
        role: 'class_teacher',
        title: 'Assigned Class Student Skill Records',
        badge: 'Class Teacher View',
        roleLabel: 'Class Teacher',
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        dashboardLabel: 'Class Teacher Dashboard',
        text: `Assigned Classes Only — Displaying only records for assigned classes and sections: ${classNames}.`,
        assignmentSummary: `Assigned Classes: ${classNames}`,
      };
    }
    if (activeUser?.role === 'skill_teacher') {
      const areaNames = availableSkillAreas.map((a) => a.name).join(', ') || 'Physical Education & Sports';
      return {
        role: 'skill_teacher',
        title: 'Assigned Skill Areas & Student Records',
        badge: 'Skills Teacher View',
        roleLabel: 'Skills Teacher',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        dashboardLabel: 'Skills Teacher Dashboard',
        text: `Assigned Skill Areas Only — Displaying only records for assigned skill areas and sub-skills: ${areaNames}.`,
        assignmentSummary: `Assigned Skills: ${areaNames}`,
      };
    }
    return null;
  }, [activeUser, availableClasses, availableSkillAreas]);

  // Role-specific summary cards
  const summaryCards = useMemo(() => {
    if (!activeUser) return [];
    if (activeUser.role === 'admin') {
      return [
        { title: 'Total Students', value: stats?.students ?? studentsList.length, icon: Users, color: 'blue' },
        { title: 'School Classes', value: availableClasses.length, icon: School, color: 'teal' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'purple' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    if (activeUser.role === 'class_teacher') {
      return [
        { title: 'Assigned Students', value: studentsList.length, icon: Users, color: 'teal' },
        { title: 'Assigned Classes', value: availableClasses.length, icon: School, color: 'blue' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'purple' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    if (activeUser.role === 'skill_teacher') {
      const subSkillsCount = stats?.subSkills ?? (availableSkillAreas.reduce((acc, a) => acc + (a.subSkillsCount || a.subSkills?.length || 4), 0));
      return [
        { title: 'Assigned Skill Areas', value: availableSkillAreas.length, icon: Award, color: 'purple' },
        { title: 'Assigned Sub-Skills', value: subSkillsCount, icon: Award, color: 'teal' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'blue' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    return [];
  }, [activeUser, stats, studentsList, availableClasses, availableSkillAreas, classroomList, assessmentsList, competitionsList]);

  // Filtered Classroom Records
  const filteredClassroom = useMemo(() => {
    return classroomList.filter((item) => {
      const studentName = item.student?.name || '';
      const admNo = item.student?.admissionNumber || '';
      const title = item.title || item.activityTitle || '';
      const subSkill = item.subSkill?.name || '';

      if (search) {
        const q = search.toLowerCase();
        if (
          !studentName.toLowerCase().includes(q) &&
          !admNo.toLowerCase().includes(q) &&
          !title.toLowerCase().includes(q) &&
          !subSkill.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (classFilter && (item.class?._id || item.class) !== classFilter) {
        return false;
      }
      if (levelFilter && (item.level || item.performanceLevel) !== levelFilter) {
        return false;
      }
      return true;
    });
  }, [classroomList, search, classFilter, levelFilter]);

  // Filtered Skill Assessments
  const filteredAssessments = useMemo(() => {
    return assessmentsList.filter((item) => {
      const studentName = item.student?.name || '';
      const admNo = item.student?.admissionNumber || '';
      const area = item.skillArea?.name || '';
      const subSkill = item.subSkill?.name || '';
      const remarks = item.remarks || '';

      if (search) {
        const q = search.toLowerCase();
        if (
          !studentName.toLowerCase().includes(q) &&
          !admNo.toLowerCase().includes(q) &&
          !area.toLowerCase().includes(q) &&
          !subSkill.toLowerCase().includes(q) &&
          !remarks.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (classFilter && (item.class?._id || item.class) !== classFilter) {
        return false;
      }
      if (skillAreaFilter && (item.skillArea?._id || item.skillArea) !== skillAreaFilter) {
        return false;
      }
      if (levelFilter && String(item.level) !== levelFilter) {
        return false;
      }
      if (statusFilter && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [assessmentsList, search, classFilter, skillAreaFilter, levelFilter, statusFilter]);

  // Filtered Competitions
  const filteredCompetitions = useMemo(() => {
    return competitionsList.filter((item) => {
      const studentName = item.student?.name || '';
      const admNo = item.student?.admissionNumber || '';
      const compName = item.competitionName || '';
      const achievement = item.achievement || '';

      if (search) {
        const q = search.toLowerCase();
        if (
          !studentName.toLowerCase().includes(q) &&
          !admNo.toLowerCase().includes(q) &&
          !compName.toLowerCase().includes(q) &&
          !achievement.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (classFilter && (item.class?._id || item.class) !== classFilter) {
        return false;
      }
      if (skillAreaFilter && (item.skillArea?._id || item.skillArea) !== skillAreaFilter) {
        return false;
      }
      return true;
    });
  }, [competitionsList, search, classFilter, skillAreaFilter]);

  const openView = (record, category) => {
    setViewRecord(record);
    setRecordCategory(category);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="py-20">
          <PageLoader />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Breadcrumbs items={[{ label: 'Skill Areas' }]} />

          {/* Role-Based Authenticated Header Banner */}
          {activeUser && roleAccessInfo ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleAccessInfo.color}`}>
                      {roleAccessInfo.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Role-Based Skill Display</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] tracking-tight">
                    {roleAccessInfo.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {roleAccessInfo.text}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  {/* Clearly visible Dashboard button */}
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    title={`Open ${roleAccessInfo.dashboardLabel}`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>

                  {/* Scope info pill */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-sm">
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Scope: <span className="font-medium text-slate-600">{roleAccessInfo.assignmentSummary}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Display view. Use your Dashboard to upload, add, edit, and manage records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Based Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {summaryCards.map((card, idx) => (
                  <StatCard
                    key={idx}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Public Header Banner for Guests */
            <div className="mb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between border-b border-slate-200 pb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3">
                  <BookOpen size={14} />
                  <span>Holistic Student Development Curriculum</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] tracking-tight">
                  Skill Areas & Domains
                </h1>
                <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-3xl">
                  Explore the 12 core skill development areas designed to foster academic excellence, life readiness, creative flair, and physical wellness.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center justify-center sm:justify-end">
                <span className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <strong className="text-blue-600 font-bold">12</strong> Core Domains · <strong className="text-blue-600 font-bold">53</strong> Sub-Skills
                </span>
              </div>
            </div>
          )}

          {/* Skill Areas Section Title */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeUser?.role === 'skill_teacher'
                    ? 'Your Assigned Skill Areas'
                    : activeUser?.role === 'class_teacher'
                    ? 'Classroom Skill Areas & Domains'
                    : 'Skill Areas & Domains'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeUser?.role === 'skill_teacher'
                    ? 'Showing only the skill areas and sub-skills assigned to you by Admin.'
                    : 'Select any domain to view detailed sub-skill competencies.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                {areas.length} {areas.length === 1 ? 'Area' : 'Areas'} Available
              </span>
            </div>

            {/* Skill Areas Grid (Strictly Scoped) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {areas.map((area, index) => {
                const targetRoute = `/skills/${area._id || area.slug}`;
                const subCount = area.subSkillsCount || area.subSkills?.length || 0;

                return (
                  <div
                    key={area._id || index}
                    onClick={() => navigate(targetRoute)}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
                      style={{ backgroundColor: area.color || '#2563eb' }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: area.color || '#2563eb' }}
                        >
                          <SkillIcon iconName={area.icon} emoji={area.emoji} size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                          #{area.order || index + 1}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {area.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {area.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        {subCount} {subCount === 1 ? 'Sub-Skill' : 'Sub-Skills'}
                      </span>
                      <Link
                        to={targetRoute}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                      >
                        <span>View Skills</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authenticated Staff: Role-Based Student Skill Records Table Section */}
          {activeUser && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Student Skill Records ({roleAccessInfo?.roleLabel || 'Staff'})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Displaying permitted student skill performances, assessments, and competition achievements.
                  </p>
                </div>

                {/* Record Type Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('classroom')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'classroom'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen size={14} />
                    Classroom ({filteredClassroom.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('assessments')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'assessments'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ClipboardList size={14} />
                    Assessments ({filteredAssessments.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('competitions')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'competitions'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Trophy size={14} />
                    Competitions ({filteredCompetitions.length})
                  </button>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search records by student, title, or skill..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {activeUser?.role === 'class_teacher' ? 'All Assigned Classes' : activeUser?.role === 'admin' ? 'All School Classes' : 'All Permitted Classes'}
                  </option>
                  {availableClasses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Skill Area Filter */}
                {(activeTab === 'assessments' || activeTab === 'competitions') && (
                  <select
                    value={skillAreaFilter}
                    onChange={(e) => setSkillAreaFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {activeUser?.role === 'skill_teacher' ? 'All Assigned Skills' : 'All Skill Areas'}
                    </option>
                    {availableSkillAreas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Level Filter */}
                {activeTab === 'classroom' && (
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    {['Beginner', 'Developing', 'Proficient', 'Advanced'].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                )}

                {activeTab === 'assessments' && (
                  <>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Rubric Levels</option>
                      <option value="1">Level 1 - Beginner</option>
                      <option value="2">Level 2 - Developing</option>
                      <option value="3">Level 3 - Proficient</option>
                      <option value="4">Level 4 - Advanced</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="submitted">Submitted</option>
                      <option value="draft">Draft</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </>
                )}

                {(search || classFilter || skillAreaFilter || levelFilter || statusFilter) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setClassFilter('');
                      setSkillAreaFilter('');
                      setLevelFilter('');
                      setStatusFilter('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Tab 1: Classroom Performances Table */}
              {activeTab === 'classroom' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {filteredClassroom.length === 0 ? (
                    <EmptyState
                      title="No classroom performance records found"
                      message="No records match the current filters or permissions. Open your Dashboard to add new activities."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Activity Title</th>
                            <th className="px-4 py-3 text-left font-medium">Student Name</th>
                            <th className="px-4 py-3 text-left font-medium">Class</th>
                            <th className="px-4 py-3 text-left font-medium">Sub-Skill</th>
                            <th className="px-4 py-3 text-left font-medium">Level</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-left font-medium">Attachments</th>
                            <th className="px-4 py-3 text-right font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredClassroom.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-slate-800">{r.title || r.activityTitle}</td>
                              <td className="px-4 py-3 text-slate-700">
                                <span className="font-medium">{r.student?.name}</span>
                                <span className="text-slate-400 block text-[11px]">{r.student?.admissionNumber}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                                  {r.class?.name || 'Class'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{r.subSkill?.name || 'Sub-Skill'}</td>
                              <td className="px-4 py-3">
                                <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                                  {r.level || r.performanceLevel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(r.activityDate || r.performanceDate)}</td>
                              <td className="px-4 py-3 text-slate-500">
                                {(r.attachments?.length || r.supportingFiles?.length || r.photos?.length) ? (
                                  <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                                    <ImageIcon size={12} />
                                    {(r.attachments?.length || 0) + (r.supportingFiles?.length || 0) + (r.photos?.length || 0)} files
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => openView(r, 'classroom')}
                                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                                >
                                  <Eye size={12} className="inline mr-1" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Skill Assessments Table */}
              {activeTab === 'assessments' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {filteredAssessments.length === 0 ? (
                    <EmptyState
                      title="No skill assessment records found"
                      message="No assessments match the current filters or permissions. Open your Dashboard to add new assessments."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Student Name</th>
                            <th className="px-4 py-3 text-left font-medium">Class</th>
                            <th className="px-4 py-3 text-left font-medium">Skill Area</th>
                            <th className="px-4 py-3 text-left font-medium">Sub-Skill</th>
                            <th className="px-4 py-3 text-left font-medium">Level</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Assessment Date</th>
                            <th className="px-4 py-3 text-right font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAssessments.map((a) => (
                            <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-800">
                                <span className="font-semibold block">{a.student?.name}</span>
                                <span className="text-slate-400 block text-[11px]">{a.student?.admissionNumber}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                                  {a.class?.name || a.student?.class?.name || 'Class'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-700">{a.skillArea?.name || 'Skill Area'}</td>
                              <td className="px-4 py-3 text-slate-600">{a.subSkill?.name || 'Sub-Skill'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${LEVEL_COLORS[a.level] || 'bg-slate-100'}`}>
                                  L{a.level} — {LEVEL_LABELS[a.level] || ''}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'yellow'}>
                                  {a.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(a.assessmentDate)}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => openView(a, 'assessment')}
                                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                                >
                                  <Eye size={12} className="inline mr-1" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Competition Achievements Table */}
              {activeTab === 'competitions' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {filteredCompetitions.length === 0 ? (
                    <EmptyState
                      title="No competition achievements found"
                      message="No competitions match the current filters or permissions. Open your Dashboard to record competition results."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Competition Name</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Student Name</th>
                            <th className="px-4 py-3 text-left font-medium">Class</th>
                            <th className="px-4 py-3 text-left font-medium">Achievement</th>
                            <th className="px-4 py-3 text-left font-medium">Skill Area</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-right font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredCompetitions.map((c) => (
                            <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-slate-800">{c.competitionName}</td>
                              <td className="px-4 py-3 text-slate-600">{c.competitionType}</td>
                              <td className="px-4 py-3 text-slate-800">
                                <span className="font-semibold block">{c.student?.name}</span>
                                <span className="text-slate-400 block text-[11px]">{c.student?.admissionNumber}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                                  {c.class?.name || 'Class'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded">
                                  {c.achievement}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{c.skillArea?.name || '—'}</td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(c.competitionDate)}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => openView(c, 'competition')}
                                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                                >
                                  <Eye size={12} className="inline mr-1" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Read-Only Details Modal */}
          <Modal
            open={!!viewRecord}
            onClose={() => setViewRecord(null)}
            title={
              recordCategory === 'classroom'
                ? 'Classroom Performance Details'
                : recordCategory === 'assessment'
                ? 'Skill Assessment Details'
                : 'Competition Record Details'
            }
          >
            {viewRecord && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-medium text-[11px]">STUDENT INFORMATION</p>
                      <p className="text-sm font-bold text-slate-900">{viewRecord.student?.name}</p>
                    </div>
                    <Badge variant="blue">Adm: {viewRecord.student?.admissionNumber || '—'}</Badge>
                  </div>
                  <p className="text-slate-600">
                    Class: <span className="font-semibold">{viewRecord.class?.name || viewRecord.student?.class?.name}</span>
                    {viewRecord.student?.section && ` | Section ${viewRecord.student.section}`}
                  </p>
                </div>

                {recordCategory === 'classroom' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 font-medium">Activity Title:</span>
                      <p className="text-sm font-bold text-slate-800">{viewRecord.title || viewRecord.activityTitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Sub-Skill:</span>
                        <p className="font-semibold text-slate-700">{viewRecord.subSkill?.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Level Assessed:</span>
                        <p className="font-semibold text-blue-700">{viewRecord.level || viewRecord.performanceLevel}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Date of Activity:</span>
                      <p className="font-semibold text-slate-700">{formatDate(viewRecord.activityDate || viewRecord.performanceDate)}</p>
                    </div>
                    {(viewRecord.observationNotes || viewRecord.teacherObservation) && (
                      <div>
                        <span className="text-slate-400 font-medium">Teacher Observation Notes:</span>
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">
                          {viewRecord.observationNotes || viewRecord.teacherObservation}
                        </p>
                      </div>
                    )}
                    {(viewRecord.attachments?.length > 0 || viewRecord.supportingFiles?.length > 0) && (
                      <div>
                        <span className="text-slate-400 font-medium">Evidence & Attachments:</span>
                        <div className="mt-1 space-y-2">
                          {(viewRecord.attachments || viewRecord.supportingFiles).map((att, idx) => (
                            <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className="text-teal-600 flex-shrink-0" />
                                <span className="font-medium text-slate-700 truncate">{att.name}</span>
                              </div>
                              {att.dataUrl && (
                                <a
                                  href={att.dataUrl}
                                  download={att.name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-medium text-[11px]"
                                >
                                  <Download size={12} />
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {recordCategory === 'assessment' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Skill Area:</span>
                        <p className="font-bold text-slate-800">{viewRecord.skillArea?.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Sub-Skill:</span>
                        <p className="font-bold text-slate-800">{viewRecord.subSkill?.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Rubric Level:</span>
                        <p className="font-bold text-purple-700">Level {viewRecord.level} ({LEVEL_LABELS[viewRecord.level]})</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Status:</span>
                        <p className="font-bold text-slate-800">{viewRecord.status}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Date:</span>
                        <p className="font-semibold text-slate-700">{formatDate(viewRecord.assessmentDate)}</p>
                      </div>
                    </div>

                    {viewRecord.remarks && (
                      <div>
                        <span className="text-slate-400 font-medium">Qualitative Remarks:</span>
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">
                          {viewRecord.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {recordCategory === 'competition' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 font-medium">Competition Name:</span>
                      <p className="text-sm font-bold text-slate-800">{viewRecord.competitionName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Competition Type:</span>
                        <p className="font-semibold text-slate-700">{viewRecord.competitionType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Achievement:</span>
                        <p className="font-bold text-amber-700">{viewRecord.achievement}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Skill Area:</span>
                        <p className="font-semibold text-slate-700">{viewRecord.skillArea?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Competition Date:</span>
                        <p className="font-semibold text-slate-700">{formatDate(viewRecord.competitionDate)}</p>
                      </div>
                    </div>
                    {viewRecord.remarks && (
                      <div>
                        <span className="text-slate-400 font-medium">Remarks:</span>
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                          {viewRecord.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button variant="secondary" onClick={() => setViewRecord(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </PublicLayout>
  );
}
