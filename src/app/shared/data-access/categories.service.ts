import { Injectable, signal } from '@angular/core';
import type { Category } from '../models/category.model';

const STORAGE_KEY = 'simple_budget_categories';

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-uncategorized', name: 'Uncategorized' },
  { id: 'cat-food', name: 'Food' },
  { id: 'cat-medical', name: 'Medical' },
  { id: 'cat-car', name: 'Car' },
  { id: 'cat-software', name: 'Software' },
  { id: 'cat-retail', name: 'Retail' },
  { id: 'cat-entertainment', name: 'Entertainment' },
  { id: 'cat-gas', name: 'Gas' },
  { id: 'cat-alcohol', name: 'Alcohol' },
  { id: 'cat-education', name: 'Education' },
  { id: 'cat-phone', name: 'Phone' },
  { id: 'cat-internet', name: 'Internet' },
  { id: 'cat-membership', name: 'Membership' },
  { id: 'cat-hotel', name: 'Hotel' },
  { id: 'cat-storage', name: 'Storage' },
  { id: 'cat-dividends', name: 'Dividends' },
  { id: 'cat-tithe', name: 'Tithe' },
  { id: 'cat-health', name: 'Health' },
  { id: 'cat-rent', name: 'Rent' },
  { id: 'cat-payroll', name: 'Payroll' },
];

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  readonly categories = signal<Category[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: Category[];
      if (raw) {
        const parsed = JSON.parse(raw);
        list = Array.isArray(parsed) ? parsed : [...SEED_CATEGORIES];
      } else {
        list = [...SEED_CATEGORIES];
      }
      // Ensure seed categories exist (e.g. Payroll) for existing users
      const names = new Set(list.map((c) => c.name.toLowerCase()));
      const beforeCount = list.length;
      for (const seed of SEED_CATEGORIES) {
        if (!names.has(seed.name.toLowerCase())) {
          list.push(seed);
          names.add(seed.name.toLowerCase());
        }
      }
      this.categories.set(list);
      if (list.length > beforeCount) this.save();
    } catch {
      this.categories.set([...SEED_CATEGORIES]);
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.categories()));
  }

  findByName(name: string): Category | undefined {
    return this.categories().find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
  }

  add(name: string): Category {
    const existing = this.findByName(name);
    if (existing) return existing;

    const category: Category = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
    };
    this.categories.update((c) => [...c, category]);
    this.save();
    return category;
  }
}
