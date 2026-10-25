/**
 * localStore.js — Local-Only Storage Service for KSV Skill Sets.
 * Persists Skills Areas metadata, performance records, and supporting records in browser localStorage.
 * Works seamlessly without MongoDB or backend network connection.
 */

import { SKILL_AREAS_CONFIG, ALL_SUB_SKILLS_CONFIG } from '../config/skillsTaxonomy';

const STORAGE_KEYS = {
  SKILL_AREAS: 'ksv_skill_areas',
  SUB_SKILLS: 'ksv_sub_skills',
  CLASSROOM_PERFORMANCES: 'ksv_classroom_performances',
  COMPETITION_PERFORMANCES: 'ksv_competition_performances',
  ASSESSMENTS: 'ksv_assessments',
  CLASSES: 'ksv_classes',
  STUDENTS: 'ksv_students',
  ACADEMIC_YEARS: 'ksv_academic_years',
  ACADEMIC_TERMS: 'ksv_academic_terms',
  USERS: 'ksv_users',
  GALLERY_ALBUMS: 'ksv_gallery_albums',
  GALLERY_ITEMS: 'ksv_gallery_items',
  COMPETITIONS: 'ksv_competitions',
  ANNOUNCEMENTS: 'ksv_announcements',
  CURRENT_USER: 'ksv_current_user',
};

export const isLocalMode = () => {
  // Check explicit environment variable or default to local mode
  const envLocal = import.meta.env?.VITE_LOCAL_MODE;
  if (envLocal === 'true' || envLocal === true) return true;
  if (envLocal === 'false') return false;
  // If VITE_DEMO_MODE is true, enable local-only mode
  if (import.meta.env?.VITE_DEMO_MODE === 'true' || import.meta.env?.VITE_DEMO_MODE === true) return true;
  return true; // Default to true for this local-development phase
};

// ── Seed Taxonomy: 12 Categories and Sub-Skills in Exact Specified Order ──────
const SEED_SKILL_AREAS = SKILL_AREAS_CONFIG.map(({ subSkills, ...area }) => ({
  ...area,
  isActive: true,
}));

const SEED_SUB_SKILLS = ALL_SUB_SKILLS_CONFIG;

const SEED_CLASSES = [
  { _id: 'class_pkg', name: 'Pre-KG', shortName: 'PKG', classGroup: 'Pre-KG–2', order: 1, sections: [{ _id: 'sec_pkg_a', name: 'A' }] },
  { _id: 'class_kg', name: 'KG', shortName: 'KG', classGroup: 'Pre-KG–2', order: 2, sections: [{ _id: 'sec_kg_a', name: 'A' }] },
  { _id: 'class_1', name: 'Class 1', shortName: 'C1', classGroup: 'Pre-KG–2', order: 3, sections: [{ _id: 'sec_1_a', name: 'A' }] },
  { _id: 'class_2', name: 'Class 2', shortName: 'C2', classGroup: 'Pre-KG–2', order: 4, sections: [{ _id: 'sec_2_a', name: 'A' }] },
  { _id: 'class_3', name: 'Class 3', shortName: 'C3', classGroup: 'Classes 3–5', order: 5, sections: [{ _id: 'sec_3_a', name: 'A' }] },
  { _id: 'class_4', name: 'Class 4', shortName: 'C4', classGroup: 'Classes 3–5', order: 6, sections: [{ _id: 'sec_4_a', name: 'A' }] },
  { _id: 'class_5', name: 'Class 5', shortName: 'C5', classGroup: 'Classes 3–5', order: 7, sections: [{ _id: 'sec_5_a', name: 'A' }] },
  { _id: 'class_6', name: 'Class 6', shortName: 'C6', classGroup: 'Classes 6–8', order: 8, sections: [{ _id: 'sec_6_a', name: 'A' }] },
  { _id: 'class_7', name: 'Class 7', shortName: 'C7', classGroup: 'Classes 6–8', order: 9, sections: [{ _id: 'sec_7_a', name: 'A' }] },
  { _id: 'class_8', name: 'Class 8', shortName: 'C8', classGroup: 'Classes 6–8', order: 10, sections: [{ _id: 'sec_8_a', name: 'A' }] },
  { _id: 'class_9', name: 'Class 9', shortName: 'C9', classGroup: 'Classes 9–12', order: 11, sections: [{ _id: 'sec_9_a', name: 'A' }] },
  { _id: 'class_10', name: 'Class 10', shortName: 'C10', classGroup: 'Classes 9–12', order: 12, sections: [{ _id: 'sec_10_a', name: 'A' }] },
  { _id: 'class_11', name: 'Class 11', shortName: 'C11', classGroup: 'Classes 9–12', order: 13, sections: [{ _id: 'sec_11_a', name: 'A' }] },
  { _id: 'class_12', name: 'Class 12', shortName: 'C12', classGroup: 'Classes 9–12', order: 14, sections: [{ _id: 'sec_12_a', name: 'A' }] },
];

const SEED_YEARS = [
  { _id: 'year_2024_25', label: '2024-25', startDate: '2024-06-01', endDate: '2025-03-31', isCurrent: true },
];

const SEED_TERMS = [
  { _id: 'term_1', name: 'Term 1', termNumber: 1, academicYear: 'year_2024_25', startDate: '2024-06-01', endDate: '2024-09-30', isCurrent: true, isLocked: false },
  { _id: 'term_2', name: 'Term 2', termNumber: 2, academicYear: 'year_2024_25', startDate: '2024-10-01', endDate: '2024-12-31', isCurrent: false, isLocked: false },
  { _id: 'term_3', name: 'Term 3', termNumber: 3, academicYear: 'year_2024_25', startDate: '2025-01-01', endDate: '2025-03-31', isCurrent: false, isLocked: false },
];

export const DEMO_USERS = [
  { _id: 'user_admin',         name: 'Demo Admin',         email: 'admin@demo.ksv',         password: 'Demo@1234', role: 'admin',         isActive: true, assignedClasses: [], assignedSkillAreas: [], assignedSubSkills: [] },
  { _id: 'user_class_teacher', name: 'Demo Class Teacher', email: 'classteacher@demo.ksv',  password: 'Demo@1234', role: 'class_teacher', isActive: true, assignedClasses: ['class_5'], assignedSkillAreas: [], assignedSubSkills: [] },
  { _id: 'user_skill_teacher', name: 'Demo Skills Teacher', email: 'skillteacher@demo.ksv',  password: 'Demo@1234', role: 'skill_teacher', isActive: true, assignedClasses: [], assignedSkillAreas: ['area_9'], assignedSubSkills: ['sub_33', 'sub_34', 'sub_35', 'sub_36'] },
];

const SEED_STUDENTS = [
  {
    _id: 'student_demo_1',
    name: 'Demo Student',
    admissionNumber: 'DEMO-001',
    class: 'class_5',
    section: 'A',
    academicYear: 'year_2024_25',
    gender: 'male',
    userAccount: 'user_student',
    rollNumber: '01',
  },
  {
    _id: 'student_demo_2',
    name: 'Ananya Sharma',
    admissionNumber: 'DEMO-002',
    class: 'class_5',
    section: 'A',
    academicYear: 'year_2024_25',
    gender: 'female',
    rollNumber: '02',
  },
  {
    _id: 'student_demo_3',
    name: 'Rahul K.',
    admissionNumber: 'DEMO-003',
    class: 'class_6',
    section: 'A',
    academicYear: 'year_2024_25',
    gender: 'male',
    rollNumber: '03',
  },
  {
    _id: 'student_demo_4',
    name: 'Priya Sundaram',
    admissionNumber: 'DEMO-004',
    class: 'class_4',
    section: 'A',
    academicYear: 'year_2024_25',
    gender: 'female',
    rollNumber: '04',
  },
];

