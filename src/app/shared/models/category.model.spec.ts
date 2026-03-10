import { describe, it, expect } from 'vitest';
import type { Category } from './category.model';

describe('Category model', () => {
  it('has required id and name', () => {
    const cat: Category = { id: 'cat-1', name: 'Food' };
    expect(cat.id).toBe('cat-1');
    expect(cat.name).toBe('Food');
  });

  it('supports optional parentId', () => {
    const cat: Category = { id: 'cat-2', name: 'Sub', parentId: 'cat-1' };
    expect(cat.parentId).toBe('cat-1');
  });
});
