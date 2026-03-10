import { describe, it, expect } from 'vitest';
import type { Transaction, TransactionCreate, TransactionImportRow } from './transaction.model';

describe('Transaction model', () => {
  const validTransaction: Transaction = {
    id: 'tx-1',
    date: '2026-01-15',
    amount: -65000,
    categoryId: 'cat-1',
    payee: 'Test Merchant',
    cleared: true,
    tags: [],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  };

  it('Transaction has required fields', () => {
    expect(validTransaction.id).toBeDefined();
    expect(validTransaction.date).toBeDefined();
    expect(validTransaction.amount).toBeDefined();
    expect(validTransaction.categoryId).toBeDefined();
    expect(validTransaction.payee).toBeDefined();
    expect(validTransaction.cleared).toBeDefined();
    expect(validTransaction.tags).toBeDefined();
    expect(validTransaction.createdAt).toBeDefined();
    expect(validTransaction.updatedAt).toBeDefined();
  });

  it('TransactionCreate omits id and timestamps', () => {
    const create: TransactionCreate = {
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
    };
    expect(create).not.toHaveProperty('id');
    expect(create).not.toHaveProperty('createdAt');
    expect(create).not.toHaveProperty('updatedAt');
  });

  it('TransactionImportRow has importHash', () => {
    const row: TransactionImportRow = {
      date: '2026-01-15',
      amount: -65000,
      payee: 'Test',
      importHash: 'abc123',
    };
    expect(row.importHash).toBe('abc123');
  });
});
