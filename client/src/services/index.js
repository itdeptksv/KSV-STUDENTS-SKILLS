import api from './api';
import {
  isLocalMode,
  localSkills,
  localAssessments,
  localClassroomPerformances,
  localCompetitionPerformances,
  localClasses,
  localStudents,
  localAcademic,
  localGallery,
  localReports,
  localCompetitions,
  localAnnouncements,
  localParents,
  localUsers,
  localNotifications,
  localSettings,
} from './localStore';

// Users
export const users = {
  list: (params) => (isLocalMode() ? localUsers.list(params) : api.get('/users', { params })),
  get: (id) => (isLocalMode() ? localUsers.get(id) : api.get(`/users/${id}`)),
  create: (data) => (isLocalMode() ? localUsers.create(data) : api.post('/users', data)),
  update: (id, data) => (isLocalMode() ? localUsers.update(id, data) : api.put(`/users/${id}`, data)),
  resetPassword: (id, data) => (isLocalMode() ? localUsers.resetPassword(id, data) : api.post(`/users/${id}/reset-password`, data)),
  changePassword: (data) => (isLocalMode() ? localUsers.changePassword(data) : api.post('/users/me/change-password', data)),
};

// Academic
export const academic = {
  listYears: () => (isLocalMode() ? localAcademic.listYears() : api.get('/academic/years')),
  createYear: (data) => (isLocalMode() ? localAcademic.createYear(data) : api.post('/academic/years', data)),
  updateYear: (id, data) => (isLocalMode() ? localAcademic.updateYear(id, data) : api.put(`/academic/years/${id}`, data)),
  setCurrentYear: (id) => (isLocalMode() ? localAcademic.setCurrentYear(id) : api.post(`/academic/years/${id}/set-current`)),
  listTerms: (params) => (isLocalMode() ? localAcademic.listTerms(params) : api.get('/academic/terms', { params })),
  createTerm: (data) => (isLocalMode() ? localAcademic.createTerm(data) : api.post('/academic/terms', data)),
  updateTerm: (id, data) => (isLocalMode() ? localAcademic.updateTerm(id, data) : api.put(`/academic/terms/${id}`, data)),
  lockTerm: (id) => (isLocalMode() ? localAcademic.lockTerm(id) : api.post(`/academic/terms/${id}/lock`)),
  unlockTerm: (id) => (isLocalMode() ? localAcademic.unlockTerm(id) : api.post(`/academic/terms/${id}/unlock`)),
};

// Classes
export const classes = {
  list: () => (isLocalMode() ? localClasses.list() : api.get('/classes')),
  get: (id) => (isLocalMode() ? localClasses.get(id) : api.get(`/classes/${id}`)),
  create: (data) => (isLocalMode() ? localClasses.create(data) : api.post('/classes', data)),
  update: (id, data) => (isLocalMode() ? localClasses.update(id, data) : api.put(`/classes/${id}`, data)),
  addSection: (id, data) => (isLocalMode() ? localClasses.addSection(id, data) : api.post(`/classes/${id}/sections`, data)),
  updateSection: (id, sectionId, data) => (isLocalMode() ? localClasses.updateSection(id, sectionId, data) : api.put(`/classes/${id}/sections/${sectionId}`, data)),
};

// Students
export const students = {
  list: (params) => (isLocalMode() ? localStudents.list(params) : api.get('/students', { params })),
  get: (id) => (isLocalMode() ? localStudents.get(id) : api.get(`/students/${id}`)),
  create: (data) => (isLocalMode() ? localStudents.create(data) : api.post('/students', data)),
  update: (id, data) => (isLocalMode() ? localStudents.update(id, data) : api.put(`/students/${id}`, data)),
  downloadTemplate: () => (isLocalMode() ? localStudents.downloadTemplate() : api.get('/students/template', { responseType: 'blob' })),
  importPreview: (formData) => (isLocalMode() ? localStudents.importPreview(formData) : api.post('/students/import/preview', formData)),
  importSave: (formData) => (isLocalMode() ? localStudents.importSave(formData) : api.post('/students/import/save', formData)),
};