const SEED_CLASSROOM_PERFORMANCES = [
  {
    _id: 'crp_1',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_1',
    subSkill: 'sub_2',
    activityTitle: 'Mental Arithmetic & Vedic Math Quiz',
    performanceDescription: 'Completed 20 mental addition and multiplication problems within 3 minutes without visual aids.',
    performanceDate: '2024-10-15',
    teacherObservation: 'Demonstrated rapid calculation, accuracy, and clear understanding of mathematical patterns.',
    performanceLevel: 'Proficient',
    supportingFiles: [
      {
        id: 'file_math_1',
        name: 'numeracy_worksheet.pdf',
        type: 'application/pdf',
        size: 124000,
        description: 'Mathematics speed calculation activity worksheet and score card.',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hPU0jJTE5VSMsvLUpV8CxRMDTSM9Az0TOwMDY2NDCyMjEAAOYODG4KZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjM5CmVuZG9iagoxIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyAzIDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTcwIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDI3NiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzU0CiUlRU9GCg==',
        createdAt: '2024-10-15T10:00:00.000Z',
      },
    ],
    photos: [
      {
        id: 'photo_math_1',
        name: 'student_solving_board.jpg',
        type: 'image/svg+xml',
        size: 2150,
        description: 'Student solving speed math equations on the classroom chalkboard.',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%231e3a5f"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Math Activity Photo</text><text x="50%" y="60%" fill="%2338bdf8" font-size="14" font-family="sans-serif" text-anchor="middle">Student Solving Board</text></svg>',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%231e3a5f"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Math Activity Photo</text><text x="50%" y="60%" fill="%2338bdf8" font-size="14" font-family="sans-serif" text-anchor="middle">Student Solving Board</text></svg>',
        createdAt: '2024-10-15T10:05:00.000Z',
      },
    ],
    teacherName: 'Demo Class Teacher',
    createdBy: 'user_class_teacher',
    createdAt: '2024-10-15T10:10:00.000Z',
  },
  {
    _id: 'crp_2',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_9',
    subSkill: 'sub_33',
    activityTitle: 'Inter-House Football Passing Drill',
    performanceDescription: 'Led the squad through dynamic 4-touch and 2-touch passing combinations on the school grounds.',
    performanceDate: '2024-10-18',
    teacherObservation: 'Displayed superior sportsmanship, agility, and encouraging peer communication.',
    performanceLevel: 'Advanced',
    supportingFiles: [
      {
        id: 'file_sports_1',
        name: 'drill_scorecard.pdf',
        type: 'application/pdf',
        size: 85000,
        description: 'Physical education drill rubric and assessment time evaluation sheet.',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hPU0jJTE5VSMsvLUpV8CxRMDTSM9Az0TOwMDY2NDCyMjEAAOYODG4KZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjM5CmVuZG9iagoxIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyAzIDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTcwIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDI3NiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzU0CiUlRU9GCg==',
        createdAt: '2024-10-18T11:00:00.000Z',
      },
    ],
    photos: [
      {
        id: 'photo_sports_1',
        name: 'football_drill.jpg',
        type: 'image/svg+xml',
        size: 2450,
        description: 'Student demonstrating offensive passing drill on the football field.',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%2315803d"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Sports Photo</text><text x="50%" y="60%" fill="%2386efac" font-size="14" font-family="sans-serif" text-anchor="middle">Team Games Drill</text></svg>',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%2315803d"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Sports Photo</text><text x="50%" y="60%" fill="%2386efac" font-size="14" font-family="sans-serif" text-anchor="middle">Team Games Drill</text></svg>',
        createdAt: '2024-10-18T11:05:00.000Z',
      },
    ],
    teacherName: 'Demo Skill Teacher',
    createdBy: 'user_skill_teacher',
    createdAt: '2024-10-18T11:10:00.000Z',
  },
  {
    _id: 'crp_3',
    student: 'student_demo_3',
    class: 'class_6',
    section: 'A',
    skillArea: 'area_2',
    subSkill: 'sub_6',
    activityTitle: 'Class 6 Debate on Renewable Energy',
    performanceDescription: 'Presented well-researched arguments on solar power adoption.',
    performanceDate: '2024-10-20',
    teacherObservation: 'Clear diction, strong reasoning, and composed delivery.',
    performanceLevel: 'Proficient',
    supportingFiles: [],
    photos: [],
    teacherName: 'Senior Science Teacher',
    createdBy: 'user_admin',
    createdAt: '2024-10-20T09:00:00.000Z',
  },
];

const SEED_COMPETITION_PERFORMANCES = [
  {
    _id: 'cmp_1',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_2',
    subSkill: 'sub_5',
    competitionName: 'Kanchi Inter-School Elocution Contest 2024',
    competitionType: 'Inter-School',
    competitionDate: '2024-09-28',
    organizer: 'District Youth Cultural Association',
    participationStatus: 'Winner',
    achievement: 'First Place',
    awardDetails: 'Gold Medal and Trophy for Best Orator in Junior Category',
    description: 'Delivered an inspirational 5-minute speech on "Technology, Culture and Human Values".',
    supportingFiles: [
      {
        id: 'file_cert_1',
        name: 'first_prize_certificate.pdf',
        type: 'application/pdf',
        size: 195000,
        description: 'First Place Winner Merit Certificate issued by District Cultural Committee.',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hPU0jJTE5VSMsvLUpV8CxRMDTSM9Az0TOwMDY2NDCyMjEAAOYODG4KZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjM5CmVuZG9iagoxIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyAzIDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTcwIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDI3NiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzU0CiUlRU9GCg==',
        createdAt: '2024-09-28T14:00:00.000Z',
      },
    ],
    photos: [
      {
        id: 'photo_comp_1',
        name: 'trophy_presentation.jpg',
        type: 'image/svg+xml',
        size: 4200,
        description: 'Student receiving First Place trophy and certificate from Chief Guest.',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%237e22ce"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Award Ceremony</text><text x="50%" y="60%" fill="%23fde047" font-size="14" font-family="sans-serif" text-anchor="middle">First Place Trophy</text></svg>',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%237e22ce"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Award Ceremony</text><text x="50%" y="60%" fill="%23fde047" font-size="14" font-family="sans-serif" text-anchor="middle">First Place Trophy</text></svg>',
        createdAt: '2024-09-28T14:10:00.000Z',
      },
    ],
    createdBy: 'user_class_teacher',
    createdAt: '2024-09-28T14:15:00.000Z',
  },
  {
    _id: 'cmp_2',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_9',
    subSkill: 'sub_34',
    competitionName: 'Annual District Junior Athletics Meet',
    competitionType: 'District',
    competitionDate: '2024-10-05',
    organizer: 'Tamil Nadu Sports Development Authority',
    participationStatus: 'Participated',
    achievement: 'Participation',
    awardDetails: 'Certificate of Athletic Participation in Under-12 100m Sprint',
    description: 'Represented school in the under-12 boys 100m sprint heats with 14.8 seconds timing.',
    supportingFiles: [
      {
        id: 'file_part_1',
        name: 'participation_certificate.pdf',
        type: 'application/pdf',
        size: 140000,
        description: 'District Athletics Meet official participation certificate.',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxLV8hPU0jJTE5VSMsvLUpV8CxRMDTSM9Az0TOwMDY2NDCyMjEAAOYODG4KZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjM5CmVuZG9iagoxIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyAzIDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTcwIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDI3NiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzU0CiUlRU9GCg==',
        createdAt: '2024-10-05T16:00:00.000Z',
      },
    ],
    photos: [
      {
        id: 'photo_sprint_1',
        name: 'sprint_starting_blocks.jpg',
        type: 'image/svg+xml',
        size: 2800,
        description: 'Student at the starting blocks for the 100m sprint heat.',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23c2410c"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Athletics Meet</text><text x="50%" y="60%" fill="%23fed7aa" font-size="14" font-family="sans-serif" text-anchor="middle">100m Sprint Heat</text></svg>',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23c2410c"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">Athletics Meet</text><text x="50%" y="60%" fill="%23fed7aa" font-size="14" font-family="sans-serif" text-anchor="middle">100m Sprint Heat</text></svg>',
        createdAt: '2024-10-05T16:15:00.000Z',
      },
    ],
    createdBy: 'user_skill_teacher',
    createdAt: '2024-10-05T16:20:00.000Z',
  },
  {
    _id: 'cmp_3',
    student: 'student_demo_3',
    class: 'class_6',
    section: 'A',
    skillArea: 'area_2',
    subSkill: 'sub_6',
    competitionName: 'State Level Debate Championship',
    competitionType: 'State',
    competitionDate: '2024-10-12',
    organizer: 'State Literary Guild',
    participationStatus: 'Runner Up',
    achievement: 'Second Place',
    awardDetails: 'Silver Medal and Certificate of Excellence',
    description: 'Secured second place in the state junior debate round.',
    supportingFiles: [],
    photos: [],
    createdBy: 'user_admin',
    createdAt: '2024-10-12T10:00:00.000Z',
  },
];

const SEED_ASSESSMENTS = [
  {
    _id: 'ass_1',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_1',
    subSkill: 'sub_1',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 3,
    remarks: 'Consistent fluency in English and regional reading passages.',
    status: 'approved',
    evidence: [
      {
        id: 'ev_1',
        name: 'reading_evaluation.pdf',
        type: 'application/pdf',
        size: 142000,
        description: 'Term 1 oral reading assessment performance rubric score sheet.',
        createdAt: new Date().toISOString(),
      },
    ],
    createdBy: 'user_class_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_2',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_2',
    subSkill: 'sub_9',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 3,
    remarks: 'Excellent short story composition with creative plot structure.',
    status: 'approved',
    evidence: [],
    createdBy: 'user_class_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_3',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_3',
    subSkill: 'sub_12',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 4,
    remarks: 'Demonstrated exceptional stage presence and confidence in morning assembly speech.',
    status: 'approved',
    evidence: [
      {
        id: 'ev_2',
        name: 'speech_photo.jpg',
        type: 'image/jpeg',
        size: 284000,
        description: 'Photo of student delivering elocution speech during Inter-House Assembly.',
        createdAt: new Date().toISOString(),
      },
    ],
    createdBy: 'user_skill_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_4',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_5',
    subSkill: 'sub_19',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 4,
    remarks: 'Fast mental arithmetic calculation without visual aids.',
    status: 'approved',
    evidence: [],
    createdBy: 'user_class_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_5',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_7',
    subSkill: 'sub_27',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 3,
    remarks: 'Creative drawing with harmonious color balance.',
    status: 'approved',
    evidence: [
      {
        id: 'ev_3',
        name: 'artwork_photo.png',
        type: 'image/png',
        size: 512000,
        description: 'Photo description: Student watercolor landscape painting created in art class.',
        createdAt: new Date().toISOString(),
      },
    ],
    createdBy: 'user_skill_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_6',
    student: 'student_demo_1',
    class: 'class_5',
    section: 'A',
    skillArea: 'area_9',
    subSkill: 'sub_33',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 4,
    remarks: 'Outstanding speed, stamina, and agility in inter-house football drills.',
    status: 'approved',
    evidence: [],
    createdBy: 'user_skill_teacher',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ass_7',
    student: 'student_demo_3',
    class: 'class_6',
    section: 'A',
    skillArea: 'area_2',
    subSkill: 'sub_6',
    academicYear: 'year_2024_25',
    term: 'term_1',
    assessmentDate: new Date().toISOString(),
    level: 3,
    remarks: 'Articulate delivery and structured rebuttal skills in debate.',
    status: 'approved',
    evidence: [],
    createdBy: 'user_admin',
    reviewedBy: 'user_admin',
    createdAt: new Date().toISOString(),
  },
];

