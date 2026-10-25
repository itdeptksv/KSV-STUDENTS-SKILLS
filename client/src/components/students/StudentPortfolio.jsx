import { useEffect, useState, useMemo } from 'react';
import {
  classroomPerformances,
  competitionPerformances,
} from '../../services';
import { getFileDataUrl } from '../../services/indexedDb';
import {
  GraduationCap,
  Award,
  FileText,
  Image as ImageIcon,
  Download,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const LEVEL_BADGES = {
  Beginner: 'bg-slate-100 text-slate-700 border-slate-300',
  Developing: 'bg-amber-100 text-amber-800 border-amber-300',
  Proficient: 'bg-blue-100 text-blue-800 border-blue-300',
  Advanced: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

export default function StudentPortfolio({ studentId, studentName = 'Student' }) {
  const [classroomList, setClassroomList] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classroom'); // 'classroom' | 'competition' | 'documents' | 'photos'
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      classroomPerformances.list({ student: studentId }).catch(() => ({ data: { data: [] } })),
      competitionPerformances.list({ student: studentId }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([crpRes, cmpRes]) => {
        setClassroomList(crpRes.data?.data || []);
        setCompetitionList(cmpRes.data?.data || []);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  // Aggregate Supporting Documents across both Classroom & Competition
  const supportingDocuments = useMemo(() => {
    const docs = [];

    // From Classroom
    classroomList.forEach((cr) => {
      (cr.supportingFiles || []).forEach((file) => {
        docs.push({
          id: file.id || Math.random().toString(),
          fileName: file.name,
          fileDescription: file.description || 'No description provided.',
          skillAreaName: cr.skillArea?.name || 'Skill Area',
          subSkillName: cr.subSkill?.name || 'Sub-Skill',
          sourceType: 'Classroom Activity',
          activityOrComp: cr.activityTitle,
          uploadDate: file.createdAt ? file.createdAt.split('T')[0] : cr.performanceDate,
          dataUrl: file.dataUrl,
          file,
        });
      });
    });

    // From Competition
    competitionList.forEach((cp) => {
      (cp.supportingFiles || []).forEach((file) => {
        docs.push({
          id: file.id || Math.random().toString(),
          fileName: file.name,
          fileDescription: file.description || 'No description provided.',
          skillAreaName: cp.skillArea?.name || 'Skill Area',
          subSkillName: cp.subSkill?.name || 'Sub-Skill',
          sourceType: 'Competition',
          activityOrComp: cp.competitionName,
          uploadDate: file.createdAt ? file.createdAt.split('T')[0] : cp.competitionDate,
          dataUrl: file.dataUrl,
          file,
        });
      });
    });

    return docs;
  }, [classroomList, competitionList]);

  // Aggregate Activity Photos across both Classroom & Competition
  const activityPhotos = useMemo(() => {
    const photos = [];

    // From Classroom
    classroomList.forEach((cr) => {
      (cr.photos || []).forEach((p) => {
        photos.push({
          id: p.id || Math.random().toString(),
          photoName: p.name,
          photoDescription: p.description || 'No description provided.',
          skillAreaName: cr.skillArea?.name || 'Skill Area',
          subSkillName: cr.subSkill?.name || 'Sub-Skill',
          sourceType: 'Classroom Activity',
          activityOrComp: cr.activityTitle,
          uploadDate: p.createdAt ? p.createdAt.split('T')[0] : cr.performanceDate,
          previewUrl: p.previewUrl || p.dataUrl,
          dataUrl: p.dataUrl,
          photo: p,
        });
      });
    });

    // From Competition
    competitionList.forEach((cp) => {
      (cp.photos || []).forEach((p) => {
        photos.push({
          id: p.id || Math.random().toString(),
          photoName: p.name,
          photoDescription: p.description || 'No description provided.',
          skillAreaName: cp.skillArea?.name || 'Skill Area',
          subSkillName: cp.subSkill?.name || 'Sub-Skill',
          sourceType: 'Competition',
          activityOrComp: cp.competitionName,
          uploadDate: p.createdAt ? p.createdAt.split('T')[0] : cp.competitionDate,
          previewUrl: p.previewUrl || p.dataUrl,
          dataUrl: p.dataUrl,
          photo: p,
        });
      });
    });

    return photos;
  }, [classroomList, competitionList]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 animate-pulse">Loading Skills & Performance Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      {/* Portfolio Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Official Student Portfolio
              </span>
              <span className="text-xs text-slate-400">
                Local-Persistent Records
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Skills & Performance Portfolio
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive record of classroom performances, competitions, documentation, and activity photos for {studentName}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs text-slate-700">
              {classroomList.length + competitionList.length} Total Records
            </span>
          </div>
        </div>

        {/* 4 Portfolio Tabs (Module 8 A, B, C, D) */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'classroom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap size={15} />
            <span>A. Classroom Performance ({classroomList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('competition')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'competition'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award size={15} />
            <span>B. Competition Performance ({competitionList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>C. Supporting Documents ({supportingDocuments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ImageIcon size={15} />
            <span>D. Activity Photos ({activityPhotos.length})</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* =================================================================== */}
        {/* SECTION A: CLASSROOM PERFORMANCE (Module 8 A)                       */}
        {/* =================================================================== */}
        {activeTab === 'classroom' && (
          <div>
            {classroomList.length === 0 ? (
              <div className="py-12 text-center">
                <GraduationCap size={36} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Classroom Performance Records Yet</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Classroom skill activities and teacher observations will appear here once recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {classroomList.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {rec.skillArea?.name || 'Academic'}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {rec.subSkill?.name || 'Sub-Skill'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {rec.activityTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${LEVEL_BADGES[rec.performanceLevel]}`}>
                          {rec.performanceLevel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {rec.performanceDate}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {rec.performanceDescription && (
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {rec.performanceDescription}
                      </p>
                    )}

                    {/* Teacher Observation */}
                    {rec.teacherObservation && (
                      <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 mb-4 text-xs text-slate-700">
                        <span className="font-bold text-blue-900 block mb-0.5">Teacher Observation & Feedback:</span>
                        {rec.teacherObservation}
                        {rec.teacherName && (
                          <span className="block mt-1 font-medium text-slate-400">
                            — {rec.teacherName} (Class: {rec.class?.name || 'Class 5'})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Attached Photos with Descriptions */}
                    {rec.photos?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ImageIcon size={13} className="text-emerald-600" />
                          <span>Photos ({rec.photos.length})</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {rec.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-start gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50"
                            >
                              <img
                                src={photo.previewUrl || photo.dataUrl}
                                alt={photo.name}
                                onClick={() => setPreviewPhoto(photo)}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0 cursor-pointer border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{photo.name}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                                  {photo.description || 'No description provided.'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supporting Files with Descriptions */}
                    {rec.supportingFiles?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText size={13} className="text-blue-600" />
                          <span>Supporting Documents ({rec.supportingFiles.length})</span>
                        </p>
                        <div className="space-y-2">
                          {rec.supportingFiles.map((doc, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                                  <FileText size={13} className="text-blue-500 flex-shrink-0" />
                                  {doc.name}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {doc.description || 'No description provided.'}
                                </p>
                              </div>
                              {doc.dataUrl && (
                                <a
                                  href={doc.dataUrl}
                                  download={doc.name}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                >
                                  <Download size={12} /> Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION B: COMPETITION PERFORMANCE (Module 8 B)                     */}
        {/* =================================================================== */}
        {activeTab === 'competition' && (
          <div>
            {competitionList.length === 0 ? (
              <div className="py-12 text-center">
                <Award size={36} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Competition Records Yet</h4>
                <p className="text-sm text-slate-400 mt-1">
                  School, district, and state competition records will appear here once saved.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {competitionList.map((comp) => (
                  <div
                    key={comp._id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {comp.skillArea?.name || 'Skill Area'}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {comp.subSkill?.name || 'Sub-Skill'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {comp.competitionType}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {comp.competitionName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          comp.participationStatus === 'Winner'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {comp.participationStatus === 'Winner' ? '🏆 Winner' : 'Participated'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {comp.competitionDate}
                        </span>
                      </div>
                    </div>

                    {/* Achievement Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Achievement / Rank:</span>
                        <strong className="text-slate-800 text-sm">{comp.achievement}</strong>
                      </div>
                      {comp.awardDetails && (
                        <div>
                          <span className="text-slate-400 block">Award Details:</span>
                          <strong className="text-amber-800">{comp.awardDetails}</strong>
                        </div>
                      )}
                      {comp.organizer && (
                        <div>
                          <span className="text-slate-400 block">Organizer:</span>
                          <span className="text-slate-700">{comp.organizer}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {comp.description && (
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {comp.description}
                      </p>
                    )}

                    {/* Certificates & Documents with Descriptions */}
                    {comp.supportingFiles?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText size={13} className="text-amber-600" />
                          <span>Certificates & Evidence ({comp.supportingFiles.length})</span>
                        </p>
                        <div className="space-y-2">
                          {comp.supportingFiles.map((doc, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                                  <FileText size={13} className="text-amber-600 flex-shrink-0" />
                                  {doc.name}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {doc.description || 'No description provided.'}
                                </p>
                              </div>
                              {doc.dataUrl && (
                                <a
                                  href={doc.dataUrl}
                                  download={doc.name}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 flex-shrink-0"
                                >
                                  <Download size={12} /> Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos with Descriptions */}
                    {comp.photos?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ImageIcon size={13} className="text-emerald-600" />
                          <span>Photographs ({comp.photos.length})</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {comp.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-start gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50"
                            >
                              <img
                                src={photo.previewUrl || photo.dataUrl}
                                alt={photo.name}
                                onClick={() => setPreviewPhoto(photo)}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0 cursor-pointer border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{photo.name}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                                  {photo.description || 'No description provided.'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION C: SUPPORTING DOCUMENTS (Module 8 C)                        */}
        {/* =================================================================== */}
        {activeTab === 'documents' && (
          <div>
            {supportingDocuments.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={36} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Supporting Documents Uploaded</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Certificates, activity worksheets, and reports uploaded by teachers will appear in this unified document repository.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportingDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {doc.sourceType}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {doc.uploadDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                        <FileText size={15} className="text-indigo-600 flex-shrink-0" />
                        {doc.fileName}
                      </h4>

                      <div className="text-xs text-slate-500 my-2 space-y-0.5">
                        <p><strong>Skill Area:</strong> {doc.skillAreaName} · {doc.subSkillName}</p>
                        <p><strong>Activity / Event:</strong> {doc.activityOrComp}</p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 my-2">
                        <strong className="text-slate-500 block">Description:</strong>
                        <p className="mt-0.5 leading-relaxed">{doc.fileDescription}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      {doc.dataUrl ? (
                        <a
                          href={doc.dataUrl}
                          download={doc.fileName}
                          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          <Download size={13} /> View / Download Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">File content unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION D: ACTIVITY PHOTOS (Module 8 D)                             */}
        {/* =================================================================== */}
        {activeTab === 'photos' && (
          <div>
            {activityPhotos.length === 0 ? (
              <div className="py-12 text-center">
                <ImageIcon size={36} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Activity Photos Uploaded</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Photos from classroom learning activities, projects, and competition awards will be showcased here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activityPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo preview with zoom click */}
                      <div
                        onClick={() => setPreviewPhoto(photo)}
                        className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer relative"
                      >
                        <img
                          src={photo.previewUrl || photo.dataUrl}
                          alt={photo.photoName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold flex items-center gap-1">
                            <Eye size={13} /> View Photo
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {photo.sourceType}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {photo.uploadDate}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate my-1">
                          {photo.photoName}
                        </h4>

                        <p className="text-xs text-slate-500 mb-2">
                          <strong>Related:</strong> {photo.skillAreaName} · {photo.subSkillName}
                        </p>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                          <strong className="text-slate-500 block">Description:</strong>
                          <p className="mt-0.5 leading-relaxed">{photo.photoDescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <Modal
          open={!!previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          title={previewPhoto.photoName || previewPhoto.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
              <img
                src={previewPhoto.previewUrl || previewPhoto.dataUrl}
                alt={previewPhoto.photoName || previewPhoto.name}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-500 block mb-1">Description:</strong>
              <p className="text-sm text-slate-800 leading-relaxed">
                {previewPhoto.photoDescription || previewPhoto.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