// Skills Areas (Requirement 5 & 8)
export const skills = {
  listAreas: (params) => (isLocalMode() ? localSkills.listAreas(params) : api.get('/skills/areas', { params })),
  createArea: (data) => (isLocalMode() ? localSkills.createArea(data) : api.post('/skills/areas', data)),
  updateArea: (id, data) => (isLocalMode() ? localSkills.updateArea(id, data) : api.put(`/skills/areas/${id}`, data)),
  listSubSkills: (params) => (isLocalMode() ? localSkills.listSubSkills(params) : api.get('/skills/sub-skills', { params })),
  createSubSkill: (data) => (isLocalMode() ? localSkills.createSubSkill(data) : api.post('/skills/sub-skills', data)),
  updateSubSkill: (id, data) => (isLocalMode() ? localSkills.updateSubSkill(id, data) : api.put(`/skills/sub-skills/${id}`, data)),
};

// Assessments (Skills Areas Performance Records)
export const assessments = {
  list: (params) => (isLocalMode() ? localAssessments.list(params) : api.get('/assessments', { params })),
  get: (id) => (isLocalMode() ? localAssessments.get(id) : api.get(`/assessments/${id}`)),
  create: (data) => (isLocalMode() ? localAssessments.create(data) : api.post('/assessments', data)),
  update: (id, data) => (isLocalMode() ? localAssessments.update(id, data) : api.put(`/assessments/${id}`, data)),
  submit: (id) => (isLocalMode() ? localAssessments.submit(id) : api.post(`/assessments/${id}/submit`)),
  approve: (id, data) => (isLocalMode() ? localAssessments.approve(id, data) : api.post(`/assessments/${id}/approve`, data)),
  reject: (id, data) => (isLocalMode() ? localAssessments.reject(id, data) : api.post(`/assessments/${id}/reject`, data)),
  bulk: (data) => (isLocalMode() ? localAssessments.bulk(data) : api.post('/assessments/bulk', data)),
  notAssessed: (params) => (isLocalMode() ? localAssessments.notAssessed(params) : api.get('/assessments/not-assessed', { params })),
};

// Classroom Performances (Module 4 & Module 9)
export const classroomPerformances = {
  list: (params) => (isLocalMode() ? localClassroomPerformances.list(params) : api.get('/classroom-performances', { params })),
  get: (id) => (isLocalMode() ? localClassroomPerformances.get(id) : api.get(`/classroom-performances/${id}`)),
  create: (data) => (isLocalMode() ? localClassroomPerformances.create(data) : api.post('/classroom-performances', data)),
  update: (id, data) => (isLocalMode() ? localClassroomPerformances.update(id, data) : api.put(`/classroom-performances/${id}`, data)),
  delete: (id) => (isLocalMode() ? localClassroomPerformances.delete(id) : api.delete(`/classroom-performances/${id}`)),
};

// Competition Performances (Module 5 & Module 9)
export const competitionPerformances = {
  list: (params) => (isLocalMode() ? localCompetitionPerformances.list(params) : api.get('/competition-performances', { params })),
  get: (id) => (isLocalMode() ? localCompetitionPerformances.get(id) : api.get(`/competition-performances/${id}`)),
  create: (data) => (isLocalMode() ? localCompetitionPerformances.create(data) : api.post('/competition-performances', data)),
  update: (id, data) => (isLocalMode() ? localCompetitionPerformances.update(id, data) : api.put(`/competition-performances/${id}`, data)),
  delete: (id) => (isLocalMode() ? localCompetitionPerformances.delete(id) : api.delete(`/competition-performances/${id}`)),
};