const SEED_GALLERY_ALBUMS = [
  {
    _id: 'album_1',
    title: 'Annual Arts & Skills Exhibition 2024-25',
    description: 'Highlights of student artwork, robotics projects, and craft creations.',
    isPublic: true,
    coverImage: '',
    createdAt: new Date().toISOString(),
  },
];

const SEED_GALLERY_ITEMS = [
  {
    _id: 'gitem_1',
    album: 'album_1',
    type: 'photo',
    title: 'Student Watercolor Landscape',
    caption: 'Watercolor landscape artwork by Class 5 students.',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

const SEED_COMPETITIONS = [
  {
    _id: 'comp_1',
    title: '[Demo] Annual Skill Showcase & Elocution',
    description: 'Demonstration competition for testing the KSV Skill Sets portal.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    venue: 'School Auditorium',
    level: 'school',
    format: 'individual',
    academicYear: 'year_2024_25',
    createdAt: new Date().toISOString(),
  },
];

const SEED_ANNOUNCEMENTS = [
  {
    _id: 'ann_1',
    title: 'Welcome to KSV Skill Sets Portal',
    content: 'The new student skill tracking portal is now active for all classes.',
    createdAt: new Date().toISOString(),
  },
];

// ── Storage Helpers ───────────────────────────────────────────────────────────
function getLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

function getStored(key, defaultVal) {
  const storage = getLocalStorage();
  if (!storage) return defaultVal;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Failed to write to localStorage for key ${key}:`, err);
  }
}

// Ensure initial seed data exists in localStorage
export function initLocalStore() {
  const storage = getLocalStorage();
  if (!storage) return;

  const existingAreas = getStored(STORAGE_KEYS.SKILL_AREAS, null);
  if (!existingAreas || existingAreas.length !== 12 || existingAreas[0]?.name !== 'Academic') {
    setStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    setStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
  }

  if (!storage.getItem(STORAGE_KEYS.CLASSES)) setStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
  if (!storage.getItem(STORAGE_KEYS.ACADEMIC_YEARS)) setStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS);
  if (!storage.getItem(STORAGE_KEYS.ACADEMIC_TERMS)) setStored(STORAGE_KEYS.ACADEMIC_TERMS, SEED_TERMS);

  // Sync users: Only allow admin, class_teacher, and skill_teacher. Remove any obsolete student/parent accounts.
  const storedUsers = getStored(STORAGE_KEYS.USERS, null);
  if (!storedUsers) {
    setStored(STORAGE_KEYS.USERS, DEMO_USERS);
  } else {
    let cleaned = storedUsers.filter((u) => u.role === 'admin' || u.role === 'class_teacher' || u.role === 'skill_teacher');
    // Ensure the 3 core demo users exist and have updated assignments
    DEMO_USERS.forEach((demo) => {
      const idx = cleaned.findIndex((u) => u.email.toLowerCase() === demo.email.toLowerCase());
      if (idx !== -1) {
        cleaned[idx] = {
          ...cleaned[idx],
          name: demo.name,
          role: demo.role,
          password: demo.password,
          assignedClasses: cleaned[idx].assignedClasses?.length ? cleaned[idx].assignedClasses : demo.assignedClasses,
          assignedSkillAreas: cleaned[idx].assignedSkillAreas?.length ? cleaned[idx].assignedSkillAreas : demo.assignedSkillAreas,
          assignedSubSkills: cleaned[idx].assignedSubSkills?.length ? cleaned[idx].assignedSubSkills : demo.assignedSubSkills,
        };
      } else {
        cleaned.push(demo);
      }
    });
    setStored(STORAGE_KEYS.USERS, cleaned);
  }

  // Purge any active student/parent login session
  const current = getStored(STORAGE_KEYS.CURRENT_USER, null);
  if (current && (current.role === 'student' || current.role === 'parent')) {
    storage.removeItem(STORAGE_KEYS.CURRENT_USER);
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
  }

  const existingStudents = getStored(STORAGE_KEYS.STUDENTS, null);
  if (!existingStudents || existingStudents.length < SEED_STUDENTS.length) {
    setStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
  }

  const existingAssessments = getStored(STORAGE_KEYS.ASSESSMENTS, null);
  if (!existingAssessments || existingAssessments.length < SEED_ASSESSMENTS.length) {
    setStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
  }

  const existingCrp = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, null);
  if (!existingCrp || existingCrp.length < SEED_CLASSROOM_PERFORMANCES.length) {
    setStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
  }

  const existingCmp = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, null);
  if (!existingCmp || existingCmp.length < SEED_COMPETITION_PERFORMANCES.length) {
    setStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
  }
  if (!storage.getItem(STORAGE_KEYS.GALLERY_ALBUMS)) setStored(STORAGE_KEYS.GALLERY_ALBUMS, SEED_GALLERY_ALBUMS);
  if (!storage.getItem(STORAGE_KEYS.GALLERY_ITEMS)) setStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
  if (!storage.getItem(STORAGE_KEYS.COMPETITIONS)) setStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
  if (!storage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) setStored(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
}

// Auto-run initialization
initLocalStore();

// ── Active User Helper (Always synchronized with latest admin assignments) ────
export function getCurrentUser() {
  const current = getStored(STORAGE_KEYS.CURRENT_USER, null);
  if (!current) return null;
  const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
  const latest = users.find(
    (u) => u._id === current._id || (u.email && u.email.toLowerCase() === (current.email || '').toLowerCase())
  );
  if (latest) {
    return {
      _id: latest._id,
      name: latest.name,
      email: latest.email,
      role: latest.role,
      assignedClasses: latest.assignedClasses || [],
      assignedSkillAreas: latest.assignedSkillAreas || [],
      assignedSubSkills: latest.assignedSubSkills || [],
      isActive: latest.isActive,
    };
  }
  return current;
}

// ── Entity Population Helpers ─────────────────────────────────────────────────
export function populateClassroomPerformance(item) {
  if (!item) return null;
  const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
  const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
  const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
  const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
  const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);

  const studentObj = students.find((s) => s._id === (item.student?._id || item.student)) || item.student || {};
  const classId = item.class?._id || item.class || studentObj.class;
  const classObj = classes.find((c) => c._id === classId) || { _id: classId, name: 'Class 5' };
  const areaObj = areas.find((ar) => ar._id === (item.skillArea?._id || item.skillArea)) || item.skillArea || { name: 'Academic' };
  const subObj = subSkills.find((s) => s._id === (item.subSkill?._id || item.subSkill)) || item.subSkill || { name: 'Sub-Skill' };
  const createdByObj = users.find((u) => u._id === (item.createdBy?._id || item.createdBy)) || item.createdBy || {};

  return {
    ...item,
    student: {
      _id: studentObj._id || item.student,
      name: studentObj.name || 'Demo Student',
      admissionNumber: studentObj.admissionNumber || 'DEMO-001',
      class: classObj,
      section: studentObj.section || item.section || 'A',
    },
    class: classObj,
    skillArea: {
      _id: areaObj._id || item.skillArea,
      name: areaObj.name || 'Academic',
      color: areaObj.color || '#2563eb',
      icon: areaObj.icon,
      emoji: areaObj.emoji,
    },
    subSkill: {
      _id: subObj._id || item.subSkill,
      name: subObj.name || 'Sub-Skill',
      skillArea: areaObj,
    },
    teacherName: item.teacherName || createdByObj.name || 'Class Teacher',
    supportingFiles: item.supportingFiles || [],
    photos: item.photos || [],
  };
}

export function populateCompetitionPerformance(item) {
  if (!item) return null;
  const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
  const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
  const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
  const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
  const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);

  const studentObj = students.find((s) => s._id === (item.student?._id || item.student)) || item.student || {};
  const classId = item.class?._id || item.class || studentObj.class;
  const classObj = classes.find((c) => c._id === classId) || { _id: classId, name: 'Class 5' };
  const areaObj = areas.find((ar) => ar._id === (item.skillArea?._id || item.skillArea)) || item.skillArea || { name: 'Academic' };
  const subObj = subSkills.find((s) => s._id === (item.subSkill?._id || item.subSkill)) || item.subSkill || { name: 'Sub-Skill' };
  const createdByObj = users.find((u) => u._id === (item.createdBy?._id || item.createdBy)) || item.createdBy || {};

  return {
    ...item,
    student: {
      _id: studentObj._id || item.student,
      name: studentObj.name || 'Demo Student',
      admissionNumber: studentObj.admissionNumber || 'DEMO-001',
      class: classObj,
      section: studentObj.section || item.section || 'A',
    },
    class: classObj,
    skillArea: {
      _id: areaObj._id || item.skillArea,
      name: areaObj.name || 'Academic',
      color: areaObj.color || '#2563eb',
      icon: areaObj.icon,
      emoji: areaObj.emoji,
    },
    subSkill: {
      _id: subObj._id || item.subSkill,
      name: subObj.name || 'Sub-Skill',
      skillArea: areaObj,
    },
    teacherName: item.teacherName || createdByObj.name || 'Teacher',
    supportingFiles: item.supportingFiles || [],
    photos: item.photos || [],
  };
}
function populateAssessment(a) {
  const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
  const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
  const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
  const terms = getStored(STORAGE_KEYS.ACADEMIC_TERMS, SEED_TERMS);
  const years = getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS);
  const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
  const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);

  const studentObj = students.find((s) => s._id === (a.student?._id || a.student)) || a.student || {};
  const classObj = classes.find((c) => c._id === (studentObj.class || a.class)) || {};
  const areaObj = areas.find((ar) => ar._id === (a.skillArea?._id || a.skillArea)) || a.skillArea || {};
  const subObj = subSkills.find((s) => s._id === (a.subSkill?._id || a.subSkill)) || a.subSkill || {};
  const termObj = terms.find((t) => t._id === (a.term?._id || a.term)) || a.term || {};
  const yearObj = years.find((y) => y._id === (a.academicYear?._id || a.academicYear)) || a.academicYear || {};
  const createdByObj = users.find((u) => u._id === (a.createdBy?._id || a.createdBy)) || a.createdBy || {};

  return {
    ...a,
    student: {
      _id: studentObj._id || a.student,
      name: studentObj.name || 'Demo Student',
      admissionNumber: studentObj.admissionNumber || 'DEMO-001',
      class: classObj,
      section: studentObj.section || a.section || 'A',
    },
    skillArea: {
      _id: areaObj._id || a.skillArea,
      name: areaObj.name || 'Skill Area',
      color: areaObj.color || '#3b82f6',
    },
    subSkill: {
      _id: subObj._id || a.subSkill,
      name: subObj.name || 'Sub-Skill',
      skillArea: areaObj,
    },
    term: {
      _id: termObj._id || a.term,
      name: termObj.name || 'Term 1',
      termNumber: termObj.termNumber || 1,
    },
    academicYear: {
      _id: yearObj._id || a.academicYear,
      label: yearObj.label || '2024-25',
    },
    createdBy: {
      _id: createdByObj._id || a.createdBy,
      name: createdByObj.name || 'Teacher',
    },
    evidence: a.evidence || [],
  };
}

// ── Local Authentication Service ──────────────────────────────────────────────
export const localAuth = {
  login: async (email, password) => {
    initLocalStore();
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const user = users.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase());

    if (!user || !user.isActive || user.password !== password) {
      const err = new Error('Invalid credentials');
      err.response = { status: 401, data: { success: false, message: 'Invalid credentials' } };
      throw err;
    }

    const accessToken = `local_token_${user._id}_${Date.now()}`;
    const refreshToken = `local_refresh_${user._id}_${Date.now()}`;

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedClasses: user.assignedClasses || [],
      assignedSkillAreas: user.assignedSkillAreas || [],
      assignedSubSkills: user.assignedSubSkills || [],
    };

    const storage = getLocalStorage();
    if (storage) {
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
    }
    setStored(STORAGE_KEYS.CURRENT_USER, safeUser);

    return {
      data: {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: safeUser,
        },
      },
    };
  },

  logout: async () => {
    const storage = getLocalStorage();
    if (storage) {
      storage.removeItem('accessToken');
      storage.removeItem('refreshToken');
      storage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    return { data: { success: true, message: 'Logged out' } };
  },

  refresh: async (refreshToken) => {
    const current = getStored(STORAGE_KEYS.CURRENT_USER, null);
    if (!current) {
      const err = new Error('Invalid refresh token');
      err.response = { status: 401, data: { success: false, message: 'Invalid refresh token' } };
      throw err;
    }
    const newAccess = `local_token_${current._id}_${Date.now()}`;
    const newRefresh = `local_refresh_${current._id}_${Date.now()}`;
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem('accessToken', newAccess);
      storage.setItem('refreshToken', newRefresh);
    }
    return { data: { success: true, data: { accessToken: newAccess, refreshToken: newRefresh } } };
  },

  getMe: async () => {
    const storage = getLocalStorage();
    const token = storage?.getItem('accessToken');
    const user = getCurrentUser();
    if (!token || !user) {
      const err = new Error('Unauthorized');
      err.response = { status: 401, data: { success: false, message: 'No token provided' } };
      throw err;
    }
    return { data: { success: true, data: user } };
  },

  setupAdmin: async (data) => {
    return { data: { success: true, data } };
  },
};

// ── Skills Areas Service ──────────────────────────────────────────────────────
export const localSkills = {
  listAreas: async (params = {}) => {
    initLocalStore();
    let areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'skill_teacher' && !params.all) {
      const assigned = currentUser.assignedSkillAreas || [];
      areas = areas.filter((a) => assigned.includes(a._id));
    }

    if (params.active !== 'false') {
      areas = areas.filter((a) => a.isActive !== false);
    }
    areas.sort((a, b) => (a.order || 0) - (b.order || 0));
    return { data: { success: true, data: areas } };
  },

  createArea: async (data) => {
    initLocalStore();
    const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    const newArea = {
      _id: `area_${Date.now()}`,
      order: areas.length + 1,
      isActive: true,
      ...data,
    };
    areas.push(newArea);
    setStored(STORAGE_KEYS.SKILL_AREAS, areas);
    return { data: { success: true, data: newArea } };
  },

  updateArea: async (id, data) => {
    initLocalStore();
    const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    const idx = areas.findIndex((a) => a._id === id);
    if (idx === -1) {
      const err = new Error('Skill area not found');
      err.response = { status: 404, data: { success: false, message: 'Skill area not found' } };
      throw err;
    }
    areas[idx] = { ...areas[idx], ...data };
    setStored(STORAGE_KEYS.SKILL_AREAS, areas);
    return { data: { success: true, data: areas[idx] } };
  },

  listSubSkills: async (params = {}) => {
    initLocalStore();
    let subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
    const areas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'skill_teacher' && !params.all) {
      const assignedAreas = currentUser.assignedSkillAreas || [];
      subSkills = subSkills.filter((s) => assignedAreas.includes(s.skillArea?._id || s.skillArea));
    }

    if (params.skillArea) {
      subSkills = subSkills.filter((s) => s.skillArea?._id === params.skillArea || s.skillArea === params.skillArea);
    }
    if (params.active !== 'false') {
      subSkills = subSkills.filter((s) => s.isActive !== false);
    }

    const populated = subSkills.map((s) => {
      const area = areas.find((a) => a._id === (s.skillArea?._id || s.skillArea));
      return {
        ...s,
        skillArea: area ? { _id: area._id, name: area.name } : s.skillArea,
      };
    });

    return { data: { success: true, data: populated } };
  },

  createSubSkill: async (data) => {
    initLocalStore();
    const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
    const newSub = {
      _id: `sub_${Date.now()}`,
      order: subSkills.length + 1,
      isActive: true,
      ...data,
    };
    subSkills.push(newSub);
    setStored(STORAGE_KEYS.SUB_SKILLS, subSkills);
    return { data: { success: true, data: newSub } };
  },

  updateSubSkill: async (id, data) => {
    initLocalStore();
    const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
    const idx = subSkills.findIndex((s) => s._id === id);
    if (idx === -1) {
      const err = new Error('Sub-skill not found');
      err.response = { status: 404, data: { success: false, message: 'Sub-skill not found' } };
      throw err;
    }
    subSkills[idx] = { ...subSkills[idx], ...data };
    setStored(STORAGE_KEYS.SUB_SKILLS, subSkills);
    return { data: { success: true, data: subSkills[idx] } };
  },
};

// ── Assessments Service (Skills Areas Performance Records) ───────────────────
export const localAssessments = {
  list: async (params = {}) => {
    initLocalStore();
    let list = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
    const currentUser = getCurrentUser();

    // Enforce role-based isolation
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      list = list.filter((a) => assigned.includes(a.class?._id || a.class));
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      list = list.filter((a) => assigned.includes(a.skillArea?._id || a.skillArea));
    }

    if (params.status) {
      list = list.filter((a) => a.status === params.status);
    }
    if (params.student) {
      list = list.filter((a) => (a.student?._id || a.student) === params.student);
    }
    if (params.class) {
      list = list.filter((a) => (a.class?._id || a.class) === params.class);
    }
    if (params.skillArea) {
      list = list.filter((a) => (a.skillArea?._id || a.skillArea) === params.skillArea);
    }

    const populated = list.map(populateAssessment);
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 20;
    const start = (page - 1) * limit;
    const paginatedItems = populated.slice(start, start + limit);

    return {
      data: {
        success: true,
        data: paginatedItems,
        pagination: {
          total: populated.length,
          page,
          limit,
          pages: Math.ceil(populated.length / limit) || 1,
        },
      },
    };
  },

  get: async (id) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
    const currentUser = getCurrentUser();
    const item = list.find((a) => a._id === id);
    if (!item) {
      const err = new Error('Assessment not found');
      err.response = { status: 404, data: { success: false, message: 'Assessment not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Unauthorized to view assessment for unassigned class');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Unauthorized to view assessment for unassigned skill area');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    return { data: { success: true, data: populateAssessment(item) } };
  },

  create: async (data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
    const currentUser = getCurrentUser();

    // Permission enforcement
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(data.class)) {
        const err = new Error('Class Teacher can only create assessments for assigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(data.skillArea)) {
        const err = new Error('Skills Teacher can only create assessments for assigned skill areas');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    const newAssessment = {
      _id: `ass_${Date.now()}`,
      student: data.student,
      class: data.class,
      section: data.section || 'A',
      skillArea: data.skillArea,
      subSkill: data.subSkill,
      academicYear: data.academicYear,
      term: data.term,
      assessmentDate: data.assessmentDate || new Date().toISOString(),
      level: parseInt(data.level, 10) || 1,
      remarks: data.remarks || '',
      status: 'draft',
      evidence: data.evidence || [],
      createdBy: currentUser?._id || 'user_class_teacher',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newAssessment);
    setStored(STORAGE_KEYS.ASSESSMENTS, list);
    return { data: { success: true, data: populateAssessment(newAssessment) } };
  },

  update: async (id, data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
    const currentUser = getCurrentUser();
    const idx = list.findIndex((a) => a._id === id);
    if (idx === -1) {
      const err = new Error('Assessment not found');
      err.response = { status: 404, data: { success: false, message: 'Assessment not found' } };
      throw err;
    }

    const item = list[idx];
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Class Teacher cannot edit assessments of unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Skills Teacher cannot edit assessments of unassigned skill areas');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    setStored(STORAGE_KEYS.ASSESSMENTS, list);
    return { data: { success: true, data: populateAssessment(list[idx]) } };
  },

  submit: async (id) => {
    return localAssessments.update(id, { status: 'submitted' });
  },

  approve: async (id, data = {}) => {
    const currentUser = getCurrentUser();
    return localAssessments.update(id, {
      status: 'approved',
      reviewedBy: currentUser?._id || 'user_admin',
      reviewedAt: new Date().toISOString(),
      reviewNote: data.note || '',
    });
  },

  reject: async (id, data = {}) => {
    const currentUser = getCurrentUser();
    return localAssessments.update(id, {
      status: 'rejected',
      reviewedBy: currentUser?._id || 'user_admin',
      reviewedAt: new Date().toISOString(),
      reviewNote: data.note || '',
    });
  },

  bulk: async (data) => {
    initLocalStore();
    return { data: { success: true, message: 'Assessments recorded' } };
  },

  notAssessed: async () => {
    initLocalStore();
    return { data: { success: true, data: [] } };
  },
};

// ── Classroom Performances Service (Module 4 & Module 9) ──────────────────────
export const localClassroomPerformances = {
  list: async (params = {}) => {
    initLocalStore();
    let list = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
    const currentUser = getCurrentUser();

    // Apply role-based filtering unless explicitly public view request
    if (params.public !== true && params.public !== 'true') {
      if (currentUser?.role === 'class_teacher') {
        const assigned = currentUser.assignedClasses || [];
        list = list.filter((p) => assigned.includes(p.class?._id || p.class));
      } else if (currentUser?.role === 'skill_teacher') {
        const assigned = currentUser.assignedSkillAreas || [];
        list = list.filter((p) => assigned.includes(p.skillArea?._id || p.skillArea));
      }
    }

    if (params.student) {
      list = list.filter((p) => (p.student?._id || p.student) === params.student);
    }
    if (params.class) {
      list = list.filter((p) => (p.class?._id || p.class) === params.class);
    }
    if (params.skillArea) {
      list = list.filter((p) => (p.skillArea?._id || p.skillArea) === params.skillArea);
    }
    if (params.subSkill) {
      list = list.filter((p) => (p.subSkill?._id || p.subSkill) === params.subSkill);
    }
    if (params.performanceLevel) {
      list = list.filter((p) => p.performanceLevel === params.performanceLevel);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
      list = list.filter((p) => {
        const studentObj = students.find((s) => s._id === (p.student?._id || p.student));
        return (
          (p.activityTitle || '').toLowerCase().includes(q) ||
          (p.performanceDescription || '').toLowerCase().includes(q) ||
          (studentObj?.name || '').toLowerCase().includes(q) ||
          (studentObj?.admissionNumber || '').toLowerCase().includes(q)
        );
      });
    }

    // Sort by performanceDate descending
    list.sort((a, b) => new Date(b.performanceDate || b.createdAt) - new Date(a.performanceDate || a.createdAt));

    return { data: { success: true, data: list.map(populateClassroomPerformance) } };
  },

  get: async (id) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
    const currentUser = getCurrentUser();
    const item = list.find((p) => p._id === id);
    if (!item) {
      const err = new Error('Classroom performance record not found');
      err.response = { status: 404, data: { success: false, message: 'Record not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Unauthorized to access records outside assigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Unauthorized to access records outside assigned skills');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    return { data: { success: true, data: populateClassroomPerformance(item) } };
  },

  create: async (data) => {
    initLocalStore();
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(data.class)) {
        const err = new Error('Class Teacher cannot record performances for unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(data.skillArea)) {
        const err = new Error('Skills Teacher cannot record performances for unassigned skills');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    if (!data.class) {
      const err = new Error('Class is required');
      err.response = { status: 400, data: { success: false, message: 'Class is required' } };
      throw err;
    }
    if (!data.student) {
      const err = new Error('Student is required');
      err.response = { status: 400, data: { success: false, message: 'Student is required' } };
      throw err;
    }
    const title = (data.activityTitle || data.title || '').trim();
    if (!title) {
      const err = new Error('Activity Title is required');
      err.response = { status: 400, data: { success: false, message: 'Activity Title is required' } };
      throw err;
    }
    const perfDate = data.performanceDate || data.activityDate;
    if (!perfDate) {
      const err = new Error('Performance Date is required');
      err.response = { status: 400, data: { success: false, message: 'Performance Date is required' } };
      throw err;
    }
    const perfLevel = data.performanceLevel || data.level;
    if (!perfLevel) {
      const err = new Error('Performance Level is required');
      err.response = { status: 400, data: { success: false, message: 'Performance Level is required' } };
      throw err;
    }

    // Validate student-class relationship
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const studentObj = students.find((s) => s._id === data.student);
    if (studentObj && studentObj.class && studentObj.class !== data.class) {
      const err = new Error('Selected student does not belong to the selected class');
      err.response = { status: 400, data: { success: false, message: err.message } };
      throw err;
    }

    const list = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);

    const newRecord = {
      _id: `crp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      skillArea: data.skillArea,
      subSkill: data.subSkill,
      class: data.class,
      student: data.student,
      title: title,
      activityTitle: title,
      description: data.performanceDescription || data.description || '',
      performanceDescription: data.performanceDescription || data.description || '',
      activityDate: perfDate,
      performanceDate: perfDate,
      observationNotes: data.teacherObservation || data.observationNotes || '',
      teacherObservation: data.teacherObservation || data.observationNotes || '',
      level: perfLevel,
      performanceLevel: perfLevel,
      supportingFiles: Array.isArray(data.supportingFiles) ? data.supportingFiles : [],
      photos: Array.isArray(data.photos) ? data.photos : [],
      teacherName: data.teacherName || currentUser?.name || 'Class Teacher',
      createdBy: currentUser?._id || 'user_class_teacher',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newRecord);
    setStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, list);
    return { data: { success: true, data: populateClassroomPerformance(newRecord) } };
  },

  update: async (id, data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
    const currentUser = getCurrentUser();
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) {
      const err = new Error('Classroom performance record not found');
      err.response = { status: 404, data: { success: false, message: 'Record not found' } };
      throw err;
    }

    const item = list[idx];
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Class Teacher cannot edit records of unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Skills Teacher cannot edit records of unassigned skills');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    if (data.class && data.student) {
      const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
      const studentObj = students.find((s) => s._id === data.student);
      if (studentObj && studentObj.class && studentObj.class !== data.class) {
        const err = new Error('Selected student does not belong to the selected class');
        err.response = { status: 400, data: { success: false, message: err.message } };
        throw err;
      }
    }

    list[idx] = {
      ...list[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, list);
    return { data: { success: true, data: populateClassroomPerformance(list[idx]) } };
  },

  delete: async (id) => {
    initLocalStore();
    let list = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
    const currentUser = getCurrentUser();
    const item = list.find((p) => p._id === id);
    if (item) {
      if (currentUser?.role === 'class_teacher') {
        const assigned = currentUser.assignedClasses || [];
        if (!assigned.includes(item.class?._id || item.class)) {
          const err = new Error('Class Teacher cannot delete records of unassigned classes');
          err.response = { status: 403, data: { success: false, message: err.message } };
          throw err;
        }
      } else if (currentUser?.role === 'skill_teacher') {
        const assigned = currentUser.assignedSkillAreas || [];
        if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
          const err = new Error('Skills Teacher cannot delete records of unassigned skills');
          err.response = { status: 403, data: { success: false, message: err.message } };
          throw err;
        }
      }
    }
    list = list.filter((p) => p._id !== id);
    setStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, list);
    return { data: { success: true, message: 'Classroom performance deleted successfully' } };
  },
};

