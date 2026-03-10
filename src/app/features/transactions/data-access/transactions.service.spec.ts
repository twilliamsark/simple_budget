import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TransactionsService } from './transactions.service';
import type { TransactionCreate } from '../../../shared/models/transaction.model';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => storage[key] ?? null,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [TransactionsService],
    });
    service = TestBed.inject(TransactionsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('create adds transaction', () => {
    const payload: TransactionCreate = {
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
    };
    const created = service.create(payload);
    expect(created.id).toBeDefined();
    expect(created.date).toBe('2026-01-15');
    expect(created.amount).toBe(-65000);
    expect(created.createdAt).toBeDefined();
    expect(service.transactions().length).toBe(1);
  });

  it('update modifies transaction', () => {
    const created = service.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Old',
      cleared: true,
      tags: [],
    });
    service.update(created.id, { payee: 'New' });
    expect(service.transactions()[0].payee).toBe('New');
  });

  it('delete removes transaction', () => {
    const created = service.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
    });
    service.delete(created.id);
    expect(service.transactions().length).toBe(0);
  });

  it('getByImportHash finds transaction', () => {
    const created = service.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
      importHash: 'hash123',
    });
    expect(service.getByImportHash('hash123')).toEqual(created);
  });

  it('getById finds transaction by id', () => {
    const created = service.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
    });
    expect(service.getById(created.id)).toEqual(created);
    expect(service.getById('nonexistent')).toBeUndefined();
  });
});