// Competitions
export const competitions = {
  list: (params) => (isLocalMode() ? localCompetitions.list(params) : api.get('/competitions', { params })),
  get: (id) => (isLocalMode() ? localCompetitions.get(id) : api.get(`/competitions/${id}`)),
  create: (data) => (isLocalMode() ? localCompetitions.create(data) : api.post('/competitions', data)),
  update: (id, data) => (isLocalMode() ? localCompetitions.update(id, data) : api.put(`/competitions/${id}`, data)),
  updateStatus: (id, status) => (isLocalMode() ? localCompetitions.updateStatus(id, status) : api.post(`/competitions/${id}/status`, { status })),
  register: (id, data) => (isLocalMode() ? localCompetitions.register(id, data) : api.post(`/competitions/${id}/register`, data)),
  listRegistrations: (id) => (isLocalMode() ? localCompetitions.listRegistrations(id) : api.get(`/competitions/${id}/registrations`)),
  enterScores: (id, data) => (isLocalMode() ? localCompetitions.enterScores(id, data) : api.post(`/competitions/${id}/scores`, data)),
  calculateResults: (id) => (isLocalMode() ? localCompetitions.calculateResults(id) : api.post(`/competitions/${id}/calculate-results`)),
  getResults: (id) => (isLocalMode() ? localCompetitions.getResults(id) : api.get(`/competitions/${id}/results`)),
};

// Gallery
export const gallery = {
  listAlbums: (params) => (isLocalMode() ? localGallery.listAlbums(params) : api.get('/gallery/albums', { params })),
  createAlbum: (data) => (isLocalMode() ? localGallery.createAlbum(data) : api.post('/gallery/albums', data)),
  updateAlbum: (id, data) => (isLocalMode() ? localGallery.updateAlbum(id, data) : api.put(`/gallery/albums/${id}`, data)),
  listItems: (albumId, params) => (isLocalMode() ? localGallery.listItems(albumId, params) : api.get(`/gallery/albums/${albumId}/items`, { params })),
  submitItem: (albumId, formData) => (isLocalMode() ? localGallery.submitItem(albumId, formData) : api.post(`/gallery/albums/${albumId}/items`, formData)),
  pendingItems: () => (isLocalMode() ? localGallery.pendingItems() : api.get('/gallery/pending')),
  approveItem: (id) => (isLocalMode() ? localGallery.approveItem(id) : api.post(`/gallery/items/${id}/approve`)),
  rejectItem: (id, data) => (isLocalMode() ? localGallery.rejectItem(id, data) : api.post(`/gallery/items/${id}/reject`, data)),
};

// Reports
export const reports = {
  dashboard: () => (isLocalMode() ? localReports.dashboard() : api.get('/reports/dashboard')),
  studentReport: (studentId, params) => (isLocalMode() ? localReports.studentReport(studentId, params) : api.get(`/reports/student/${studentId}`, { params })),
  studentReportPdf: (studentId, params) => (isLocalMode() ? localReports.studentReportPdf(studentId, params) : api.get(`/reports/student/${studentId}`, { params: { ...params, format: 'pdf' }, responseType: 'blob' })),
  classSummary: (params) => (isLocalMode() ? localReports.classSummary(params) : api.get('/reports/class-summary', { params })),
  competitionReport: (id) => (isLocalMode() ? localReports.competitionReport(id) : api.get(`/reports/competition/${id}`)),
};

// Misc
export const announcements = {
  list: () => (isLocalMode() ? localAnnouncements.list() : api.get('/announcements')),
  create: (data) => (isLocalMode() ? localAnnouncements.create(data) : api.post('/announcements', data)),
  update: (id, data) => (isLocalMode() ? localAnnouncements.update(id, data) : api.put(`/announcements/${id}`, data)),
};

export const notifications = {
  list: (params) => (isLocalMode() ? localNotifications.list(params) : api.get('/notifications', { params })),
  markRead: () => (isLocalMode() ? localNotifications.markRead() : api.post('/notifications/mark-read')),
};

export const parents = {
  myChildren: () => (isLocalMode() ? localParents.myChildren() : api.get('/parents/children')),
  linkChild: (data) => (isLocalMode() ? localParents.linkChild(data) : api.post('/parents/link', data)),
  adminLink: (data) => (isLocalMode() ? localParents.adminLink(data) : api.post('/parents/admin-link', data)),
};

export const settings = {
  get: () => (isLocalMode() ? localSettings.get() : api.get('/settings')),
  set: (data) => (isLocalMode() ? localSettings.set(data) : api.post('/settings', data)),
};