// ── Competition Performances Service (Module 5 & Module 9) ────────────────────
export const localCompetitionPerformances = {
  list: async (params = {}) => {
    initLocalStore();
    let list = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
    const currentUser = getCurrentUser();

    // Apply role-based filtering unless explicitly public view request
    if (params.public !== true && params.public !== 'true') {
      if (currentUser?.role === 'class_teacher') {
        const assigned = currentUser.assignedClasses || [];
        list = list.filter((p) => assigned.includes(p.class?._id || p.class));
      } else if (currentUser?.role === 'skill_teacher') {
        const assigned = currentUser.assignedSkillAreas || [];
        list = list.filter((p) => assigned.includes(p.skillArea?._id || p.skillArea));
      }
    }

    if (params.student) {
      list = list.filter((p) => (p.student?._id || p.student) === params.student);
    }
    if (params.class) {
      list = list.filter((p) => (p.class?._id || p.class) === params.class);
    }
    if (params.skillArea) {
      list = list.filter((p) => (p.skillArea?._id || p.skillArea) === params.skillArea);
    }
    if (params.subSkill) {
      list = list.filter((p) => (p.subSkill?._id || p.subSkill) === params.subSkill);
    }
    if (params.participationStatus) {
      list = list.filter((p) => p.participationStatus === params.participationStatus);
    }
    if (params.competitionType) {
      list = list.filter((p) => p.competitionType === params.competitionType);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
      list = list.filter((p) => {
        const studentObj = students.find((s) => s._id === (p.student?._id || p.student));
        return (
          (p.competitionName || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.organizer || '').toLowerCase().includes(q) ||
          (studentObj?.name || '').toLowerCase().includes(q) ||
          (studentObj?.admissionNumber || '').toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => new Date(b.competitionDate || b.createdAt) - new Date(a.competitionDate || a.createdAt));

    return { data: { success: true, data: list.map(populateCompetitionPerformance) } };
  },

  get: async (id) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
    const currentUser = getCurrentUser();
    const item = list.find((p) => p._id === id);
    if (!item) {
      const err = new Error('Competition performance record not found');
      err.response = { status: 404, data: { success: false, message: 'Record not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Unauthorized to view competition record for unassigned class');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Unauthorized to view competition record for unassigned skill');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    return { data: { success: true, data: populateCompetitionPerformance(item) } };
  },

  create: async (data) => {
    initLocalStore();
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(data.class)) {
        const err = new Error('Class Teacher cannot record competitions for unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(data.skillArea)) {
        const err = new Error('Skills Teacher cannot record competitions for unassigned skills');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    if (!data.class) {
      const err = new Error('Class is required');
      err.response = { status: 400, data: { success: false, message: 'Class is required' } };
      throw err;
    }
    if (!data.student) {
      const err = new Error('Student is required');
      err.response = { status: 400, data: { success: false, message: 'Student is required' } };
      throw err;
    }
    if (!data.competitionName?.trim()) {
      const err = new Error('Competition Name is required');
      err.response = { status: 400, data: { success: false, message: 'Competition Name is required' } };
      throw err;
    }
    if (!data.competitionDate) {
      const err = new Error('Competition Date is required');
      err.response = { status: 400, data: { success: false, message: 'Competition Date is required' } };
      throw err;
    }
    if (!data.participationStatus) {
      const err = new Error('Participation Status is required');
      err.response = { status: 400, data: { success: false, message: 'Participation Status is required' } };
      throw err;
    }

    // Winner validation requirement
    if (data.participationStatus === 'Winner' && (!data.achievement || data.achievement === 'Participation')) {
      const err = new Error('Winner status requires a valid winning achievement or rank (e.g. First Place, Second Place, Third Place, Special Award, Other)');
      err.response = { status: 400, data: { success: false, message: err.message } };
      throw err;
    }

    // Validate student-class relationship
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const studentObj = students.find((s) => s._id === data.student);
    if (studentObj && studentObj.class && studentObj.class !== data.class) {
      const err = new Error('Selected student does not belong to the selected class');
      err.response = { status: 400, data: { success: false, message: err.message } };
      throw err;
    }

    const list = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);

    const newRecord = {
      _id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      skillArea: data.skillArea,
      subSkill: data.subSkill,
      class: data.class,
      student: data.student,
      competitionName: data.competitionName.trim(),
      competitionType: data.competitionType || 'Inter-School',
      competitionDate: data.competitionDate,
      organizer: data.organizer || '',
      participationStatus: data.participationStatus,
      achievement: data.achievement || 'Participation',
      awardDetails: data.awardDetails || '',
      description: data.description || data.remarks || '',
      remarks: data.remarks || data.description || '',
      supportingFiles: Array.isArray(data.supportingFiles) ? data.supportingFiles : [],
      photos: Array.isArray(data.photos) ? data.photos : [],
      teacherName: currentUser?.name || 'Class Teacher',
      createdBy: currentUser?._id || 'user_class_teacher',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newRecord);
    setStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, list);
    return { data: { success: true, data: populateCompetitionPerformance(newRecord) } };
  },

  update: async (id, data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
    const currentUser = getCurrentUser();
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) {
      const err = new Error('Competition performance record not found');
      err.response = { status: 404, data: { success: false, message: 'Record not found' } };
      throw err;
    }

    const item = list[idx];
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(item.class?._id || item.class)) {
        const err = new Error('Class Teacher cannot edit records of unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const assigned = currentUser.assignedSkillAreas || [];
      if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
        const err = new Error('Skills Teacher cannot edit records of unassigned skills');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    if (data.participationStatus === 'Winner' && (!data.achievement || data.achievement === 'Participation')) {
      const err = new Error('Winner status requires a valid winning achievement or rank');
      err.response = { status: 400, data: { success: false, message: err.message } };
      throw err;
    }

    if (data.class && data.student) {
      const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
      const studentObj = students.find((s) => s._id === data.student);
      if (studentObj && studentObj.class && studentObj.class !== data.class) {
        const err = new Error('Selected student does not belong to the selected class');
        err.response = { status: 400, data: { success: false, message: err.message } };
        throw err;
      }
    }

    list[idx] = {
      ...list[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, list);
    return { data: { success: true, data: populateCompetitionPerformance(list[idx]) } };
  },

  delete: async (id) => {
    initLocalStore();
    let list = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
    const currentUser = getCurrentUser();
    const item = list.find((p) => p._id === id);
    if (item) {
      if (currentUser?.role === 'class_teacher') {
        const assigned = currentUser.assignedClasses || [];
        if (!assigned.includes(item.class?._id || item.class)) {
          const err = new Error('Class Teacher cannot delete records of unassigned classes');
          err.response = { status: 403, data: { success: false, message: err.message } };
          throw err;
        }
      } else if (currentUser?.role === 'skill_teacher') {
        const assigned = currentUser.assignedSkillAreas || [];
        if (!assigned.includes(item.skillArea?._id || item.skillArea)) {
          const err = new Error('Skills Teacher cannot delete records of unassigned skills');
          err.response = { status: 403, data: { success: false, message: err.message } };
          throw err;
        }
      }
    }
    list = list.filter((p) => p._id !== id);
    setStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, list);
    return { data: { success: true, message: 'Competition performance deleted successfully' } };
  },
};

// ── Classes Service ───────────────────────────────────────────────────────────
export const localClasses = {
  list: async (params = {}) => {
    initLocalStore();
    let classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'class_teacher' && !params.all) {
      const assigned = currentUser.assignedClasses || [];
      classes = classes.filter((c) => assigned.includes(c._id));
    }

    return { data: { success: true, data: classes } };
  },
  get: async (id) => {
    initLocalStore();
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const cls = classes.find((c) => c._id === id);
    return { data: { success: true, data: cls || classes[0] } };
  },
  create: async (data) => {
    initLocalStore();
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const newCls = { _id: `class_${Date.now()}`, sections: [{ name: 'A' }], ...data };
    classes.push(newCls);
    setStored(STORAGE_KEYS.CLASSES, classes);
    return { data: { success: true, data: newCls } };
  },
  update: async (id, data) => {
    initLocalStore();
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const idx = classes.findIndex((c) => c._id === id);
    if (idx !== -1) {
      classes[idx] = { ...classes[idx], ...data };
      setStored(STORAGE_KEYS.CLASSES, classes);
    }
    return { data: { success: true, data: classes[idx] } };
  },
  addSection: async (id, data) => {
    initLocalStore();
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const idx = classes.findIndex((c) => c._id === id);
    if (idx !== -1) {
      if (!classes[idx].sections) classes[idx].sections = [];
      classes[idx].sections.push({ _id: `sec_${Date.now()}`, name: data.name });
      setStored(STORAGE_KEYS.CLASSES, classes);
    }
    return { data: { success: true, data: classes[idx] } };
  },
  updateSection: async (id, sectionId, data) => {
    return localClasses.get(id);
  },
};

// ── Students Service ──────────────────────────────────────────────────────────
export const localStudents = {
  list: async (params = {}) => {
    initLocalStore();
    let students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const currentUser = getCurrentUser();

    // If Class Teacher, restrict to assigned classes
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      students = students.filter((s) => assigned.includes(s.class?._id || s.class));
      if (params.class && !assigned.includes(params.class)) {
        return { data: { success: true, data: [], pagination: { total: 0, page: 1, limit: 100, pages: 1 } } };
      }
    }

    if (params.class) {
      students = students.filter((s) => (s.class?._id || s.class) === params.class);
    }
    if (params.section) {
      students = students.filter((s) => (s.section || 'A').toUpperCase() === params.section.toUpperCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      students = students.filter((s) => (s.name || '').toLowerCase().includes(q) || (s.admissionNumber || '').toLowerCase().includes(q));
    }

    const populated = students.map((s) => {
      const cls = classes.find((c) => c._id === (s.class?._id || s.class));
      return { ...s, class: cls || { name: 'Class 5', _id: s.class } };
    });

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 100;
    const start = (page - 1) * limit;
    const paginated = populated.slice(start, start + limit);

    return {
      data: {
        success: true,
        data: paginated,
        pagination: { total: populated.length, page, limit, pages: Math.ceil(populated.length / limit) || 1 },
      },
    };
  },

  get: async (id) => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const currentUser = getCurrentUser();
    const s = students.find((st) => st._id === id);
    if (!s) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { success: false, message: 'Student not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(s.class?._id || s.class)) {
        const err = new Error('Unauthorized to view student outside assigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const cls = classes.find((c) => c._id === (s.class?._id || s.class));
    return { data: { success: true, data: { ...s, class: cls || { name: 'Class 5', _id: s.class } } } };
  },

  create: async (data) => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(data.class)) {
        const err = new Error('Class Teacher cannot add student to unassigned class');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const err = new Error('Skills Teacher cannot manage student enrollments');
      err.response = { status: 403, data: { success: false, message: err.message } };
      throw err;
    }

    const newS = { _id: `student_${Date.now()}`, ...data };
    students.push(newS);
    setStored(STORAGE_KEYS.STUDENTS, students);
    return { data: { success: true, data: newS } };
  },

  update: async (id, data) => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const currentUser = getCurrentUser();
    const idx = students.findIndex((s) => s._id === id);
    if (idx === -1) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { success: false, message: 'Student not found' } };
      throw err;
    }

    const target = students[idx];
    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(target.class?._id || target.class) || (data.class && !assigned.includes(data.class))) {
        const err = new Error('Class Teacher cannot edit student of unassigned class');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    } else if (currentUser?.role === 'skill_teacher') {
      const err = new Error('Skills Teacher cannot edit student enrollments');
      err.response = { status: 403, data: { success: false, message: err.message } };
      throw err;
    }

    students[idx] = { ...students[idx], ...data };
    setStored(STORAGE_KEYS.STUDENTS, students);
    return { data: { success: true, data: students[idx] } };
  },

  downloadTemplate: async () => new Blob(['AdmissionNumber,Name,Class,Section\nDEMO-002,Sample Student,Class 5,A'], { type: 'text/csv' }),
  importPreview: async () => ({ data: { success: true, data: [] } }),
  importSave: async () => ({ data: { success: true, data: [] } }),
};

