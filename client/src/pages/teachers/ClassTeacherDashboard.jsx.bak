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
import { SKILL_AREAS_CONFIG, ALL_SUB_SKILLS_CONFIG } from '../../config/skillsTaxonomy';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';
import { storeFile } from '../../services/indexedDb';
import {
  Users,
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
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function ClassTeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assigned classes and students
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Auxiliary data for dropdowns
  const [skillAreas, setSkillAreas] = useState([]);
  const [subSkills, setSubSkills] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  // Recent Records
  const [recentClassroom, setRecentClassroom] = useState([]);
  const [recentCompetitions, setRecentCompetitions] = useState([]);
  const [recordsTab, setRecordsTab] = useState('classroom');

  // Modals state
  const [classroomModal, setClassroomModal] = useState(false);
  const [assessmentModal, setAssessmentModal] = useState(false);
  const [competitionModal, setCompetitionModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  // Classroom Form State
  const [crStudent, setCrStudent] = useState('');
  const [crClass, setCrClass] = useState('');
  const [crTitle, setCrTitle] = useState('');
  const [crSkillArea, setCrSkillArea] = useState('');
  const [crSubSkill, setCrSubSkill] = useState('');
  const [crLevel, setCrLevel] = useState('Proficient');
  const [crObservation, setCrObservation] = useState('');
  const [crDescription, setCrDescription] = useState('');
  const [crDate, setCrDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [crFile, setCrFile] = useState(null);
  const [crPdfFile, setCrPdfFile] = useState(null);

  // Skill Assessment Form State
  const [asStudent, setAsStudent] = useState('');
  const [asSkillArea, setAsSkillArea] = useState('');
  const [asSubSkill, setAsSubSkill] = useState('');
  const [asLevel, setAsLevel] = useState('3');
  const [asRemarks, setAsRemarks] = useState('');
  const [asTerm, setAsTerm] = useState('');
  const [asYear, setAsYear] = useState('');

  // Competition Form State
  const [compStudent, setCompStudent] = useState('');
  const [compClass, setCompClass] = useState('');
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('Inter-Class');
  const [compAchievement, setCompAchievement] = useState('First Place');
  const [compStatus, setCompStatus] = useState('Winner');
  const [compDate, setCompDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [compRemarks, setCompRemarks] = useState('');
  const [compDescription, setCompDescription] = useState('');
  const [compSkillArea, setCompSkillArea] = useState('');
  const [compSubSkill, setCompSubSkill] = useState('');
  const [compPhotoFile, setCompPhotoFile] = useState(null);
  const [compPdfFile, setCompPdfFile] = useState(null);

  // Dependent Sub-Skills for Classroom Form
  const crAvailableSubSkills = useMemo(() => {
    if (!crSkillArea) return [];
    return subSkills.filter((s) => (s.skillArea?._id || s.skillArea) === crSkillArea);
  }, [crSkillArea, subSkills]);

  // Dependent Sub-Skills for Competition Form
  const compAvailableSubSkills = useMemo(() => {
    if (!compSkillArea) return [];
    return subSkills.filter((s) => (s.skillArea?._id || s.skillArea) === compSkillArea);
  }, [compSkillArea, subSkills]);

  // Dependent Sub-Skills for Assessment Form
  const asAvailableSubSkills = useMemo(() => {
    if (!asSkillArea) return [];
    return subSkills.filter((s) => (s.skillArea?._id || s.skillArea) === asSkillArea);
  }, [asSkillArea, subSkills]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        classesRes,
        studentsRes,
        areasRes,
        subsRes,
        yearsRes,
        termsRes,
        crRes,
        compRes,
      ] = await Promise.all([
        reportsApi.dashboard(),
        classesApi.list(),
        studentsApi.list({ limit: 100 }),
        skillsApi.listAreas({ all: true }),
        skillsApi.listSubSkills({ all: true }),
        academicApi.listYears(),
        academicApi.listTerms(),
        classroomApi.list({ limit: 20 }),
        competitionApi.list({ limit: 20 }),
      ]);

      setStats(statsRes.data.data);
      const clsList = classesRes.data.data || [];
      setAssignedClasses(clsList);
      if (clsList.length > 0) {
        setCrClass(clsList[0]._id);
        setCompClass(clsList[0]._id);
      }

      const stList = studentsRes.data.data || [];
      setStudents(stList);
      if (stList.length > 0) {
        setCrStudent(stList[0]._id);
        setAsStudent(stList[0]._id);
        setCompStudent(stList[0]._id);
      }

      const areas = (areasRes.data?.data && areasRes.data.data.length > 0)
        ? areasRes.data.data
        : SKILL_AREAS_CONFIG;
      setSkillAreas(areas);

      const subs = (subsRes.data?.data && subsRes.data.data.length > 0)
        ? subsRes.data.data
        : ALL_SUB_SKILLS_CONFIG;
      setSubSkills(subs);

      const yrs = yearsRes.data.data || [];
      setAcademicYears(yrs);
      const currYr = yrs.find((y) => y.isCurrent) || yrs[0];
      if (currYr) setAsYear(currYr._id);

      const tms = termsRes.data.data || [];
      setTerms(tms);
      if (tms.length > 0) setAsTerm(tms[0]._id);

      setRecentClassroom(crRes.data.data || []);
      setRecentCompetitions(compRes.data.data || []);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle classroom performance submit
  const handleSaveClassroom = async (e) => {
    e.preventDefault();
    if (!crStudent || !crTitle.trim()) {
      toast.error('Please enter activity title and select student');
      return;
    }
    if (!crSkillArea) {
      toast.error('Please select a Skill Area');
      return;
    }
    if (!crSubSkill) {
      toast.error('Please select a Sub-Skill');
      return;
    }
    setSaving(true);
    try {
      let attachments = [];
      let photos = [];
      let supportingFiles = [];

      if (crFile) {
        const stored = await storeFile(crFile, crTitle);
        const fileObj = {
          id: stored.id,
          name: stored.name,
          type: stored.type,
          size: stored.size,
          dataUrl: stored.dataUrl,
        };
        attachments.push(fileObj);
        if (crFile.type?.startsWith('image/')) {
          photos.push(fileObj);
        } else {
          supportingFiles.push(fileObj);
        }
      }

      if (crPdfFile) {
        const storedPdf = await storeFile(crPdfFile, `${crTitle} Document`);
        const pdfObj = {
          id: storedPdf.id,
          name: storedPdf.name,
          type: storedPdf.type || 'application/pdf',
          size: storedPdf.size,
          dataUrl: storedPdf.dataUrl,
        };
        attachments.push(pdfObj);
        supportingFiles.push(pdfObj);
      }

      await classroomApi.create({
        class: crClass,
        student: crStudent,
        title: crTitle,
        activityTitle: crTitle,
        skillArea: crSkillArea,
        subSkill: crSubSkill,
        level: crLevel,
        performanceLevel: crLevel,
        observationNotes: crObservation,
        teacherObservation: crObservation,
        description: crDescription,
        performanceDescription: crDescription,
        activityDate: crDate,
        performanceDate: crDate,
        attachments,
        supportingFiles,
        photos,
      });

      toast.success('Classroom performance recorded successfully');
      setClassroomModal(false);
      setCrTitle('');
      setCrDescription('');
      setCrObservation('');
      setCrSkillArea('');
      setCrSubSkill('');
      setCrFile(null);
      setCrPdfFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  // Handle assessment submit
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!asStudent || !asSkillArea || !asSubSkill) {
      toast.error('Please fill all required assessment fields');
      return;
    }
    setSaving(true);
    try {
      const selectedStudent = students.find((s) => s._id === asStudent);
      await assessmentsApi.create({
        student: asStudent,
        class: selectedStudent?.class?._id || selectedStudent?.class || crClass,
        skillArea: asSkillArea,
        subSkill: asSubSkill,
        level: parseInt(asLevel, 10),
        remarks: asRemarks,
        term: asTerm,
        academicYear: asYear,
        assessmentDate: new Date().toISOString(),
      });

      toast.success('Skill assessment submitted successfully');
      setAssessmentModal(false);
      setAsRemarks('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSaving(false);
    }
  };

  // Handle competition submit
  const handleSaveCompetition = async (e) => {
    e.preventDefault();
    if (!compStudent || !compName.trim()) {
      toast.error('Please enter competition name and student');
      return;
    }
    if (!compSkillArea) {
      toast.error('Please select a Skill Area');
      return;
    }
    if (!compSubSkill) {
      toast.error('Please select a Sub-Skill');
      return;
    }
    setSaving(true);
    try {
      const selectedStudent = students.find((s) => s._id === compStudent);
      const compClassId = selectedStudent?.class?._id || selectedStudent?.class || compClass;

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
        class: compClassId,
        competitionName: compName,
        competitionType: compType,
        competitionDate: compDate,
        participationStatus: compStatus,
        achievement: compAchievement,
        skillArea: compSkillArea,
        subSkill: compSubSkill,
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
      setCompSkillArea('');
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

  // Quick assess for a specific student from the roster
  const openAssessForStudent = (student) => {
    setAsStudent(student._id);
    setAssessmentModal(true);
  };

  // Quick classroom performance for a specific student
  const openClassroomForStudent = (student) => {
    setCrStudent(student._id);
    setCrClass(student.class?._id || student.class);
    setClassroomModal(true);
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await classroomApi.delete(id);
      toast.success('Record deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Assignment Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-100 border border-teal-400/30">
              Class Teacher Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Teacher'}</h1>
          <p className="text-teal-100 text-sm mt-1">
            Manage student records and upload assessments for your assigned classes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-teal-800/80 backdrop-blur rounded-xl px-4 py-2.5 border border-teal-600/50">
            <p className="text-xs text-teal-200 uppercase font-semibold tracking-wider">Assigned Classes</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((c) => (
                  <span key={c._id} className="text-xs font-bold bg-white text-teal-900 px-2 py-0.5 rounded shadow-sm">
                    {c.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-teal-300">None assigned</span>
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

      {/* KPI Stats Scoped to Assigned Classes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Assigned Students" value={stats?.students ?? students.length} icon={Users} color="teal" />
        <StatCard title="Assigned Classes" value={stats?.classes ?? assignedClasses.length} icon={BookOpen} color="blue" />
        <StatCard title="Classroom Records" value={stats?.classroomPerformances ?? 0} icon={ClipboardList} color="purple" />
        <StatCard title="Approved Assessments" value={stats?.totalAssessments ?? 0} icon={CheckCircle} color="green" />
        <StatCard title="Pending Review" value={stats?.assessmentsPending ?? 0} icon={ClipboardList} color="yellow" />
      </div>

      {/* Upload & Add Records Action Center (Dashboard requirement) */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Upload size={18} className="text-teal-600" />
              Upload & Record Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add new student observations, assessments, and competition achievements for your assigned classes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setClassroomModal(true)} className="bg-teal-600 hover:bg-teal-700 text-xs">
              <Plus size={15} />
              Record Classroom Performance
            </Button>
            <Button onClick={() => setAssessmentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-xs">
              <Plus size={15} />
              Add Skill Assessment
            </Button>
            <Button onClick={() => setCompetitionModal(true)} variant="secondary" className="text-xs">
              <Trophy size={15} className="text-amber-600" />
              Record Competition
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Classroom Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Record day-to-day student activities with photos, PDFs, and observation notes.</p>
            </div>
          </div>
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Skill Assessments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Evaluate students on the 4-level rubric across taxonomy sub-skills.</p>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Competition Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">Log inter-class, inter-school or sports competition results with photos and PDFs.</p>
            </div>
          </div>
        </div>

        {/* Existing Content: Tab Switcher for Classroom Performance & Competition Records */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecordsTab('classroom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  recordsTab === 'classroom'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BookOpen size={14} />
                Classroom Performance Records ({recentClassroom.length})
              </button>
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
            </div>
            <Link to="/dashboard/view" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View All in View Page &rarr;
            </Link>
          </div>

          {/* Tab 1: Classroom Performance Records Table */}
          {recordsTab === 'classroom' && (
            recentClassroom.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No classroom performance records found. Click &quot;Record Classroom Performance&quot; to add a new record.
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
                      <th className="px-4 py-2.5 text-left font-medium">Evidence / Files</th>
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
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700">
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

          {/* Tab 2: Competition Records Table */}
          {recordsTab === 'competition' && (
            recentCompetitions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No competition records found. Click &quot;Record Competition&quot; to add a new achievement.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Competition Name</th>
                      <th className="px-4 py-2.5 text-left font-medium">Student</th>
                      <th className="px-4 py-2.5 text-left font-medium">Type</th>
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
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {c.competitionType || 'Inter-Class'}
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
        </div>
      </div>

      {/* Assigned Students Roster with Quick-Assess */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-slate-600" />
              My Students ({filteredStudents.length})
            </h2>
            <p className="text-xs text-slate-500">Authorized students enrolled in your assigned classes.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState title="No students found" message="No students match the search criteria in your assigned classes." />
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Adm No</th>
                  <th className="px-4 py-2.5 text-left font-medium">Student Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Class & Section</th>
                  <th className="px-4 py-2.5 text-left font-medium">Roll No</th>
                  <th className="px-4 py-2.5 text-right font-medium">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{s.admissionNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      <span className="bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded">
                        {s.class?.name || 'Class 5'} - {s.section}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{s.rollNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openClassroomForStudent(s)}
                          className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                        >
                          + Classroom
                        </button>
                        <button
                          onClick={() => openAssessForStudent(s)}
                          className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          + Assess
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Classroom Performance */}
      <Modal open={classroomModal} onClose={() => setClassroomModal(false)} title="Record Classroom Performance">
        <form onSubmit={handleSaveClassroom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Class *</label>
              <select
                value={crClass}
                onChange={(e) => setCrClass(e.target.value)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {assignedClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student *</label>
              <select
                value={crStudent}
                onChange={(e) => setCrStudent(e.target.value)}
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Activity Title *</label>
            <input
              type="text"
              value={crTitle}
              onChange={(e) => setCrTitle(e.target.value)}
              placeholder="e.g. Science Experiment / Group Discussion"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Performance Description</label>
            <textarea
              rows={2}
              value={crDescription}
              onChange={(e) => setCrDescription(e.target.value)}
              placeholder="Brief description of the classroom performance activity..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Skill Area *</label>
              <select
                value={crSkillArea}
                onChange={(e) => {
                  setCrSkillArea(e.target.value);
                  setCrSubSkill('');
                }}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="">-- Select Skill Area --</option>
                {skillAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sub-Skill *</label>
              <select
                value={crSubSkill}
                onChange={(e) => setCrSubSkill(e.target.value)}
                disabled={!crSkillArea}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!crSkillArea ? '-- Select Skill Area first --' : '-- Select Sub-Skill --'}
                </option>
                {crAvailableSubSkills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Performance Level</label>
              <select
                value={crLevel}
                onChange={(e) => setCrLevel(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                {['Beginner', 'Developing', 'Proficient', 'Advanced'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Activity Date</label>
              <input
                type="date"
                value={crDate}
                onChange={(e) => setCrDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Teacher Observation Notes</label>
            <textarea
              rows={3}
              value={crObservation}
              onChange={(e) => setCrObservation(e.target.value)}
              placeholder="Enter detailed observations and feedback..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Upload Photo or Evidence (Optional)</label>
              <input
                type="file"
                accept="image/*,.doc,.docx"
                onChange={(e) => setCrFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {crFile && (
                <p className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
                  <Upload size={12} /> Selected: {crFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Upload PDF Document (Optional)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setCrPdfFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {crPdfFile && (
                <p className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
                  <FileText size={12} /> Selected PDF: {crPdfFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setClassroomModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="bg-teal-600 hover:bg-teal-700">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Skill Assessment */}
      <Modal open={assessmentModal} onClose={() => setAssessmentModal(false)} title="Add Skill Assessment">
        <form onSubmit={handleSaveAssessment} className="space-y-4">
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
                  {s.name} ({s.admissionNumber}) — {s.class?.name || 'Class 5'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Skill Area *</label>
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
                {skillAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sub-Skill *</label>
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Remarks</label>
            <textarea
              rows={3}
              value={asRemarks}
              onChange={(e) => setAsRemarks(e.target.value)}
              placeholder="Add qualitative feedback on the student's mastery..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setAssessmentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="bg-blue-600 hover:bg-blue-700">
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Student *</label>
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Competition Type</label>
              <select
                value={compType}
                onChange={(e) => setCompType(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                {['Intra-Class', 'Inter-Class', 'Inter-School', 'District', 'State', 'National'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Competition Name *</label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. Annual Speech Contest / Inter-House Relay"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Skill Area *</label>
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
                {skillAreas.map((a) => (
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Remarks & Details</label>
            <textarea
              rows={2}
              value={compRemarks}
              onChange={(e) => setCompRemarks(e.target.value)}
              placeholder="Details about the performance..."
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
              Save Competition Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Record Details */}
      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title={viewRecord?.competitionName ? 'Competition Record Details' : 'Classroom Performance Details'}>
        {viewRecord && (
          <div className="space-y-3 text-xs">
            {/* Title / Name */}
            <div>
              <span className="text-slate-400 font-medium">
                {viewRecord.competitionName ? 'Competition Name:' : 'Activity Title:'}
              </span>
              <p className="text-sm font-bold text-slate-800">
                {viewRecord.competitionName || viewRecord.title || viewRecord.activityTitle}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Skill Area:</span>
                <p className="font-semibold text-slate-700">{viewRecord.skillArea?.name || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Sub-Skill:</span>
                <p className="font-semibold text-slate-700">{viewRecord.subSkill?.name || '—'}</p>
              </div>
            </div>

            {viewRecord.competitionName ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Type:</span>
                  <p className="font-semibold text-slate-700">{viewRecord.competitionType || 'Inter-Class'}</p>
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
              <div>
                <span className="text-slate-400 font-medium">Performance Level:</span>
                <p className="font-semibold text-teal-700">{viewRecord.level || viewRecord.performanceLevel}</p>
              </div>
            )}

            {/* Observation Notes or Remarks */}
            {(viewRecord.observationNotes || viewRecord.teacherObservation || viewRecord.remarks) && (
              <div>
                <span className="text-slate-400 font-medium">
                  {viewRecord.competitionName ? 'Remarks & Feedback:' : 'Teacher Observation:'}
                </span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded mt-0.5 whitespace-pre-wrap">
                  {viewRecord.observationNotes || viewRecord.teacherObservation || viewRecord.remarks}
                </p>
              </div>
            )}

            {/* Photos & Evidence Images */}
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
                        <FileText size={14} className="text-teal-600" />
                        <span className="font-medium text-slate-700 truncate flex-1">{att.name}</span>
                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-600 hover:text-teal-800 font-medium inline-flex items-center gap-1"
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
