import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';
import SkillIcon from '../../components/common/SkillIcon';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { findSkillArea, findSubSkill, SKILL_AREAS_CONFIG, ALL_SUB_SKILLS_CONFIG } from '../../config/skillsTaxonomy';
import {
  classroomPerformances,
  competitionPerformances,
  classes as classesApi,
  students as studentsApi,
} from '../../services';
import { storeFile, getFileDataUrl } from '../../services/indexedDb';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Award,
  Calendar,
  User,
  GraduationCap,
  X,
  Upload,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PERFORMANCE_LEVELS = ['Beginner', 'Developing', 'Proficient', 'Advanced'];
const LEVEL_BADGES = {
  Beginner: 'bg-slate-100 text-slate-700 border-slate-300',
  Developing: 'bg-amber-100 text-amber-800 border-amber-300',
  Proficient: 'bg-blue-100 text-blue-800 border-blue-300',
  Advanced: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const COMPETITION_TYPES = [
  'Intra-Class',
  'Inter-Class',
  'Inter-School',
  'District',
  'State',
  'National',
  'Other',
];

const ACHIEVEMENTS = [
  'Participation',
  'First Place',
  'Second Place',
  'Third Place',
  'Special Award',
  'Other',
];

export default function SubSkillPerformancePage() {
  const { areaId, subSkillId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Route & Taxonomy state
  const [area, setArea] = useState(null);
  const [subSkill, setSubSkill] = useState(null);

  // Active tab: 'classroom' | 'competition'
  const [activeTab, setActiveTab] = useState('classroom');

  // Application data
  const [classesList, setClassesList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [classroomRecords, setClassroomRecords] = useState([]);
  const [competitionRecords, setCompetitionRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms visibility
  const [showClassroomForm, setShowClassroomForm] = useState(false);
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);

  // Filters & Search
  const [classFilter, setClassFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Modals
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewingType, setViewingType] = useState('classroom');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingType, setEditingType] = useState('classroom');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Classroom Form State ──────────────────────────────────────────────────
  const [crClass, setCrClass] = useState('');
  const [crStudent, setCrStudent] = useState('');
  const [crTitle, setCrTitle] = useState('');
  const [crDescription, setCrDescription] = useState('');
  const [crDate, setCrDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [crObservation, setCrObservation] = useState('');
  const [crLevel, setCrLevel] = useState('Developing');
  // Supporting files: array of { file, name, size, type, description }
  const [crFiles, setCrFiles] = useState([]);
  // Photos: array of { file, name, size, type, preview, description }
  const [crPhotos, setCrPhotos] = useState([]);
  const [crSaving, setCrSaving] = useState(false);

  // ── Competition Form State ────────────────────────────────────────────────
  const [cpClass, setCpClass] = useState('');
  const [cpStudent, setCpStudent] = useState('');
  const [cpCompName, setCpCompName] = useState('');
  const [cpCompType, setCpCompType] = useState('Inter-School');
  const [cpDate, setCpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cpOrganizer, setCpOrganizer] = useState('');
  const [cpStatus, setCpStatus] = useState('Participated'); // 'Participated' | 'Winner'
  const [cpAchievement, setCpAchievement] = useState('Participation');
  const [cpAwardDetails, setCpAwardDetails] = useState('');
  const [cpDescription, setCpDescription] = useState('');
  const [cpFiles, setCpFiles] = useState([]);
  const [cpPhotos, setCpPhotos] = useState([]);
  const [cpSaving, setCpSaving] = useState(false);

  // File input refs
  const crFileInputRef = useRef(null);
  const crPhotoInputRef = useRef(null);
  const cpFileInputRef = useRef(null);
  const cpPhotoInputRef = useRef(null);

  // Load Taxonomy & Entities
  useEffect(() => {
    const foundArea = findSkillArea(areaId);
    if (!foundArea) {
      setLoading(false);
      return;
    }
    setArea(foundArea);

    const foundSub = findSubSkill(subSkillId, foundArea._id);
    setSubSkill(foundSub);

    Promise.all([
      classesApi.list().catch(() => ({ data: { data: [] } })),
      studentsApi.list({ limit: 200 }).catch(() => ({ data: { data: [] } })),
    ]).then(([clsRes, stuRes]) => {
      setClassesList(clsRes.data?.data || []);
      setAllStudents(stuRes.data?.data || []);
      loadRecords(foundArea._id, foundSub?._id);
    }).finally(() => setLoading(false));
  }, [areaId, subSkillId]);

  const loadRecords = (arId, subId) => {
    if (!subId) return;
    Promise.all([
      classroomPerformances.list({ skillArea: arId, subSkill: subId }).catch(() => ({ data: { data: [] } })),
      competitionPerformances.list({ skillArea: arId, subSkill: subId }).catch(() => ({ data: { data: [] } })),
    ]).then(([crpRes, cmpRes]) => {
      setClassroomRecords(crpRes.data?.data || []);
      setCompetitionRecords(cmpRes.data?.data || []);
    });
  };

  // Dependent Students for Classroom form
  const crAvailableStudents = useMemo(() => {
    if (!crClass) return [];
    return allStudents.filter((s) => (s.class?._id || s.class) === crClass);
  }, [crClass, allStudents]);

  // Dependent Students for Competition form
  const cpAvailableStudents = useMemo(() => {
    if (!cpClass) return [];
    return allStudents.filter((s) => (s.class?._id || s.class) === cpClass);
  }, [cpClass, allStudents]);

  // Filtered Classroom Records
  const filteredClassroomRecords = useMemo(() => {
    return classroomRecords.filter((r) => {
      if (classFilter && (r.class?._id || r.class) !== classFilter) return false;
      if (levelFilter && r.performanceLevel !== levelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.student?.name || '').toLowerCase().includes(q);
        const matchesTitle = (r.activityTitle || '').toLowerCase().includes(q);
        const matchesObs = (r.teacherObservation || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesObs) return false;
      }
      return true;
    });
  }, [classroomRecords, classFilter, levelFilter, searchQuery]);

  // Filtered Competition Records
  const filteredCompetitionRecords = useMemo(() => {
    return competitionRecords.filter((r) => {
      if (classFilter && (r.class?._id || r.class) !== classFilter) return false;
      if (statusFilter && r.participationStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.student?.name || '').toLowerCase().includes(q);
        const matchesComp = (r.competitionName || '').toLowerCase().includes(q);
        const matchesOrg = (r.organizer || '').toLowerCase().includes(q);
        if (!matchesName && !matchesComp && !matchesOrg) return false;
      }
      return true;
    });
  }, [competitionRecords, classFilter, statusFilter, searchQuery]);

  // ── Classroom File & Photo Handlers ─────────────────────────────────────────
  const handleCrFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }
    setCrFiles((prev) => [
      ...prev,
      {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        description: '',
      },
    ]);
    if (crFileInputRef.current) crFileInputRef.current.value = '';
  };

  const handleCrPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Photo size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCrPhotos((prev) => [
        ...prev,
        {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: reader.result,
          description: '',
        },
      ]);
    };
    reader.readAsDataURL(file);
    if (crPhotoInputRef.current) crPhotoInputRef.current.value = '';
  };

  // ── Competition File & Photo Handlers ───────────────────────────────────────
  const handleCpFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }
    setCpFiles((prev) => [
      ...prev,
      {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        description: '',
      },
    ]);
    if (cpFileInputRef.current) cpFileInputRef.current.value = '';
  };

  const handleCpPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Photo size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCpPhotos((prev) => [
        ...prev,
        {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: reader.result,
          description: '',
        },
      ]);
    };
    reader.readAsDataURL(file);
    if (cpPhotoInputRef.current) cpPhotoInputRef.current.value = '';
  };

  // ── Save Classroom Performance ──────────────────────────────────────────────
  const handleSaveClassroom = async (e) => {
    e.preventDefault();
    if (!crClass) {
      toast.error('Please select a Class.');
      return;
    }
    if (!crStudent) {
      toast.error('Please select a Student.');
      return;
    }
    if (!crTitle.trim()) {
      toast.error('Please enter an Activity / Performance Title.');
      return;
    }
    if (!crDate) {
      toast.error('Please enter the Performance Date.');
      return;
    }

    setCrSaving(true);
    try {
      // Store supporting files into IndexedDB
      const processedFiles = [];
      for (const f of crFiles) {
        if (f.file) {
          const stored = await storeFile(f.file, f.description);
          processedFiles.push({
            id: stored.id,
            name: stored.name,
            size: stored.size,
            type: stored.type,
            description: f.description.trim() || stored.name,
            dataUrl: stored.dataUrl,
            createdAt: stored.createdAt,
          });
        } else {
          processedFiles.push(f);
        }
      }

      // Store photos into IndexedDB
      const processedPhotos = [];
      for (const p of crPhotos) {
        if (p.file) {
          const stored = await storeFile(p.file, p.description);
          processedPhotos.push({
            id: stored.id,
            name: stored.name,
            size: stored.size,
            type: stored.type,
            description: p.description.trim() || stored.name,
            previewUrl: stored.dataUrl,
            dataUrl: stored.dataUrl,
            createdAt: stored.createdAt,
          });
        } else {
          processedPhotos.push(p);
        }
      }

      const payload = {
        skillArea: area._id,
        subSkill: subSkill._id,
        class: crClass,
        student: crStudent,
        activityTitle: crTitle.trim(),
        performanceDescription: crDescription.trim(),
        performanceDate: crDate,
        teacherObservation: crObservation.trim(),
        performanceLevel: crLevel,
        supportingFiles: processedFiles,
        photos: processedPhotos,
      };

      if (editingRecord && editingType === 'classroom') {
        await classroomPerformances.update(editingRecord._id, payload);
        toast.success('Classroom performance updated successfully!');
        setEditingRecord(null);
      } else {
        await classroomPerformances.create(payload);
        toast.success('Classroom performance saved to local storage!');
      }

      // Reset form
      setCrClass('');
      setCrStudent('');
      setCrTitle('');
      setCrDescription('');
      setCrObservation('');
      setCrLevel('Developing');
      setCrFiles([]);
      setCrPhotos([]);
      setShowClassroomForm(false);
      loadRecords(area._id, subSkill._id);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save classroom record');
    } finally {
      setCrSaving(false);
    }
  };

  // ── Save Competition Performance ────────────────────────────────────────────
  const handleSaveCompetition = async (e) => {
    e.preventDefault();
    if (!cpClass) {
      toast.error('Please select a Class.');
      return;
    }
    if (!cpStudent) {
      toast.error('Please select a Student.');
      return;
    }
    if (!cpCompName.trim()) {
      toast.error('Please enter a Competition Name.');
      return;
    }
    if (!cpDate) {
      toast.error('Please enter the Competition Date.');
      return;
    }
    if (cpStatus === 'Winner' && (!cpAchievement || cpAchievement === 'Participation')) {
      toast.error('Winner status requires an achievement rank (e.g. First Place, Second Place, Special Award).');
      return;
    }

    setCpSaving(true);
    try {
      // Store supporting files into IndexedDB
      const processedFiles = [];
      for (const f of cpFiles) {
        if (f.file) {
          const stored = await storeFile(f.file, f.description);
          processedFiles.push({
            id: stored.id,
            name: stored.name,
            size: stored.size,
            type: stored.type,
            description: f.description.trim() || stored.name,
            dataUrl: stored.dataUrl,
            createdAt: stored.createdAt,
          });
        } else {
          processedFiles.push(f);
        }
      }

      // Store photos into IndexedDB
      const processedPhotos = [];
      for (const p of cpPhotos) {
        if (p.file) {
          const stored = await storeFile(p.file, p.description);
          processedPhotos.push({
            id: stored.id,
            name: stored.name,
            size: stored.size,
            type: stored.type,
            description: p.description.trim() || stored.name,
            previewUrl: stored.dataUrl,
            dataUrl: stored.dataUrl,
            createdAt: stored.createdAt,
          });
        } else {
          processedPhotos.push(p);
        }
      }

      const payload = {
        skillArea: area._id,
        subSkill: subSkill._id,
        class: cpClass,
        student: cpStudent,
        competitionName: cpCompName.trim(),
        competitionType: cpCompType,
        competitionDate: cpDate,
        organizer: cpOrganizer.trim(),
        participationStatus: cpStatus,
        achievement: cpAchievement,
        awardDetails: cpAwardDetails.trim(),
        description: cpDescription.trim(),
        supportingFiles: processedFiles,
        photos: processedPhotos,
      };

      if (editingRecord && editingType === 'competition') {
        await competitionPerformances.update(editingRecord._id, payload);
        toast.success('Competition performance updated successfully!');
        setEditingRecord(null);
      } else {
        await competitionPerformances.create(payload);
        toast.success('Competition performance saved to local storage!');
      }

      // Reset form
      setCpClass('');
      setCpStudent('');
      setCpCompName('');
      setCpOrganizer('');
      setCpStatus('Participated');
      setCpAchievement('Participation');
      setCpAwardDetails('');
      setCpDescription('');
      setCpFiles([]);
      setCpPhotos([]);
      setShowCompetitionForm(false);
      loadRecords(area._id, subSkill._id);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save competition record');
    } finally {
      setCpSaving(false);
    }
  };

  // ── Edit & Delete Actions ───────────────────────────────────────────────────
  const startEditClassroom = (rec) => {
    setEditingRecord(rec);
    setEditingType('classroom');
    setCrClass(rec.class?._id || rec.class);
    setCrStudent(rec.student?._id || rec.student);
    setCrTitle(rec.activityTitle || '');
    setCrDescription(rec.performanceDescription || '');
    setCrDate(rec.performanceDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setCrObservation(rec.teacherObservation || '');
    setCrLevel(rec.performanceLevel || 'Developing');
    setCrFiles(rec.supportingFiles || []);
    setCrPhotos(rec.photos || []);
    setShowClassroomForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const startEditCompetition = (rec) => {
    setEditingRecord(rec);
    setEditingType('competition');
    setCpClass(rec.class?._id || rec.class);
    setCpStudent(rec.student?._id || rec.student);
    setCpCompName(rec.competitionName || '');
    setCpCompType(rec.competitionType || 'Inter-School');
    setCpDate(rec.competitionDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setCpOrganizer(rec.organizer || '');
    setCpStatus(rec.participationStatus || 'Participated');
    setCpAchievement(rec.achievement || 'Participation');
    setCpAwardDetails(rec.awardDetails || '');
    setCpDescription(rec.description || '');
    setCpFiles(rec.supportingFiles || []);
    setCpPhotos(rec.photos || []);
    setShowCompetitionForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'classroom') {
        await classroomPerformances.delete(deleteConfirm.id);
        toast.success('Classroom record deleted');
      } else {
        await competitionPerformances.delete(deleteConfirm.id);
        toast.success('Competition record deleted');
      }
      setDeleteConfirm(null);
      loadRecords(area._id, subSkill._id);
    } catch {
      toast.error('Failed to delete record');
    }
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

  if (!area || !subSkill) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Sub-Skill Not Found</h2>
          <p className="text-slate-600 mb-6">The requested sub-skill could not be loaded.</p>
          <Link
            to={`/skills/${areaId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Sub-Skills
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation (Module 3) */}
          <Breadcrumbs
            items={[
              { label: 'Skill Areas', to: '/skills' },
              { label: area.name, to: `/skills/${area._id}` },
              { label: subSkill.name, to: `/skills/${area._id}/${subSkill._id}` },
              { label: 'Performance Tracking' },
            ]}
          />

          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(`/skills/${area._id}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to {area.name}</span>
            </button>
          </div>

          {/* Page Title & Domain Context Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 bottom-0 w-2.5"
              style={{ backgroundColor: area.color || '#2563eb' }}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: area.color || '#2563eb' }}
                  >
                    <SkillIcon iconName={area.icon} emoji={area.emoji} size={14} />
                    <span>{area.name}</span>
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Sub-Skill #{subSkill.order}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {subSkill.name} — Performance Tracking
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Record and monitor classroom activities, teacher observations, competencies, and competition achievements for {subSkill.name}.
                </p>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-center">
                  <span className="text-xs text-blue-700 font-medium block">Classroom</span>
                  <strong className="text-lg font-bold text-blue-900">{classroomRecords.length}</strong>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center">
                  <span className="text-xs text-amber-700 font-medium block">Competition</span>
                  <strong className="text-lg font-bold text-amber-900">{competitionRecords.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs (Module 3) */}
          <div className="flex border-b border-slate-200 mb-8 bg-white rounded-t-xl px-4 pt-2 shadow-xs">
            <button
              onClick={() => { setActiveTab('classroom'); setShowCompetitionForm(false); }}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'classroom'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap size={18} />
              <span>1. Classroom Performance</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                {classroomRecords.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('competition'); setShowClassroomForm(false); }}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'competition'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award size={18} />
              <span>2. Competition Performance</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                {competitionRecords.length}
              </span>
            </button>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: CLASSROOM PERFORMANCE (Module 4, 6, 7, 9)                  */}
          {/* ================================================================= */}
          {activeTab === 'classroom' && (
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student or activity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Classes</option>
                    {classesList.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Levels</option>
                    {PERFORMANCE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                {user ? (
                  <Link to="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      <Plus size={15} /> Record Activity in Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="secondary" className="text-xs">
                      Staff Login to Record
                    </Button>
                  </Link>
                )}
              </div>

              {/* Classroom Performance Form (Module 4) */}
              {showClassroomForm && (
                <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 sm:p-8 shadow-md relative">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {editingRecord ? 'Edit Classroom Performance Record' : 'Record Classroom Performance'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Log classroom learning activities, levels, teacher observations, files, and photos.
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowClassroomForm(false); setEditingRecord(null); }}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveClassroom} className="space-y-6">
                    {/* Auto-populated Skill Area and Sub-Skill (Module 4 Requirement 1 & 2) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/70 p-4 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                          1. Skill Area (Auto-Selected)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={area.name}
                          className="w-full bg-white text-slate-700 font-semibold text-sm px-3 py-2 rounded-lg border border-blue-200 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                          2. Sub-Skill (Auto-Selected)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={subSkill.name}
                          className="w-full bg-white text-slate-700 font-semibold text-sm px-3 py-2 rounded-lg border border-blue-200 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Class & Dependent Student Dropdowns (Module 4 Requirement 3 & 4) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          3. Class <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={crClass}
                          onChange={(e) => {
                            setCrClass(e.target.value);
                            setCrStudent(''); // Clear student when class changes
                          }}
                          required
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">-- Select Class --</option>
                          {classesList.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                        <span className="text-xs text-slate-400 mt-1 block">Populated from locally available class data</span>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          4. Student Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={crStudent}
                          onChange={(e) => setCrStudent(e.target.value)}
                          disabled={!crClass} // Disabled until class selected
                          required
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!crClass ? '-- Select class first --' : crAvailableStudents.length === 0 ? '-- No students in this class --' : '-- Select Student --'}
                          </option>
                          {crAvailableStudents.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.admissionNumber})
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-slate-400 mt-1 block">
                          {!crClass ? 'Disabled until class is selected' : `${crAvailableStudents.length} student(s) available`}
                        </span>
                      </div>
                    </div>

                    {/* Activity Title & Date (Module 4 Requirement 5 & 7) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          5. Activity / Performance Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Mental Arithmetic Quiz, Essay Presentation, Scientific Diagram"
                          value={crTitle}
                          onChange={(e) => setCrTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          7. Performance Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={crDate}
                          onChange={(e) => setCrDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Performance Description (Module 4 Requirement 6) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">
                        6. Performance Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Detailed description of student classroom performance or task..."
                        value={crDescription}
                        onChange={(e) => setCrDescription(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Teacher Observation & Performance Level (Module 4 Requirement 8 & 9) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          8. Teacher Observation
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Enter teacher feedback, strengths, and areas for improvement..."
                          value={crObservation}
                          onChange={(e) => setCrObservation(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          9. Performance Level <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {PERFORMANCE_LEVELS.map((lvl) => (
                            <label
                              key={lvl}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                crLevel === lvl
                                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="crLevel"
                                value={lvl}
                                checked={crLevel === lvl}
                                onChange={() => setCrLevel(lvl)}
                                className="text-blue-600"
                              />
                              <span>{lvl}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Module 6: Supporting File Upload with Individual Description */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" />
                          <span>10. Supporting File Upload (With Individual Description)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => crFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
                        >
                          <Upload size={13} />
                          <span>Choose Document</span>
                        </button>
                        <input
                          type="file"
                          ref={crFileInputRef}
                          onChange={handleCrFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                      </div>

                      {crFiles.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No supporting documents attached. Click above to attach worksheets, project reports, or assessment documents.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {crFiles.map((fileItem, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700 truncate max-w-xs flex items-center gap-1.5">
                                  <FileText size={14} className="text-blue-500 flex-shrink-0" />
                                  {fileItem.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCrFiles(crFiles.filter((_, i) => i !== idx))}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Enter file description or additional details..."
                                value={fileItem.description}
                                onChange={(e) => {
                                  const updated = [...crFiles];
                                  updated[idx].description = e.target.value;
                                  setCrFiles(updated);
                                }}
                                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Module 7: Photo Upload with Preview and Individual Description */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <ImageIcon size={16} className="text-emerald-600" />
                          <span>11. Photo Upload (With Preview & Individual Description)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => crPhotoInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
                        >
                          <Upload size={13} />
                          <span>Add Photo</span>
                        </button>
                        <input
                          type="file"
                          ref={crPhotoInputRef}
                          onChange={handleCrPhotoSelect}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>

                      {crPhotos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No photos attached. Click above to add photos of student classroom participation or projects.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {crPhotos.map((photoItem, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-start">
                              {/* Preview thumbnail */}
                              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                <img
                                  src={photoItem.preview || photoItem.previewUrl || photoItem.dataUrl}
                                  alt={photoItem.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                                    {photoItem.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setCrPhotos(crPhotos.filter((_, i) => i !== idx))}
                                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Describe this photo or student activity..."
                                  value={photoItem.description}
                                  onChange={(e) => {
                                    const updated = [...crPhotos];
                                    updated[idx].description = e.target.value;
                                    setCrPhotos(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button (Module 4 Requirement 12) */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => { setShowClassroomForm(false); setEditingRecord(null); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={crSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                      >
                        12. {editingRecord ? 'Update Performance' : 'Save Performance'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Classroom Records List (Module 9) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">
                    Classroom Performance Records ({filteredClassroomRecords.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing records saved in browser local storage
                  </span>
                </div>

                {filteredClassroomRecords.length === 0 ? (
                  <EmptyState
                    title="No Classroom Records Found"
                    description="Record a classroom performance using the button above. Records remain available after refresh."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Class</th>
                          <th className="px-4 py-3 text-left">Activity Title</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Level</th>
                          <th className="px-4 py-3 text-left">Teacher</th>
                          <th className="px-4 py-3 text-center">Media</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClassroomRecords.map((rec) => (
                          <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{rec.student?.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{rec.student?.admissionNumber}</p>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {rec.class?.name || 'Class 5'}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {rec.activityTitle}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {rec.performanceDate}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${LEVEL_BADGES[rec.performanceLevel] || 'bg-slate-100 text-slate-700'}`}>
                                {rec.performanceLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              {rec.teacherName || 'Class Teacher'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {rec.photos?.length > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title={`${rec.photos.length} photo(s)`}>
                                    <ImageIcon size={12} />
                                    <span>{rec.photos.length}</span>
                                  </span>
                                )}
                                {rec.supportingFiles?.length > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" title={`${rec.supportingFiles.length} file(s)`}>
                                    <FileText size={12} />
                                    <span>{rec.supportingFiles.length}</span>
                                  </span>
                                )}
                                {rec.photos?.length === 0 && rec.supportingFiles?.length === 0 && (
                                  <span className="text-xs text-slate-300">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setViewingRecord(rec); setViewingType('classroom'); }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {user && (
                                  <>
                                    <button
                                      onClick={() => startEditClassroom(rec)}
                                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ id: rec._id, type: 'classroom', name: rec.activityTitle })}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: COMPETITION PERFORMANCE (Module 5, 6, 7, 9)                */}
          {/* ================================================================= */}
          {activeTab === 'competition' && (
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search competition, student or organizer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">All Classes</option>
                    {classesList.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="Winner">Winner</option>
                    <option value="Participated">Participated</option>
                  </select>
                </div>

                {user ? (
                  <Link to="/dashboard">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
                      <Plus size={15} /> Record Achievement in Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="secondary" className="text-xs">
                      Staff Login to Record
                    </Button>
                  </Link>
                )}
              </div>

              {/* Competition Performance Form (Module 5) */}
              {showCompetitionForm && (
                <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 shadow-md relative">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {editingRecord ? 'Edit Competition Performance Record' : 'Record Competition Performance'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Log competition participations, awards, certificates, and trophy photographs.
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowCompetitionForm(false); setEditingRecord(null); }}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCompetition} className="space-y-6">
                    {/* Auto-populated Skill Area and Sub-Skill (Module 5 Requirement 1 & 2) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                          1. Skill Area (Auto-Selected)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={area.name}
                          className="w-full bg-white text-slate-700 font-semibold text-sm px-3 py-2 rounded-lg border border-amber-200 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                          2. Sub-Skill (Auto-Selected)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={subSkill.name}
                          className="w-full bg-white text-slate-700 font-semibold text-sm px-3 py-2 rounded-lg border border-amber-200 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Class & Dependent Student Dropdowns (Module 5 Requirement 3 & 4) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          3. Class <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cpClass}
                          onChange={(e) => {
                            setCpClass(e.target.value);
                            setCpStudent('');
                          }}
                          required
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="">-- Select Class --</option>
                          {classesList.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          4. Student Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cpStudent}
                          onChange={(e) => setCpStudent(e.target.value)}
                          disabled={!cpClass}
                          required
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!cpClass ? '-- Select class first --' : cpAvailableStudents.length === 0 ? '-- No students in this class --' : '-- Select Student --'}
                          </option>
                          {cpAvailableStudents.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.admissionNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Competition Name, Type, Date, Organizer (Module 5 Requirement 5, 6, 7, 8) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          5. Competition Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., District Science Olympiad, Elocution Championship"
                          value={cpCompName}
                          onChange={(e) => setCpCompName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          6. Competition Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cpCompType}
                          onChange={(e) => setCpCompType(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          {COMPETITION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          7. Competition Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={cpDate}
                          onChange={(e) => setCpDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Organizer (Requirement 8) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">
                        8. Organizer
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., District Educational Office, State Sports Board, School Cultural Club"
                        value={cpOrganizer}
                        onChange={(e) => setCpOrganizer(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Participation Status & Achievement / Result (Module 5 Requirement 9, 10, 11) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                          9. Participation Status <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="cpStatus"
                              value="Participated"
                              checked={cpStatus === 'Participated'}
                              onChange={() => {
                                setCpStatus('Participated');
                                setCpAchievement('Participation');
                              }}
                              className="text-amber-600"
                            />
                            <span>Participated</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="cpStatus"
                              value="Winner"
                              checked={cpStatus === 'Winner'}
                              onChange={() => {
                                setCpStatus('Winner');
                                if (cpAchievement === 'Participation') setCpAchievement('First Place');
                              }}
                              className="text-amber-600"
                            />
                            <span className="font-bold text-amber-900">Winner 🏆</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">
                          10. Achievement / Result <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cpAchievement}
                          onChange={(e) => setCpAchievement(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          {ACHIEVEMENTS.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">
                          11. Award / Rank Details
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Gold Medal, Trophy, Merit Certificate"
                          value={cpAwardDetails}
                          onChange={(e) => setCpAwardDetails(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Description (Module 5 Requirement 12) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">
                        12. Competition Description / Highlights
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Performance details, topics covered, score highlights, or judge feedback..."
                        value={cpDescription}
                        onChange={(e) => setCpDescription(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Supporting File Upload (Certificates) with Individual Description (Module 6) */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={16} className="text-amber-600" />
                          <span>13. Certificate / Document Upload (With Individual Description)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => cpFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
                        >
                          <Upload size={13} />
                          <span>Choose Certificate</span>
                        </button>
                        <input
                          type="file"
                          ref={cpFileInputRef}
                          onChange={handleCpFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        />
                      </div>

                      {cpFiles.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No certificates or documentation attached. Click above to attach achievement certificates or participation slips.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cpFiles.map((fileItem, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700 truncate max-w-xs flex items-center gap-1.5">
                                  <FileText size={14} className="text-amber-600 flex-shrink-0" />
                                  {fileItem.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCpFiles(cpFiles.filter((_, i) => i !== idx))}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Enter file description or additional details..."
                                value={fileItem.description}
                                onChange={(e) => {
                                  const updated = [...cpFiles];
                                  updated[idx].description = e.target.value;
                                  setCpFiles(updated);
                                }}
                                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Photo Upload with Preview and Individual Description (Module 7) */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <ImageIcon size={16} className="text-emerald-600" />
                          <span>14. Photo Upload (With Preview & Individual Description)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => cpPhotoInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
                        >
                          <Upload size={13} />
                          <span>Add Photo</span>
                        </button>
                        <input
                          type="file"
                          ref={cpPhotoInputRef}
                          onChange={handleCpPhotoSelect}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>

                      {cpPhotos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No competition photos attached. Click above to attach trophy presentations, podium photos, or stage performances.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {cpPhotos.map((photoItem, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-start">
                              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                <img
                                  src={photoItem.preview || photoItem.previewUrl || photoItem.dataUrl}
                                  alt={photoItem.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                                    {photoItem.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setCpPhotos(cpPhotos.filter((_, i) => i !== idx))}
                                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Describe this photo or student activity..."
                                  value={photoItem.description}
                                  onChange={(e) => {
                                    const updated = [...cpPhotos];
                                    updated[idx].description = e.target.value;
                                    setCpPhotos(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button (Module 5 Requirement 15) */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => { setShowCompetitionForm(false); setEditingRecord(null); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={cpSaving}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6"
                      >
                        15. {editingRecord ? 'Update Competition Record' : 'Save Competition Performance'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Competition Records List (Module 9) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">
                    Competition Performance Records ({filteredCompetitionRecords.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Saved locally in browser storage
                  </span>
                </div>

                {filteredCompetitionRecords.length === 0 ? (
                  <EmptyState
                    title="No Competition Records Found"
                    description="Record student competition achievements or participation using the button above."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Class</th>
                          <th className="px-4 py-3 text-left">Competition Name</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Achievement / Rank</th>
                          <th className="px-4 py-3 text-center">Media</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCompetitionRecords.map((rec) => (
                          <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{rec.student?.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{rec.student?.admissionNumber}</p>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {rec.class?.name || 'Class 5'}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{rec.competitionName}</p>
                              <p className="text-xs text-slate-400">{rec.competitionType} · {rec.organizer || 'School'}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {rec.competitionDate}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                rec.participationStatus === 'Winner'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}>
                                {rec.participationStatus === 'Winner' ? '🏆 Winner' : 'Participated'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {rec.achievement}
                              {rec.awardDetails && (
                                <span className="block text-xs font-normal text-slate-500 truncate max-w-xs">
                                  {rec.awardDetails}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {rec.photos?.length > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title={`${rec.photos.length} photo(s)`}>
                                    <ImageIcon size={12} />
                                    <span>{rec.photos.length}</span>
                                  </span>
                                )}
                                {rec.supportingFiles?.length > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title={`${rec.supportingFiles.length} file(s)`}>
                                    <FileText size={12} />
                                    <span>{rec.supportingFiles.length}</span>
                                  </span>
                                )}
                                {rec.photos?.length === 0 && rec.supportingFiles?.length === 0 && (
                                  <span className="text-xs text-slate-300">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setViewingRecord(rec); setViewingType('competition'); }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {user && (
                                  <>
                                    <button
                                      onClick={() => startEditCompetition(rec)}
                                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ id: rec._id, type: 'competition', name: rec.competitionName })}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW DETAILS MODAL (Modules 4, 5, 6, 7, 9)                        */}
          {/* ================================================================= */}
          {viewingRecord && (
            <Modal
              open={!!viewingRecord}
              onClose={() => setViewingRecord(null)}
              title={
                viewingType === 'classroom'
                  ? `Classroom Record: ${viewingRecord.activityTitle}`
                  : `Competition Record: ${viewingRecord.competitionName}`
              }
              size="lg"
            >
              <div className="space-y-6">
                {/* Header Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Student</span>
                    <strong className="text-slate-800 text-sm">{viewingRecord.student?.name}</strong>
                    <span className="text-slate-400 block font-mono">{viewingRecord.student?.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Class & Section</span>
                    <strong className="text-slate-800 text-sm">
                      {viewingRecord.class?.name || 'Class 5'} {viewingRecord.student?.section || 'A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Skill Area & Sub-Skill</span>
                    <strong className="text-slate-800">{area.name}</strong>
                    <span className="text-slate-500 block">{subSkill.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Date</span>
                    <strong className="text-slate-800 text-sm">
                      {viewingRecord.performanceDate || viewingRecord.competitionDate}
                    </strong>
                  </div>
                </div>

                {/* Specifics for Classroom */}
                {viewingType === 'classroom' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-600">Assessed Level:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${LEVEL_BADGES[viewingRecord.performanceLevel]}`}>
                        {viewingRecord.performanceLevel}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        Recorded by: {viewingRecord.teacherName || 'Class Teacher'}
                      </span>
                    </div>

                    {viewingRecord.performanceDescription && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Activity Description
                        </h4>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                          {viewingRecord.performanceDescription}
                        </p>
                      </div>
                    )}

                    {viewingRecord.teacherObservation && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Teacher Observation & Feedback
                        </h4>
                        <p className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-200">
                          {viewingRecord.teacherObservation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Specifics for Competition */}
                {viewingType === 'competition' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-xs text-amber-700 block font-medium">Status</span>
                        <strong className="text-sm text-amber-900">{viewingRecord.participationStatus}</strong>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-xs text-amber-700 block font-medium">Achievement</span>
                        <strong className="text-sm text-amber-900">{viewingRecord.achievement}</strong>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-xs text-amber-700 block font-medium">Competition Type</span>
                        <strong className="text-sm text-amber-900">{viewingRecord.competitionType}</strong>
                      </div>
                    </div>

                    {viewingRecord.awardDetails && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Award / Rank Details</span>
                        <p className="text-sm font-semibold text-slate-800">{viewingRecord.awardDetails}</p>
                      </div>
                    )}

                    {viewingRecord.description && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Competition Summary
                        </h4>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                          {viewingRecord.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Photos with Descriptions (Module 7) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-emerald-600" />
                    <span>Activity Photographs ({viewingRecord.photos?.length || 0})</span>
                  </h4>

                  {(!viewingRecord.photos || viewingRecord.photos.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No photographs attached to this record.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {viewingRecord.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                          <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={photo.previewUrl || photo.dataUrl}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-bold text-slate-800 truncate mb-1">{photo.name}</p>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                              <strong>Description:</strong> {photo.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supporting Files with Descriptions (Module 6) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600" />
                    <span>Supporting Documents & Certificates ({viewingRecord.supportingFiles?.length || 0})</span>
                  </h4>

                  {(!viewingRecord.supportingFiles || viewingRecord.supportingFiles.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No supporting documents attached to this record.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingRecord.supportingFiles.map((doc, dIdx) => (
                        <div key={dIdx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              <FileText size={14} className="text-blue-600 flex-shrink-0" />
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              <strong>Description:</strong> {doc.description || 'No description provided.'}
                            </p>
                          </div>
                          {doc.dataUrl && (
                            <a
                              href={doc.dataUrl}
                              download={doc.name}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex-shrink-0"
                            >
                              <Download size={13} />
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setViewingRecord(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </Modal>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteConfirm && (
            <Modal
              open={!!deleteConfirm}
              onClose={() => setDeleteConfirm(null)}
              title="Confirm Record Deletion"
              size="sm"
            >
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete the record <strong>"{deleteConfirm.name}"</strong>?
                  This action removes it from browser local storage.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirmed}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Record
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
