import { describe, it, expect } from 'vitest';
import { computeImportHash } from './import-hash.util';

describe('computeImportHash', () => {
  it('returns base64-encoded string', () => {
    const hash = computeImportHash('2026-01-15', -65000, 'Test Payee');
    expect(typeof hash).toBe('string');
    expect(hash).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('returns same hash for same inputs', () => {
    const hash1 = computeImportHash('2026-01-15', -65000, 'Test Payee');
    const hash2 = computeImportHash('2026-01-15', -65000, 'Test Payee');
    expect(hash1).toBe(hash2);
  });

  it('returns different hash for different date', () => {
    const hash1 = computeImportHash('2026-01-15', -65000, 'Test Payee');
    const hash2 = computeImportHash('2026-01-16', -65000, 'Test Payee');
    expect(hash1).not.toBe(hash2);
  });

  it('returns different hash for different amount', () => {
    const hash1 = computeImportHash('2026-01-15', -65000, 'Test Payee');
    const hash2 = computeImportHash('2026-01-15', -65001, 'Test Payee');
    expect(hash1).not.toBe(hash2);
  });

  it('returns different hash for different payee', () => {
    const hash1 = computeImportHash('2026-01-15', -65000, 'Payee A');
    const hash2 = computeImportHash('2026-01-15', -65000, 'Payee B');
    expect(hash1).not.toBe(hash2);
  });

  it('normalizes payee by trimming and lowercasing', () => {
    const hash1 = computeImportHash('2026-01-15', -65000, '  Test Payee  ');
    const hash2 = computeImportHash('2026-01-15', -65000, 'test payee');
    expect(hash1).toBe(hash2);
  });
});
