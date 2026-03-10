import { Injectable, signal } from '@angular/core';
import type { ImportRule, ImportColumnMapping } from './import.types';

const STORAGE_KEY = 'simple_budget_import_rules';

@Injectable({ providedIn: 'root' })
export class ImportRulesService {
  readonly rules = signal<ImportRule[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      this.rules.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.rules.set([]);
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rules()));
  }

  addRule(name: string, mapping: ImportColumnMapping): ImportRule {
    const rule: ImportRule = {
      id: crypto.randomUUID(),
      name,
      mapping,
      createdAt: new Date().toISOString(),
    };
    this.rules.update((r) => [...r, rule]);
    this.save();
    return rule;
  }

  deleteRule(id: string): void {
    this.rules.update((r) => r.filter((x) => x.id !== id));
    this.save();
  }

  getRuleByName(name: string): ImportRule | undefined {
    return this.rules().find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
  }
}
