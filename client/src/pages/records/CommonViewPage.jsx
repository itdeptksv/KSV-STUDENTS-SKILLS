import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  classroomPerformances as classroomApi,
  competitionPerformances as competitionApi,
  assessments as assessmentsApi,
  classes as classesApi,
  skills as skillsApi,
  students as studentsApi,
  reports as reportsApi,
} from '../../services';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/auth';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import { PageLoader } from '../../components/common/Spinner';
import {
  Database,
  Search,
  Filter,
  Eye,
  FileText,
  Image as ImageIcon,
  BookOpen,
  ClipboardList,
  Trophy,
  CheckCircle,
  Calendar,
  User,
  GraduationCap,
  Award,
  ShieldCheck,
  AlertCircle,
  Download,
  LayoutDashboard,
  LogOut,
  School,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, LEVEL_LABELS, LEVEL_COLORS } from '../../utils/helpers';

export default function CommonViewPage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active user profile (automatically synchronized with latest admin assignments)
  const [user, setUser] = useState(authUser);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const activeUser = user || authUser;

  // Tab: 'classroom' | 'assessments' | 'competitions'
  const [activeTab, setActiveTab] = useState('classroom');

  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [classroomList, setClassroomList] = useState([]);
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [competitionsList, setCompetitionsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [stats, setStats] = useState(null);

  // Filter sources (strictly scoped by role in localStore!)
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSkillAreas, setAvailableSkillAreas] = useState([]);

  // Active filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [skillAreaFilter, setSkillAreaFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // View modal state
  const [viewRecord, setViewRecord] = useState(null);
  const [recordCategory, setRecordCategory] = useState('classroom');

  // Load records from localStore (which automatically enforces role-based scoping!)
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      // Re-fetch current user profile to ensure latest admin assignments are live
      try {
        const meRes = await getMe();
        if (meRes?.data?.data) {
          setUser(meRes.data.data);
        }
      } catch {
        // Fall back to authUser
      }

      const [crRes, asRes, cpRes, clsRes, areasRes, stRes, statsRes] = await Promise.all([
        classroomApi.list({ limit: 100 }),
        assessmentsApi.list({ limit: 100 }),
        competitionApi.list({ limit: 100 }),
        classesApi.list(),
        skillsApi.listAreas(),
        studentsApi.list({ limit: 200 }),
        reportsApi.dashboard().catch(() => ({ data: { data: null } })),
      ]);

      setClassroomList(crRes.data.data || []);
      setAssessmentsList(asRes.data.data || []);
      setCompetitionsList(cpRes.data.data || []);
      setAvailableClasses(clsRes.data.data || []);
      setAvailableSkillAreas(areasRes.data.data || []);
      setStudentsList(stRes.data.data || []);
      setStats(statsRes.data?.data || null);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle logout directly from Common View Page
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  // Role Access Label Description & Permissions
  const roleAccessInfo = useMemo(() => {
    if (activeUser?.role === 'admin') {
      return {
        role: 'admin',
        title: 'Common Display Page',
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
        title: 'Common Display Page',
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
        title: 'Common Display Page',
        badge: 'Skills Teacher View',
        roleLabel: 'Skills Teacher',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        dashboardLabel: 'Skills Teacher Dashboard',
        text: `Assigned Skill Areas Only — Displaying only records for assigned skill areas and sub-skills: ${areaNames}.`,
        assignmentSummary: `Assigned Skills: ${areaNames}`,
      };
    }
    return {
      role: 'staff',
      title: 'Common Display Page',
      badge: 'Staff View',
      roleLabel: 'Staff Member',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      dashboardLabel: 'Dashboard',
      text: 'Displaying authorized records only.',
      assignmentSummary: 'Authorized Scope',
    };
  }, [activeUser, availableClasses, availableSkillAreas]);

  // Role-specific summary cards with exact scoped counts
  const summaryCards = useMemo(() => {
    if (activeUser?.role === 'admin') {
      return [
        { title: 'Total Students', value: stats?.students ?? studentsList.length, icon: Users, color: 'blue' },
        { title: 'School Classes', value: availableClasses.length, icon: School, color: 'teal' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'purple' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    if (activeUser?.role === 'class_teacher') {
      return [
        { title: 'Assigned Students', value: studentsList.length, icon: Users, color: 'teal' },
        { title: 'Assigned Classes', value: availableClasses.length, icon: School, color: 'blue' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'purple' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    if (activeUser?.role === 'skill_teacher') {
      const subSkillsCount = stats?.subSkills ?? (availableSkillAreas.reduce((acc, a) => acc + (a.subSkillsCount || a.subSkills?.length || 4), 0));
      return [
        { title: 'Assigned Skill Areas', value: availableSkillAreas.length, icon: Award, color: 'purple' },
        { title: 'Assigned Sub-Skills', value: subSkillsCount, icon: Award, color: 'teal' },
        { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'blue' },
        { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
        { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'red' },
      ];
    }
    return [
      { title: 'Classroom Records', value: classroomList.length, icon: BookOpen, color: 'blue' },
      { title: 'Skill Assessments', value: assessmentsList.length, icon: ClipboardList, color: 'green' },
      { title: 'Competitions', value: competitionsList.length, icon: Trophy, color: 'purple' },
    ];
  }, [activeUser, stats, studentsList, availableClasses, availableSkillAreas, classroomList, assessmentsList, competitionsList]);

  // Filtered Classroom Records
  const filteredClassroom = useMemo(() => {
    return classroomList.filter((item) => {
      const studentName = item.student?.name || '';
      const admNo = item.student?.admissionNumber || '';
      const title = item.title || '';
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
      if (levelFilter && item.level !== levelFilter) {
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

  if (loading || !activeUser) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header Navbar */}
      <header className="bg-[#1e3a5f] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl text-teal-400">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-wide text-white block leading-tight">KSV Skill Sets</span>
              <span className="text-[11px] text-teal-300 font-medium block leading-tight">Common Display Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{activeUser?.name || 'Staff User'}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleAccessInfo.color}`}>
                  {roleAccessInfo.badge}
                </span>
                <span className="text-[11px] text-slate-300">{activeUser?.email || ''}</span>
              </div>
            </div>

            {/* Dashboard Button */}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-xl shadow transition-colors shrink-0"
              title={`Open ${roleAccessInfo.dashboardLabel}`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors shrink-0"
              title="Logout from portal"
            >
              <LogOut size={14} className="text-slate-300" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1">
        {/* Page Banner & Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleAccessInfo.color}`}>
                  {roleAccessInfo.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">Common Records Display</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Database size={22} className="text-blue-600" />
                {roleAccessInfo.title}
              </h1>
              <p className="text-xs text-slate-500">
                {roleAccessInfo.text}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors shrink-0"
                title={`Open ${roleAccessInfo.dashboardLabel}`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>
              {/* Role Scoping & Assignment Notification Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-md">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Assignment Scope: <span className="font-medium text-slate-600">{roleAccessInfo.assignmentSummary}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Common display view. Upload, add, and edit operations are managed inside your Dashboard.
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

          {/* Record Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('classroom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'classroom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={15} />
              Classroom Performances ({filteredClassroom.length})
            </button>

            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assessments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ClipboardList size={15} />
              Skill Assessments ({filteredAssessments.length})
            </button>

            <button
              onClick={() => setActiveTab('competitions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'competitions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Trophy size={15} />
              Competition Achievements ({filteredCompetitions.length})
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

        {/* Skill Area Filter (for Assessments & Competitions) */}
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
              message="No records match the current filters or permissions. Use your Dashboard to record new activities."
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
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.title}</td>
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
                          {r.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(r.activityDate)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {r.attachments?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                            <ImageIcon size={12} />
                            {r.attachments.length} files
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
              message="No assessments match the current filters or permissions. Use your Dashboard to add new assessments."
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
              message="No competitions match the current filters or permissions. Use your Dashboard to record competition results."
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
            {/* Header info */}
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

            {/* Specific body per record category */}
            {recordCategory === 'classroom' && (
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 font-medium">Activity Title:</span>
                  <p className="text-sm font-bold text-slate-800">{viewRecord.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Sub-Skill:</span>
                    <p className="font-semibold text-slate-700">{viewRecord.subSkill?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Level Assessed:</span>
                    <p className="font-semibold text-blue-700">{viewRecord.level}</p>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date of Activity:</span>
                  <p className="font-semibold text-slate-700">{formatDate(viewRecord.activityDate)}</p>
                </div>
                {viewRecord.observationNotes && (
                  <div>
                    <span className="text-slate-400 font-medium">Teacher Observation Notes:</span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">
                      {viewRecord.observationNotes}
                    </p>
                  </div>
                )}
                {viewRecord.attachments?.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-medium">Evidence & Attachments:</span>
                    <div className="mt-1 space-y-2">
                      {viewRecord.attachments.map((att, idx) => (
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
      </main>
    </div>
  );
}