// ── Academic Years & Terms Service ───────────────────────────────────────────
export const localAcademic = {
  listYears: async () => {
    initLocalStore();
    return { data: { success: true, data: getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS) } };
  },
  createYear: async (data) => {
    initLocalStore();
    const years = getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS);
    const newY = { _id: `year_${Date.now()}`, isCurrent: false, ...data };
    years.push(newY);
    setStored(STORAGE_KEYS.ACADEMIC_YEARS, years);
    return { data: { success: true, data: newY } };
  },
  updateYear: async (id, data) => {
    initLocalStore();
    const years = getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS);
    const idx = years.findIndex((y) => y._id === id);
    if (idx !== -1) {
      years[idx] = { ...years[idx], ...data };
      setStored(STORAGE_KEYS.ACADEMIC_YEARS, years);
    }
    return { data: { success: true, data: years[idx] } };
  },
  setCurrentYear: async (id) => {
    initLocalStore();
    const years = getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS).map((y) => ({
      ...y,
      isCurrent: y._id === id,
    }));
    setStored(STORAGE_KEYS.ACADEMIC_YEARS, years);
    return { data: { success: true, data: years.find((y) => y._id === id) } };
  },
  listTerms: async () => {
    initLocalStore();
    const terms = getStored(STORAGE_KEYS.ACADEMIC_TERMS, SEED_TERMS);
    const years = getStored(STORAGE_KEYS.ACADEMIC_YEARS, SEED_YEARS);
    const populated = terms.map((t) => {
      const year = years.find((y) => y._id === t.academicYear);
      return { ...t, academicYear: year || { label: '2024-25' } };
    });
    return { data: { success: true, data: populated } };
  },
  createTerm: async (data) => {
    initLocalStore();
    const terms = getStored(STORAGE_KEYS.ACADEMIC_TERMS, SEED_TERMS);
    const newT = { _id: `term_${Date.now()}`, isLocked: false, ...data };
    terms.push(newT);
    setStored(STORAGE_KEYS.ACADEMIC_TERMS, terms);
    return { data: { success: true, data: newT } };
  },
  updateTerm: async (id, data) => {
    initLocalStore();
    const terms = getStored(STORAGE_KEYS.ACADEMIC_TERMS, SEED_TERMS);
    const idx = terms.findIndex((t) => t._id === id);
    if (idx !== -1) {
      terms[idx] = { ...terms[idx], ...data };
      setStored(STORAGE_KEYS.ACADEMIC_TERMS, terms);
    }
    return { data: { success: true, data: terms[idx] } };
  },
  lockTerm: async (id) => localAcademic.updateTerm(id, { isLocked: true }),
  unlockTerm: async (id) => localAcademic.updateTerm(id, { isLocked: false }),
};

