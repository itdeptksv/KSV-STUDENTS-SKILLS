import api from './api';

// Users
export const users = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  changePassword: (data) => api.post('/users/me/change-password', data),
};

// Academic
export const academic = {
  listYears: () => api.get('/academic/years'),
  createYear: (data) => api.post('/academic/years', data),
  updateYear: (id, data) => api.put(`/academic/years/${id}`, data),
  setCurrentYear: (id) => api.post(`/academic/years/${id}/set-current`),
  listTerms: (params) => api.get('/academic/terms', { params }),
  createTerm: (data) => api.post('/academic/terms', data),
  updateTerm: (id, data) => api.put(`/academic/terms/${id}`, data),
  lockTerm: (id) => api.post(`/academic/terms/${id}/lock`),
  unlockTerm: (id) => api.post(`/academic/terms/${id}/unlock`),
};

// Classes
export const classes = {
  list: () => api.get('/classes'),
  get: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  addSection: (id, data) => api.post(`/classes/${id}/sections`, data),
  updateSection: (id, sectionId, data) => api.put(`/classes/${id}/sections/${sectionId}`, data),
};

// Students
export const students = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  downloadTemplate: () => api.get('/students/template', { responseType: 'blob' }),
  importPreview: (formData) => api.post('/students/import/preview', formData),
  importSave: (formData) => api.post('/students/import/save', formData),
};

// Skills
export const skills = {
  listAreas: (params) => api.get('/skills/areas', { params }),
  createArea: (data) => api.post('/skills/areas', data),
  updateArea: (id, data) => api.put(`/skills/areas/${id}`, data),
  listSubSkills: (params) => api.get('/skills/sub-skills', { params }),
  createSubSkill: (data) => api.post('/skills/sub-skills', data),
  updateSubSkill: (id, data) => api.put(`/skills/sub-skills/${id}`, data),
};

// Assessments
export const assessments = {
  list: (params) => api.get('/assessments', { params }),
  get: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  submit: (id) => api.post(`/assessments/${id}/submit`),
  approve: (id, data) => api.post(`/assessments/${id}/approve`, data),
  reject: (id, data) => api.post(`/assessments/${id}/reject`, data),
  bulk: (data) => api.post('/assessments/bulk', data),
  notAssessed: (params) => api.get('/assessments/not-assessed', { params }),
};

// Competitions
export const competitions = {
  list: (params) => api.get('/competitions', { params }),
  get: (id) => api.get(`/competitions/${id}`),
  create: (data) => api.post('/competitions', data),
  update: (id, data) => api.put(`/competitions/${id}`, data),
  updateStatus: (id, status) => api.post(`/competitions/${id}/status`, { status }),
  register: (id, data) => api.post(`/competitions/${id}/register`, data),
  listRegistrations: (id) => api.get(`/competitions/${id}/registrations`),
  enterScores: (id, data) => api.post(`/competitions/${id}/scores`, data),
  calculateResults: (id) => api.post(`/competitions/${id}/calculate-results`),
  getResults: (id) => api.get(`/competitions/${id}/results`),
};

// Gallery
export const gallery = {
  listAlbums: (params) => api.get('/gallery/albums', { params }),
  createAlbum: (data) => api.post('/gallery/albums', data),
  updateAlbum: (id, data) => api.put(`/gallery/albums/${id}`, data),
  listItems: (albumId, params) => api.get(`/gallery/albums/${albumId}/items`, { params }),
  submitItem: (albumId, formData) => api.post(`/gallery/albums/${albumId}/items`, formData),
  pendingItems: () => api.get('/gallery/pending'),
  approveItem: (id) => api.post(`/gallery/items/${id}/approve`),
  rejectItem: (id, data) => api.post(`/gallery/items/${id}/reject`, data),
};

// Reports
export const reports = {
  dashboard: () => api.get('/reports/dashboard'),
  studentReport: (studentId, params) => api.get(`/reports/student/${studentId}`, { params }),
  studentReportPdf: (studentId, params) => api.get(`/reports/student/${studentId}`, { params: { ...params, format: 'pdf' }, responseType: 'blob' }),
  classSummary: (params) => api.get('/reports/class-summary', { params }),
  competitionReport: (id) => api.get(`/reports/competition/${id}`),
};

// Misc
export const announcements = {
  list: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
};

export const notifications = {
  list: (params) => api.get('/notifications', { params }),
  markRead: () => api.post('/notifications/mark-read'),
};

export const parents = {
  myChildren: () => api.get('/parents/children'),
  linkChild: (data) => api.post('/parents/link', data),
  adminLink: (data) => api.post('/parents/admin-link', data),
};

export const settings = {
  get: () => api.get('/settings'),
  set: (data) => api.post('/settings', data),
};
