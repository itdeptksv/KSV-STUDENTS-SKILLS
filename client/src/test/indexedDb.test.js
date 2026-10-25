import { describe, it, expect } from 'vitest';
import { fileToDataUrl, storeFile } from '../services/indexedDb';

describe('IndexedDB and File Storage service', () => {
  it('fileToDataUrl converts text string and handles null/empty gracefully', async () => {
    const emptyRes = await fileToDataUrl(null);
    expect(emptyRes).toBe('');

    const stringRes = await fileToDataUrl('data:image/png;base64,abc');
    expect(stringRes).toBe('data:image/png;base64,abc');
  });

  it('storeFile creates a structured file record with metadata and photo description', async () => {
    const mockFile = {
      name: 'showcase_photo.jpg',
      type: 'image/jpeg',
      size: 45000,
    };
    const description = 'Photo of student performing classical dance';

    const record = await storeFile(mockFile, description);
    expect(record.id).toMatch(/^file_/);
    expect(record.name).toBe('showcase_photo.jpg');
    expect(record.type).toBe('image/jpeg');
    expect(record.size).toBe(45000);
    expect(record.description).toBe(description);
    expect(record.createdAt).toBeDefined();
  });
});
