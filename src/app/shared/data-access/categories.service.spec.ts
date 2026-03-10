import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [CategoriesService],
    });
    service = TestBed.inject(CategoriesService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads seed categories when storage is empty', () => {
    expect(service.categories().length).toBeGreaterThan(0);
    expect(service.findByName('Food')).toBeDefined();
  });

  it('findByName returns category case-insensitively', () => {
    expect(service.findByName('food')).toBeDefined();
    expect(service.findByName('FOOD')).toBeDefined();
  });

  it('add creates new category', () => {
    const before = service.categories().length;
    const added = service.add('NewCategory');
    expect(added.name).toBe('NewCategory');
    expect(added.id).toBeDefined();
    expect(service.categories().length).toBe(before + 1);
  });

  it('add returns existing when name matches', () => {
    const first = service.add('Duplicate');
    const second = service.add('duplicate');
    expect(first.id).toBe(second.id);
  });
});