// ── Gallery Service ───────────────────────────────────────────────────────────
export const localGallery = {
  listAlbums: async () => {
    initLocalStore();
    return { data: { success: true, data: getStored(STORAGE_KEYS.GALLERY_ALBUMS, SEED_GALLERY_ALBUMS) } };
  },
  createAlbum: async (data) => {
    initLocalStore();
    const albums = getStored(STORAGE_KEYS.GALLERY_ALBUMS, SEED_GALLERY_ALBUMS);
    const newAlbum = { _id: `album_${Date.now()}`, isPublic: true, ...data };
    albums.push(newAlbum);
    setStored(STORAGE_KEYS.GALLERY_ALBUMS, albums);
    return { data: { success: true, data: newAlbum } };
  },
  updateAlbum: async (id, data) => {
    initLocalStore();
    const albums = getStored(STORAGE_KEYS.GALLERY_ALBUMS, SEED_GALLERY_ALBUMS);
    const idx = albums.findIndex((a) => a._id === id);
    if (idx !== -1) {
      albums[idx] = { ...albums[idx], ...data };
      setStored(STORAGE_KEYS.GALLERY_ALBUMS, albums);
    }
    return { data: { success: true, data: albums[idx] } };
  },
  listItems: async (albumId) => {
    initLocalStore();
    const items = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const filtered = items.filter((i) => i.album === albumId && i.status === 'approved');
    return { data: { success: true, data: filtered } };
  },
  submitItem: async (albumId, formData) => {
    initLocalStore();
    const items = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const title = formData?.get?.('title') || formData?.title || 'Gallery Submission';
    const type = formData?.get?.('type') || formData?.type || 'photo';
    const caption = formData?.get?.('caption') || formData?.caption || '';

    const newItem = {
      _id: `gitem_${Date.now()}`,
      album: albumId,
      title,
      type,
      caption,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStored(STORAGE_KEYS.GALLERY_ITEMS, items);
    return { data: { success: true, data: newItem } };
  },
  pendingItems: async () => {
    initLocalStore();
    const items = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const albums = getStored(STORAGE_KEYS.GALLERY_ALBUMS, SEED_GALLERY_ALBUMS);
    const pending = items
      .filter((i) => i.status === 'pending')
      .map((item) => ({
        ...item,
        album: albums.find((a) => a._id === item.album) || { title: 'General' },
      }));
    return { data: { success: true, data: pending } };
  },
  approveItem: async (id) => {
    initLocalStore();
    const items = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const idx = items.findIndex((i) => i._id === id);
    if (idx !== -1) {
      items[idx].status = 'approved';
      setStored(STORAGE_KEYS.GALLERY_ITEMS, items);
    }
    return { data: { success: true, data: items[idx] } };
  },
  rejectItem: async (id, data = {}) => {
    initLocalStore();
    const items = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const idx = items.findIndex((i) => i._id === id);
    if (idx !== -1) {
      items[idx].status = 'rejected';
      items[idx].rejectionReason = data.reason || '';
      setStored(STORAGE_KEYS.GALLERY_ITEMS, items);
    }
    return { data: { success: true, data: items[idx] } };
  },
};

// ── Reports Service ───────────────────────────────────────────────────────────
export const localReports = {
  dashboard: async () => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const skillAreas = getStored(STORAGE_KEYS.SKILL_AREAS, SEED_SKILL_AREAS);
    const subSkills = getStored(STORAGE_KEYS.SUB_SKILLS, SEED_SUB_SKILLS);
    const assessments = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
    const galleryItems = getStored(STORAGE_KEYS.GALLERY_ITEMS, SEED_GALLERY_ITEMS);
    const competitions = getStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const classroomPerformances = getStored(STORAGE_KEYS.CLASSROOM_PERFORMANCES, SEED_CLASSROOM_PERFORMANCES);
    const competitionPerformances = getStored(STORAGE_KEYS.COMPETITION_PERFORMANCES, SEED_COMPETITION_PERFORMANCES);
    const currentUser = getCurrentUser();

    if (currentUser?.role === 'class_teacher') {
      const assignedClassIds = currentUser.assignedClasses || [];
      const scopedClasses = classes.filter((c) => assignedClassIds.includes(c._id));
      const scopedStudents = students.filter((s) => assignedClassIds.includes(s.class?._id || s.class));
      const scopedStudentIds = scopedStudents.map((s) => s._id);

      const scopedAssessments = assessments.filter((a) => scopedStudentIds.includes(a.student?._id || a.student));
      const scopedClassroom = classroomPerformances.filter((cp) => assignedClassIds.includes(cp.class?._id || cp.class));
      const scopedCompetition = competitionPerformances.filter((cp) => scopedStudentIds.includes(cp.student?._id || cp.student));

      return {
        data: {
          success: true,
          data: {
            role: 'class_teacher',
            students: scopedStudents.length,
            classes: scopedClasses.length,
            assignedClasses: scopedClasses,
            totalAssessments: scopedAssessments.filter((a) => a.status === 'approved').length,
            assessmentsPending: scopedAssessments.filter((a) => a.status === 'submitted' || a.status === 'draft').length,
            classroomPerformances: scopedClassroom.length,
            competitionPerformances: scopedCompetition.length,
            totalRecords: scopedAssessments.length + scopedClassroom.length + scopedCompetition.length,
          },
        },
      };
    }

    if (currentUser?.role === 'skill_teacher') {
      const assignedAreaIds = currentUser.assignedSkillAreas || [];
      const scopedAreas = skillAreas.filter((a) => assignedAreaIds.includes(a._id));
      const scopedSubSkills = subSkills.filter((s) => assignedAreaIds.includes(s.skillArea?._id || s.skillArea));
      const scopedSubSkillIds = scopedSubSkills.map((s) => s._id);

      const scopedAssessments = assessments.filter((a) =>
        assignedAreaIds.includes(a.skillArea?._id || a.skillArea) ||
        scopedSubSkillIds.includes(a.subSkill?._id || a.subSkill)
      );
      const scopedCompetition = competitionPerformances.filter((cp) =>
        assignedAreaIds.includes(cp.skillArea?._id || cp.skillArea) ||
        scopedSubSkillIds.includes(cp.subSkill?._id || cp.subSkill)
      );

      const assessedStudentIds = new Set([
        ...scopedAssessments.map((a) => a.student?._id || a.student),
        ...scopedCompetition.map((cp) => cp.student?._id || cp.student),
      ]);

      return {
        data: {
          success: true,
          data: {
            role: 'skill_teacher',
            skillAreas: scopedAreas.length,
            subSkills: scopedSubSkills.length,
            assignedSkillAreas: scopedAreas,
            assignedSubSkills: scopedSubSkills,
            studentsAssessed: assessedStudentIds.size,
            totalAssessments: scopedAssessments.filter((a) => a.status === 'approved').length,
            assessmentsPending: scopedAssessments.filter((a) => a.status === 'submitted' || a.status === 'draft').length,
            competitionPerformances: scopedCompetition.length,
            totalRecords: scopedAssessments.length + scopedCompetition.length,
          },
        },
      };
    }

    const approvedCount = assessments.filter((a) => a.status === 'approved').length;
    const pendingCount = assessments.filter((a) => a.status === 'submitted' || a.status === 'draft').length;
    const teachersCount = users.filter((u) => u.role === 'class_teacher' || u.role === 'skill_teacher').length;

    return {
      data: {
        success: true,
        data: {
          role: 'admin',
          students: students.length,
          teachers: teachersCount || 2,
          classes: classes.length,
          skillAreas: skillAreas.length,
          subSkills: subSkills.length,
          totalAssessments: approvedCount,
          assessmentsPending: pendingCount,
          classroomPerformances: classroomPerformances.length,
          competitionPerformances: competitionPerformances.length,
          galleryPending: galleryItems.filter((g) => g.status === 'pending').length,
          upcomingComps: competitions.filter((c) => c.status === 'open' || c.status === 'upcoming').length,
          totalCompResults: competitions.filter((c) => c.status === 'completed').length || 1,
        },
      },
    };
  },

  studentReport: async (studentId) => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const currentUser = getStored(STORAGE_KEYS.CURRENT_USER, null);
    const student = students.find((s) => s._id === studentId);
    if (!student) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { success: false, message: 'Student not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(student.class?._id || student.class)) {
        const err = new Error('Unauthorized to view reports for students of unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    const assessments = getStored(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS)
      .filter((a) => (a.student?._id || a.student) === studentId && a.status === 'approved')
      .map(populateAssessment);

    return {
      data: {
        success: true,
        data: {
          student,
          assessments,
        },
      },
    };
  },

  studentReportPdf: async (studentId) => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const currentUser = getStored(STORAGE_KEYS.CURRENT_USER, null);
    const student = students.find((s) => s._id === studentId);
    if (!student) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { success: false, message: 'Student not found' } };
      throw err;
    }

    if (currentUser?.role === 'class_teacher') {
      const assigned = currentUser.assignedClasses || [];
      if (!assigned.includes(student.class?._id || student.class)) {
        const err = new Error('Unauthorized to download reports for students of unassigned classes');
        err.response = { status: 403, data: { success: false, message: err.message } };
        throw err;
      }
    }

    const reportText = `KSV Skill Sets - Student Skill Report\nGenerated: ${new Date().toLocaleDateString()}\nStudent: ${student.name} (${student.admissionNumber})\nClass: ${student.class?.name || student.class}\n`;
    return { data: new Blob([reportText], { type: 'application/pdf' }) };
  },

  classSummary: async () => ({
    data: {
      success: true,
      data: { classes: [] },
    },
  }),

  competitionReport: async (id) => ({
    data: { success: true, data: { id, results: [] } },
  }),
};

