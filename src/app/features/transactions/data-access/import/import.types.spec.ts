import { describe, it, expect } from 'vitest';
import type { ImportColumnMapping, ImportRule } from './import.types';

describe('Import types', () => {
  it('ImportColumnMapping has required fields', () => {
    const mapping: ImportColumnMapping = {
      date: 'Date',
      amount: 'Amount',
      payee: 'To',
    };
    expect(mapping.date).toBe('Date');
    expect(mapping.amount).toBe('Amount');
    expect(mapping.payee).toBe('To');
  });

  it('ImportRule has id, name, mapping, createdAt', () => {
    const rule: ImportRule = {
      id: 'rule-1',
      name: 'Chase',
      mapping: { date: 'Date', amount: 'Amount', payee: 'Description' },
      createdAt: '2026-01-15T10:00:00Z',
    };
    expect(rule.id).toBeDefined();
    expect(rule.name).toBe('Chase');
    expect(rule.mapping).toBeDefined();
    expect(rule.createdAt).toBeDefined();
  });
});
