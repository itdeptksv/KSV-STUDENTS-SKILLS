import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const getMe = () => api.get('/auth/me');
export const setupAdmin = (data) => api.post('/auth/setup-admin', data);
