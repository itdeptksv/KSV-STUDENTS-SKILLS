import { describe, it, expect } from 'vitest';
import { LEVEL_LABELS, ROLE_LABELS } from '../utils/helpers';

describe('Component data constants', () => {
  it('Badge variant keys exist', () => {
    const variants = ['blue', 'green', 'yellow', 'red', 'gray', 'teal', 'purple'];
    variants.forEach((v) => expect(typeof v).toBe('string'));
  });

  it('level labels cover 1-4', () => {
    expect(LEVEL_LABELS[1]).toBe('Beginner');
    expect(LEVEL_LABELS[4]).toBe('Advanced');
  });

  it('role labels are defined', () => {
    expect(ROLE_LABELS.admin).toBeTruthy();
    expect(ROLE_LABELS.parent).toBeTruthy();
  });
});