// ── Competitions Service ──────────────────────────────────────────────────────
export const localCompetitions = {
  list: async (params = {}) => {
    initLocalStore();
    let comps = getStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    if (params.status) {
      comps = comps.filter((c) => c.status === params.status);
    }
    return { data: { success: true, data: comps } };
  },
  get: async (id) => {
    initLocalStore();
    const comps = getStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    const c = comps.find((comp) => comp._id === id) || comps[0];
    return { data: { success: true, data: c } };
  },
  create: async (data) => {
    initLocalStore();
    const comps = getStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    const newComp = { _id: `comp_${Date.now()}`, status: 'open', ...data };
    comps.push(newComp);
    setStored(STORAGE_KEYS.COMPETITIONS, comps);
    return { data: { success: true, data: newComp } };
  },
  update: async (id, data) => {
    initLocalStore();
    const comps = getStored(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    const idx = comps.findIndex((c) => c._id === id);
    if (idx !== -1) {
      comps[idx] = { ...comps[idx], ...data };
      setStored(STORAGE_KEYS.COMPETITIONS, comps);
    }
    return { data: { success: true, data: comps[idx] } };
  },
  updateStatus: async (id, status) => {
    return localCompetitions.update(id, { status });
  },
  register: async (id, data) => ({ data: { success: true, message: 'Registered' } }),
  listRegistrations: async () => ({ data: { success: true, data: [] } }),
  enterScores: async () => ({ data: { success: true, message: 'Scores entered' } }),
  calculateResults: async () => ({ data: { success: true, message: 'Calculated' } }),
  getResults: async () => ({ data: { success: true, data: [] } }),
};

// ── Announcements Service ─────────────────────────────────────────────────────
export const localAnnouncements = {
  list: async () => {
    initLocalStore();
    return { data: { success: true, data: getStored(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS) } };
  },
  create: async (data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    const newAnn = { _id: `ann_${Date.now()}`, createdAt: new Date().toISOString(), ...data };
    list.unshift(newAnn);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return { data: { success: true, data: newAnn } };
  },
  update: async (id, data) => {
    initLocalStore();
    const list = getStored(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    const idx = list.findIndex((a) => a._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
    }
    return { data: { success: true, data: list[idx] } };
  },
};

// ── Parents Service ───────────────────────────────────────────────────────────
export const localParents = {
  myChildren: async () => {
    initLocalStore();
    const students = getStored(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const classes = getStored(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const populated = students.map((s) => ({
      ...s,
      class: classes.find((c) => c._id === s.class) || { name: 'Class 5' },
    }));
    return { data: { success: true, data: populated } };
  },
  linkChild: async (data) => ({ data: { success: true, message: 'Child linked' } }),
  adminLink: async (data) => ({ data: { success: true, message: 'Child linked by admin' } }),
};

// ── Users Service ─────────────────────────────────────────────────────────────
export const localUsers = {
  list: async () => {
    initLocalStore();
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS).map(({ password, ...u }) => u);
    return { data: { success: true, data: users } };
  },
  get: async (id) => {
    initLocalStore();
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const u = users.find((user) => user._id === id) || users[0];
    const { password, ...safe } = u;
    return { data: { success: true, data: safe } };
  },
  create: async (data) => {
    initLocalStore();
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const newUser = { _id: `user_${Date.now()}`, isActive: true, ...data };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    const { password, ...safe } = newUser;
    return { data: { success: true, data: safe } };
  },
  update: async (id, data) => {
    initLocalStore();
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const idx = users.findIndex((u) => u._id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      setStored(STORAGE_KEYS.USERS, users);
      const current = getStored(STORAGE_KEYS.CURRENT_USER, null);
      if (current && (current._id === id || current.email?.toLowerCase() === users[idx].email?.toLowerCase())) {
        const { password, ...safeCurrent } = users[idx];
        setStored(STORAGE_KEYS.CURRENT_USER, safeCurrent);
      }
    }
    const { password, ...safe } = users[idx] || {};
    return { data: { success: true, data: safe } };
  },
  resetPassword: async () => ({ data: { success: true, message: 'Password reset' } }),
  changePassword: async () => ({ data: { success: true, message: 'Password changed' } }),
};

// ── Notifications & Settings Service ──────────────────────────────────────────
export const localNotifications = {
  list: async () => ({ data: { success: true, data: [] } }),
  markRead: async () => ({ data: { success: true } }),
};

export const localSettings = {
  get: async () => ({ data: { success: true, data: { assessment_approval_required: true } } }),
  set: async (data) => ({ data: { success: true, data } }),
};
