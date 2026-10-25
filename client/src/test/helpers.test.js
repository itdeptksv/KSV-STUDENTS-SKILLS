import { describe, it, expect } from 'vitest';
import { LEVEL_LABELS, LEVEL_COLORS, formatDate, ROLE_LABELS } from '../utils/helpers';

describe('helpers', () => {
  describe('LEVEL_LABELS', () => {
    it('has labels for levels 1-4', () => {
      expect(LEVEL_LABELS[1]).toBe('Beginner');
      expect(LEVEL_LABELS[2]).toBe('Developing');
      expect(LEVEL_LABELS[3]).toBe('Proficient');
      expect(LEVEL_LABELS[4]).toBe('Advanced');
    });
  });

  describe('LEVEL_COLORS', () => {
    it('has color classes for all levels', () => {
      [1, 2, 3, 4].forEach((l) => {
        expect(LEVEL_COLORS[l]).toBeTruthy();
      });
    });
  });

  describe('formatDate', () => {
    it('returns dash for null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('formats a valid date', () => {
      const result = formatDate('2024-06-01');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });
  });

  describe('ROLE_LABELS', () => {
    it('has labels for all 3 supported roles', () => {
      expect(ROLE_LABELS.admin).toBe('Admin / Principal');
      expect(ROLE_LABELS.class_teacher).toBe('Class Teacher');
      expect(ROLE_LABELS.skill_teacher).toBe('Skills Teacher');
    });
  });
});
