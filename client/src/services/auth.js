import api from './api';
import { isLocalMode, localAuth } from './localStore';

export const login = (email, password) => {
  if (isLocalMode()) {
    return localAuth.login(email, password);
  }
  return api.post('/auth/login', { email, password });
};

export const logout = (refreshToken) => {
  if (isLocalMode()) {
    return localAuth.logout(refreshToken);
  }
  return api.post('/auth/logout', { refreshToken });
};

export const refresh = (refreshToken) => {
  if (isLocalMode()) {
    return localAuth.refresh(refreshToken);
  }
  return api.post('/auth/refresh', { refreshToken });
};

export const getMe = () => {
  if (isLocalMode()) {
    return localAuth.getMe();
  }
  return api.get('/auth/me');
};

export const setupAdmin = (data) => {
  if (isLocalMode()) {
    return localAuth.setupAdmin(data);
  }
  return api.post('/auth/setup-admin', data);
};
