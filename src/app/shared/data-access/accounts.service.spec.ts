import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccountsService } from './accounts.service';
import { TransactionsService } from '../../features/transactions/data-access/transactions.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let transactionsService: TransactionsService;
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
      providers: [AccountsService, TransactionsService],
    });
    service = TestBed.inject(AccountsService);
    transactionsService = TestBed.inject(TransactionsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads seed accounts when storage is empty', () => {
    expect(service.accounts().length).toBeGreaterThan(0);
    expect(service.findByName('Checking')).toBeDefined();
  });

  it('add creates new account', () => {
    const added = service.add('CC-5792');
    expect(added.name).toBe('CC-5792');
    expect(added.id).toBeDefined();
    expect(added.isInternal).toBe(true);
  });

  it('add returns existing when name matches', () => {
    const first = service.add('Duplicate');
    const second = service.add('duplicate');
    expect(first.id).toBe(second.id);
  });

  it('getById finds account', () => {
    const added = service.add('Test');
    expect(service.getById(added.id)).toEqual(added);
    expect(service.getById('nonexistent')).toBeUndefined();
  });

  it('hasTransactions returns false (transactions no longer linked to accounts)', () => {
    const added = service.add('Test');
    expect(service.hasTransactions(added.id)).toBe(false);
  });

  it('update modifies account name', () => {
    const added = service.add('Old');
    service.update(added.id, { name: 'New' });
    expect(service.getById(added.id)?.name).toBe('New');
  });

  it('delete removes account when no transactions', () => {
    const added = service.add('ToDelete');
    const result = service.delete(added.id);
    expect(result).toBe(true);
    expect(service.getById(added.id)).toBeUndefined();
  });

  it('delete removes account', () => {
    const added = service.add('ToDelete2');
    const result = service.delete(added.id);
    expect(result).toBe(true);
    expect(service.getById(added.id)).toBeUndefined();
  });
});
