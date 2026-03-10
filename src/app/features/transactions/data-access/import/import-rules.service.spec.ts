import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImportRulesService } from './import-rules.service';

describe('ImportRulesService', () => {
  let service: ImportRulesService;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [ImportRulesService],
    });
    service = TestBed.inject(ImportRulesService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addRule adds and persists rule', () => {
    const mapping = { date: 'Date', amount: 'Amount', payee: 'To' };
    const rule = service.addRule('Chase', mapping);
    expect(rule.id).toBeDefined();
    expect(rule.name).toBe('Chase');
    expect(rule.mapping).toEqual(mapping);
    expect(service.rules().length).toBe(1);
  });

  it('deleteRule removes rule', () => {
    const rule = service.addRule('Chase', { date: 'Date', amount: 'Amount', payee: 'To' });
    service.deleteRule(rule.id);
    expect(service.rules().length).toBe(0);
  });

  it('getRuleByName finds rule case-insensitively', () => {
    service.addRule('Chase', { date: 'Date', amount: 'Amount', payee: 'To' });
    expect(service.getRuleByName('chase')).toBeDefined();
    expect(service.getRuleByName('CHASE')).toBeDefined();
  });
});
