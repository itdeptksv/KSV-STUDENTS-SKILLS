import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  reports as reportsApi,
  students as studentsApi,
  classes as classesApi,
  skills as skillsApi,
  academic as academicApi,
  classroomPerformances as classroomApi,
  competitionPerformances as competitionApi,
  assessments as assessmentsApi,
} from '../../services';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { storeFile } from '../../services/indexedDb';
import {
  Award,
  BookOpen,
  ClipboardList,
  Trophy,
  Plus,
  Search,
  Eye,
  Trash2,
  Database,
  CheckCircle,
  FileText,
  Upload,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function SkillTeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assigned skill areas & sub-skills
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [assignedSubSkills, setAssignedSubSkills] = useState([]);
  const [subSkillSearch, setSubSkillSearch] = useState('');

  // School data for dropdowns
  const [classesList, setClassesList] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  // Recent Records
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [recentCompetitions, setRecentCompetitions] = useState([]);
  const [recentClassroom, setRecentClassroom] = useState([]);
  const [recordsTab, setRecordsTab] = useState('competition');

  // Modals state
  const [assessmentModal, setAssessmentModal] = useState(false);
  const [competitionModal, setCompetitionModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  // Skill Assessment Form State
  const [asClass, setAsClass] = useState('');
  const [asStudent, setAsStudent] = useState('');
  const [asSkillArea, setAsSkillArea] = useState('');
  const [asSubSkill, setAsSubSkill] = useState('');
  const [asLevel, setAsLevel] = useState('3');
  const [asRemarks, setAsRemarks] = useState('');
  const [asTerm, setAsTerm] = useState('');
  const [asYear, setAsYear] = useState('');
  const [asFile, setAsFile] = useState(null);

  // Competition Form State
  const [compClass, setCompClass] = useState('');
  const [compStudent, setCompStudent] = useState('');
  const [compSkillArea, setCompSkillArea] = useState('');
  const [compSubSkill, setCompSubSkill] = useState('');
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('Inter-School');
  const [compAchievement, setCompAchievement] = useState('First Place');
  const [compStatus, setCompStatus] = useState('Winner');
  const [compDate, setCompDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [compDescription, setCompDescription] = useState('');
  const [compRemarks, setCompRemarks] = useState('');
  const [compPhotoFile, setCompPhotoFile] = useState(null);
  const [compPdfFile, setCompPdfFile] = useState(null);

  // Dependent Sub-Skills for Competition Form
  const compAvailableSubSkills = useMemo(() => {
    if (!compSkillArea) return [];
    return assignedSubSkills.filter((s) => (s.skillArea?._id || s.skillArea) === compSkillArea);
  }, [compSkillArea, assignedSubSkills]);

  // Dependent Sub-Skills for Assessment Form
  const asAvailableSubSkills = useMemo(() => {
    if (!asSkillArea) return [];
    return assignedSubSkills.filter((s) => (s.skillArea?._id || s.skillArea) === asSkillArea);
  }, [asSkillArea, assignedSubSkills]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        areasRes,
        subsRes,
        classesRes,
        yearsRes,
        termsRes,
        asRes,
        compRes,
        crRes,
      ] = await Promise.all([
        reportsApi.dashboard(),
        skillsApi.listAreas(), // Scoped to assigned skill areas in localStore
        skillsApi.listSubSkills(), // Scoped to assigned sub-skills in localStore
        classesApi.list({ all: true }),
        academicApi.listYears(),
        academicApi.listTerms(),
        assessmentsApi.list({ limit: 10 }),
        competitionApi.list({ limit: 10 }),
        classroomApi.list({ limit: 10 }),
      ]);

      setStats(statsRes.data.data);

      const areas = areasRes.data.data || [];
      setAssignedAreas(areas);
      if (areas.length > 0) {
        setAsSkillArea(areas[0]._id);
        setCompSkillArea(areas[0]._id);
      }

      const subs = subsRes.data.data || [];
      setAssignedSubSkills(subs);
      if (subs.length > 0) {
        setAsSubSkill(subs[0]._id);
        setCompSubSkill(subs[0]._id);
      }

      const cls = classesRes.data.data || [];
      setClassesList(cls);
      if (cls.length > 0) {
        setAsClass(cls[0]._id);
        setCompClass(cls[0]._id);
        // Load students for first class
        studentsApi.list({ class: cls[0]._id, limit: 100 }).then((res) => {
          const stList = res.data.data || [];
          setStudents(stList);
          if (stList.length > 0) {
            setAsStudent(stList[0]._id);
            setCompStudent(stList[0]._id);
          }
        });
      }

      const yrs = yearsRes.data.data || [];
      setAcademicYears(yrs);
      const currYr = yrs.find((y) => y.isCurrent) || yrs[0];
      if (currYr) setAsYear(currYr._id);

      const tms = termsRes.data.data || [];
      setTerms(tms);
      if (tms.length > 0) setAsTerm(tms[0]._id);

      setRecentAssessments(asRes.data.data || []);
      setRecentCompetitions(compRes.data.data || []);
      setRecentClassroom(crRes.data.data || []);
    } catch {
      toast.error('Failed to load skills dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When class changes in modals, reload students
  const handleClassChange = async (classId, setClassFn, setStudentFn) => {
    setClassFn(classId);
    try {
      const res = await studentsApi.list({ class: classId, limit: 100 });
      const stList = res.data.data || [];
      setStudents(stList);
      if (stList.length > 0) {
        setStudentFn(stList[0]._id);
      } else {
        setStudentFn('');
      }
    } catch {
      toast.error('Failed to load students for class');
    }
  };

  // Submit Skill Assessment
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!asStudent || !asSkillArea || !asSubSkill) {
      toast.error('Please fill all required assessment fields');
      return;
    }
    setSaving(true);
    try {
      let evidence = [];
      if (asFile) {
        const stored = await storeFile(asFile, `Assessment Evidence`);
        evidence.push({
          id: stored.id,
          name: stored.name,
          type: stored.type,
          size: stored.size,
          dataUrl: stored.dataUrl,
        });
      }

      await assessmentsApi.create({
        student: asStudent,
        class: asClass,
        skillArea: asSkillArea,
        subSkill: asSubSkill,
        level: parseInt(asLevel, 10),
        remarks: asRemarks,
        term: asTerm,
        academicYear: asYear,
        assessmentDate: new Date().toISOString(),
        evidence,
      });

      toast.success('Skill assessment submitted successfully');
      setAssessmentModal(false);
      setAsRemarks('');
      setAsFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSaving(false);
    }
  };

  // Submit Competition Record
  const handleSaveCompetition = async (e) => {
    e.preventDefault();
    if (!compStudent || !compName.trim() || !compSkillArea) {
      toast.error('Please enter competition name, student, and skill area');
      return;
    }
    if (!compSubSkill) {
      toast.error('Please select a Sub-Skill');
      return;
    }
    setSaving(true);
    try {
      let photos = [];
      let supportingFiles = [];

      if (compPhotoFile) {
        const storedPhoto = await storeFile(compPhotoFile, `${compName} Photo`);
        photos.push({
          id: storedPhoto.id,
          name: storedPhoto.name,
          type: storedPhoto.type || 'image/png',
          size: storedPhoto.size,
          dataUrl: storedPhoto.dataUrl,
        });
      }

      if (compPdfFile) {
        const storedPdf = await storeFile(compPdfFile, `${compName} Certificate`);
        supportingFiles.push({
          id: storedPdf.id,
          name: storedPdf.name,
          type: storedPdf.type || 'application/pdf',
          size: storedPdf.size,
          dataUrl: storedPdf.dataUrl,
        });
      }

      await competitionApi.create({
        student: compStudent,
        class: compClass,
        skillArea: compSkillArea,
        subSkill: compSubSkill,
        competitionName: compName,
        competitionType: compType,
        competitionDate: compDate,
        participationStatus: compStatus,
        achievement: compAchievement,
        description: compDescription,
        remarks: compRemarks || compDescription,
        supportingFiles,
        photos,
      });

      toast.success('Competition record saved successfully');
      setCompetitionModal(false);
      setCompName('');
      setCompDescription('');
      setCompRemarks('');
      setCompSubSkill('');
      setCompPhotoFile(null);
      setCompPdfFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save competition');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompetition = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competition record?')) return;
    try {
      await competitionApi.delete(id);
      toast.success('Competition record deleted');
      loadData();
    } catch {
      toast.error('Failed to delete competition record');
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom record?')) return;
    try {
      await classroomApi.delete(id);
      toast.success('Classroom record deleted');
      loadData();
    } catch {
      toast.error('Failed to delete classroom record');
    }
  };

  // Quick assess for a specific sub-skill
  const openAssessForSubSkill = (sub) => {
    setAsSubSkill(sub._id);
    const areaId = sub.skillArea?._id || sub.skillArea;
    if (areaId) setAsSkillArea(areaId);
    setAssessmentModal(true);
  };

  const filteredSubSkills = assignedSubSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(subSkillSearch.toLowerCase()) ||
      s.skillArea?.name?.toLowerCase().includes(subSkillSearch.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Assigned Skills Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-100 border border-purple-400/30">
              Skills Teacher Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Skills Teacher'}</h1>
          <p className="text-purple-100 text-sm mt-1">
            Evaluate student achievements and upload skill records for your assigned skill areas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-purple-800/80 backdrop-blur rounded-xl px-4 py-2.5 border border-purple-600/50">
            <p className="text-xs text-purple-200 uppercase font-semibold tracking-wider">Assigned Skill Areas</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {assignedAreas.length > 0 ? (
                assignedAreas.map((a) => (
                  <span key={a._id} className="text-xs font-bold bg-white text-purple-900 px-2 py-0.5 rounded shadow-sm">
                    {a.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-purple-300">None assigned</span>
              )}
            </div>
          </div>

          <Link to="/dashboard/view">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs py-2">
              <Database size={15} />
              View Saved Records
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Scoped to Assigned Skills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Assigned Skill Areas" value={stats?.skillAreas ?? assignedAreas.length} icon={Award} color="purple" />
        <StatCard title="Assigned Sub-Skills" value={stats?.subSkills ?? assignedSubSkills.length} icon={Award} color="teal" />
        <StatCard title="Students Assessed" value={stats?.studentsAssessed ?? 0} icon={Users} color="blue" />
        <StatCard title="Approved Assessments" value={stats?.totalAssessments ?? 0} icon={CheckCircle} color="green" />
        <StatCard title="Pending Review" value={stats?.assessmentsPending ?? 0} icon={ClipboardList} color="yellow" />
      </div>

      {/* Upload & Record Management Action Center */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Upload size={18} className="text-purple-600" />
              Upload & Record Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add new assessments, rubric ratings, and competition achievements for your assigned skill areas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAssessmentModal(true)} className="bg-purple-600 hover:bg-purple-700 text-xs">
              <Plus size={15} />
              Add Skill Assessment
            </Button>
            <Button onClick={() => setCompetitionModal(true)} variant="secondary" className="text-xs">
              <Trophy size={15} className="text-amber-600" />
              Record Competition Achievement
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Skill Area Rubric Evaluations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grade students on Beginner, Developing, Proficient, or Advanced rubrics for assigned sub-skills.
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Competitions & Tournaments</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Log sports tourneys, arts, science or coding competition achievements related to your skills with photos and PDFs.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Content: Tab Switcher for Competition Records & Classroom Performance */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecordsTab('competition')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  recordsTab === 'competition'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Trophy size={14} />
                Competition Records ({recentCompetitions.length})
              </button>
              <button
                type="button"
                onClick={() => setRecordsTab('classroom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  recordsTab === 'classroom'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BookOpen size={14} />
                Classroom Performance Records ({recentClassroom.length})
              </button>
            </div>
            <Link to="/dashboard/view" className="text-xs font-semibold text-purple-700 hover:text-purple-800">
              View All in View Page &rarr;
            </Link>
          </div>

          {/* Tab 1: Competition Records */}
          {recordsTab === 'competition' && (
            recentCompetitions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No competition records recorded yet for your assigned skill areas. Click &quot;Record Competition Achievement&quot; above.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Competition Name</th>
                      <th className="px-4 py-2.5 text-left font-medium">Student</th>
                      <th className="px-4 py-2.5 text-left font-medium">Skill Area</th>
                      <th className="px-4 py-2.5 text-left font-medium">Status / Rank</th>
                      <th className="px-4 py-2.5 text-left font-medium">Date</th>
                      <th className="px-4 py-2.5 text-left font-medium">Photo / PDF</th>
                      <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentCompetitions.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          <div>{c.competitionName}</div>
                          {c.description && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                              {c.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{c.student?.name || 'Student'}</td>
                        <td className="px-4 py-2.5 text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px]">
                            {c.skillArea?.name || 'Skill Area'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            c.participationStatus === 'Winner'
                              ? 'bg-amber-50 text-amber-700'
                              : c.participationStatus === 'Runner-up'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {c.achievement || c.participationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{formatDate(c.competitionDate)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.photos?.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px]">
                                Photo ({c.photos.length})
                              </span>
                            )}
                            {c.supportingFiles?.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px]">
                                <FileText size={10} />
                                PDF ({c.supportingFiles.length})
                              </span>
                            )}
                            {(!c.photos?.length && !c.supportingFiles?.length) && (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewRecord({ ...c, recordType: 'competition' })}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCompetition(c._id)}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Tab 2: Classroom Performance Records */}
          {recordsTab === 'classroom' && (
            recentClassroom.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No classroom performance records found for your assigned skill areas.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Activity Title</th>
                      <th className="px-4 py-2.5 text-left font-medium">Student</th>
                      <th className="px-4 py-2.5 text-left font-medium">Sub-Skill</th>
                      <th className="px-4 py-2.5 text-left font-medium">Level</th>
                      <th className="px-4 py-2.5 text-left font-medium">Date</th>
                      <th className="px-4 py-2.5 text-left font-medium">Files</th>
                      <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentClassroom.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          <div>{r.title || r.activityTitle}</div>
                          {(r.description || r.performanceDescription) && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                              {r.description || r.performanceDescription}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{r.student?.name || 'Student'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{r.subSkill?.name || 'Sub-skill'}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                            {r.level || r.performanceLevel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{formatDate(r.activityDate || r.performanceDate)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {r.photos?.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px]">
                                Photo ({r.photos.length})
                              </span>
                            )}
                            {r.supportingFiles?.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px]">
                                <FileText size={10} />
                                PDF ({r.supportingFiles.length})
                              </span>
                            )}
                            {(!r.photos?.length && !r.supportingFiles?.length && !r.attachments?.length) && (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewRecord({ ...r, recordType: 'classroom' })}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClassroom(r._id)}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Assigned Sub-Skills Roster with Quick-Assess */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-purple-600" />
              My Assigned Sub-Skills ({filteredSubSkills.length})
            </h2>
            <p className="text-xs text-slate-500">Authorized skill categories assigned to you by Admin.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sub-skills..."
              value={subSkillSearch}
              onChange={(e) => setSubSkillSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredSubSkills.length === 0 ? (
          <EmptyState title="No sub-skills found" message="No sub-skills assigned or matching the search criteria." />
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Sub-Skill Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Skill Area</th>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubSkills.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded">
                        {sub.skillArea?.name || 'Skill Area'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 truncate max-w-xs">{sub.description || '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openAssessForSubSkill(sub)}
                        className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 transition-colors"
                      >
                        + Record Assessment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Skill Assessments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Skill Assessments</h2>
            <p className="text-xs text-slate-500">Assessments logged for your assigned skill areas.</p>
          </div>
          <Link to="/dashboard/view">
            <span className="text-xs font-semibold text-purple-700 hover:text-purple-800">View All in View Page &rarr;</span>
          </Link>
        </div>

        {recentAssessments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No skill assessments logged yet. Use the "Add Skill Assessment" button above to add your first assessment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Student</th>
                  <th className="px-4 py-2.5 text-left font-medium">Sub-Skill</th>
                  <th className="px-4 py-2.5 text-left font-medium">Level</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAssessments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{a.student?.name || 'Student'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{a.subSkill?.name || 'Sub-Skill'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        Level {a.level}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'yellow'}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{formatDate(a.assessmentDate)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setViewRecord(a)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Skill Assessment */}
      <Modal open={assessmentModal} onClose={() => setAssessmentModal(false)} title="Record Skill Assessment">
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Class *</label>
              <select
                value={asClass}
                onChange={(e) => handleClassChange(e.target.value, setAsClass, setAsStudent)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {classesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
              <select
                value={asStudent}
                onChange={(e) => setAsStudent(e.target.value)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Skill Area *</label>
              <select
                value={asSkillArea}
                onChange={(e) => {
                  setAsSkillArea(e.target.value);
                  setAsSubSkill('');
                }}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="">-- Select Skill Area --</option>
                {assignedAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Sub-Skill *</label>
              <select
                value={asSubSkill}
                onChange={(e) => setAsSubSkill(e.target.value)}
                disabled={!asSkillArea}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!asSkillArea ? '-- Select Skill Area first --' : '-- Select Sub-Skill --'}
                </option>
                {asAvailableSubSkills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Rubric Level *</label>
              <select
                value={asLevel}
                onChange={(e) => setAsLevel(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                <option value="1">Level 1 - Beginner</option>
                <option value="2">Level 2 - Developing</option>
                <option value="3">Level 3 - Proficient</option>
                <option value="4">Level 4 - Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Term</label>
              <select
                value={asTerm}
                onChange={(e) => setAsTerm(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {terms.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Academic Year</label>
              <select
                value={asYear}
                onChange={(e) => setAsYear(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Remarks & Feedback</label>
            <textarea
              rows={3}
              value={asRemarks}
              onChange={(e) => setAsRemarks(e.target.value)}
              placeholder="Provide constructive assessment comments on student skill mastery..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Upload Photo or Evidence Document</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAsFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setAssessmentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="bg-purple-600 hover:bg-purple-700">
              Submit Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Competition */}
      <Modal open={competitionModal} onClose={() => setCompetitionModal(false)} title="Record Competition Achievement">
        <form onSubmit={handleSaveCompetition} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Class *</label>
              <select
                value={compClass}
                onChange={(e) => handleClassChange(e.target.value, setCompClass, setCompStudent)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {classesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
              <select
                value={compStudent}
                onChange={(e) => setCompStudent(e.target.value)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Skill Area *</label>
              <select
                value={compSkillArea}
                onChange={(e) => {
                  setCompSkillArea(e.target.value);
                  setCompSubSkill('');
                }}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="">-- Select Skill Area --</option>
                {assignedAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sub-Skill *</label>
              <select
                value={compSubSkill}
                onChange={(e) => setCompSubSkill(e.target.value)}
                disabled={!compSkillArea}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!compSkillArea ? '-- Select Skill Area first --' : '-- Select Sub-Skill --'}
                </option>
                {compAvailableSubSkills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Competition Type</label>
            <select
              value={compType}
              onChange={(e) => setCompType(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
            >
              {['Intra-Class', 'Inter-Class', 'Inter-School', 'District', 'State', 'National'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Competition Name *</label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. Interschool Basketball Tournament / Coding Olympiad"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Competition Description</label>
            <textarea
              rows={2}
              value={compDescription}
              onChange={(e) => setCompDescription(e.target.value)}
              placeholder="Describe the competition event, background, and achievement details..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Participation Status</label>
              <select
                value={compStatus}
                onChange={(e) => setCompStatus(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                <option value="Winner">Winner</option>
                <option value="Runner-up">Runner-up</option>
                <option value="Participant">Participant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Achievement / Rank</label>
              <select
                value={compAchievement}
                onChange={(e) => setCompAchievement(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {['First Place', 'Second Place', 'Third Place', 'Special Award', 'Participation', 'Other'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={compDate}
                onChange={(e) => setCompDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={compRemarks}
              onChange={(e) => setCompRemarks(e.target.value)}
              placeholder="Additional details..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Upload Photo / Certificate Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompPhotoFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
              {compPhotoFile && (
                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                  <Upload size={12} /> Selected Photo: {compPhotoFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Upload PDF Document / Certificate (Optional)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setCompPdfFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
              {compPdfFile && (
                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                  <FileText size={12} /> Selected PDF: {compPdfFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setCompetitionModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="bg-amber-600 hover:bg-amber-700">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title={viewRecord?.competitionName ? 'Competition Record Details' : viewRecord?.activityTitle || viewRecord?.title ? 'Classroom Performance Details' : 'Assessment Details'}>
        {viewRecord && (
          <div className="space-y-3 text-xs">
            {/* Title / Name */}
            <div>
              <span className="text-slate-400 font-medium">
                {viewRecord.competitionName ? 'Competition Name:' : viewRecord.activityTitle || viewRecord.title ? 'Activity Title:' : 'Assessment:'}
              </span>
              <p className="text-sm font-bold text-slate-800">
                {viewRecord.competitionName || viewRecord.activityTitle || viewRecord.title || (viewRecord.subSkill?.name ? `Assessment: ${viewRecord.subSkill?.name}` : 'Assessment Details')}
              </p>
            </div>

            {/* Description if present */}
            {(viewRecord.description || viewRecord.performanceDescription) && (
              <div>
                <span className="text-slate-400 font-medium">Description:</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded mt-0.5 whitespace-pre-wrap">
                  {viewRecord.description || viewRecord.performanceDescription}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Student:</span>
                <p className="font-semibold text-slate-700">{viewRecord.student?.name || 'Student'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Class:</span>
                <p className="font-semibold text-slate-700">{viewRecord.class?.name || 'Class 5'}</p>
              </div>
            </div>

            {viewRecord.competitionName ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Type:</span>
                  <p className="font-semibold text-slate-700">{viewRecord.competitionType || 'Inter-School'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Status:</span>
                  <p className="font-semibold text-slate-700">{viewRecord.participationStatus}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Rank / Award:</span>
                  <p className="font-semibold text-amber-700">{viewRecord.achievement || 'Participation'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Sub-Skill:</span>
                  <p className="font-semibold text-slate-700">{viewRecord.subSkill?.name || 'Sub-skill'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Level / Rubric:</span>
                  <p className="font-semibold text-purple-700">{viewRecord.level ? `Level ${viewRecord.level}` : (viewRecord.performanceLevel || 'Proficient')}</p>
                </div>
              </div>
            )}

            {/* Observation Notes or Remarks */}
            {(viewRecord.observationNotes || viewRecord.teacherObservation || viewRecord.remarks) && (
              <div>
                <span className="text-slate-400 font-medium">
                  {viewRecord.competitionName ? 'Remarks & Feedback:' : 'Teacher Observation / Remarks:'}
                </span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded mt-0.5 whitespace-pre-wrap">
                  {viewRecord.observationNotes || viewRecord.teacherObservation || viewRecord.remarks}
                </p>
              </div>
            )}

            {/* Photos */}
            {viewRecord.photos?.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium">Attached Photos ({viewRecord.photos.length}):</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {viewRecord.photos.map((ph, idx) => (
                    <div key={idx} className="relative group rounded border border-slate-200 overflow-hidden bg-slate-50">
                      {ph.dataUrl ? (
                        <img src={ph.dataUrl} alt={ph.name || 'Photo'} className="h-20 w-24 object-cover" />
                      ) : (
                        <div className="h-20 w-24 flex items-center justify-center text-slate-400 text-[10px]">Photo</div>
                      )}
                      {ph.dataUrl && (
                        <a
                          href={ph.dataUrl}
                          download={ph.name || 'photo.png'}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold"
                        >
                          View / Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Documents & Supporting Files */}
            {(viewRecord.supportingFiles?.length > 0 || viewRecord.attachments?.length > 0) && (
              <div>
                <span className="text-slate-400 font-medium">PDF Documents & Supporting Files:</span>
                <div className="mt-1 space-y-1">
                  {[...(viewRecord.supportingFiles || []), ...(viewRecord.attachments || [])]
                    .filter((f, i, arr) => arr.findIndex(x => (x.id || x.name) === (f.id || f.name)) === i)
                    .map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-200">
                        <FileText size={14} className="text-purple-600" />
                        <span className="font-medium text-slate-700 truncate flex-1">{att.name}</span>
                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1"
                          >
                            Download / Open PDF
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setViewRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
