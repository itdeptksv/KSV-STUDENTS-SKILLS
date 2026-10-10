import { describe, it, expect, vi } from 'vitest';

// Mock modules that use browser APIs
vi.mock('../services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

describe('Auth service mock', () => {
  it('login mock is a function', async () => {
    const { login } = await import('../services/auth');
    expect(typeof login).toBe('function');
  });

  it('logout mock is a function', async () => {
    const { logout } = await import('../services/auth');
    expect(typeof logout).toBe('function');
  });

  it('getMe mock is a function', async () => {
    const { getMe } = await import('../services/auth');
    expect(typeof getMe).toBe('function');
  });

  it('login can be called with credentials', async () => {
    const { login } = await import('../services/auth');
    login.mockResolvedValueOnce({ data: { data: { accessToken: 'tok', user: { role: 'admin' } } } });
    const result = await login('admin@test.com', 'pass');
    expect(login).toHaveBeenCalledWith('admin@test.com', 'pass');
    expect(result.data.data.accessToken).toBe('tok');
  });
});
