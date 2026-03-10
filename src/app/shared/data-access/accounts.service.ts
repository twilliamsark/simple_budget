import { Injectable, inject, signal } from '@angular/core';
import type { Account } from '../models/account.model';
import { TransactionsService } from '../../features/transactions/data-access/transactions.service';

const STORAGE_KEY = 'simple_budget_accounts';

const SEED_ACCOUNTS: Account[] = [
  { id: 'acc-checking', name: 'Checking', isInternal: true },
  { id: 'acc-savings', name: 'Savings', isInternal: true },
  { id: 'acc-credit', name: 'Credit Card', isInternal: true },
  { id: 'acc-cash', name: 'Cash', isInternal: true },
  { id: 'acc-brokerage', name: 'Brokerage', isInternal: true },
  { id: 'acc-retirement', name: 'Retirement', isInternal: true },
];

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly transactions = inject(TransactionsService);

  readonly accounts = signal<Account[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.accounts.set(Array.isArray(parsed) ? parsed : SEED_ACCOUNTS);
      } else {
        this.accounts.set([...SEED_ACCOUNTS]);
        this.save();
      }
    } catch {
      this.accounts.set([...SEED_ACCOUNTS]);
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts()));
  }

  getById(id: string): Account | undefined {
    return this.accounts().find((a) => a.id === id);
  }

  hasTransactions(_accountId: string): boolean {
    return false;
  }

  findByName(name: string): Account | undefined {
    const n = name.trim().toLowerCase();
    return this.accounts().find((a) => a.name.toLowerCase() === n);
  }

  add(name: string): Account {
    const existing = this.findByName(name);
    if (existing) return existing;

    const account: Account = {
      id: `acc-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      isInternal: true,
    };
    this.accounts.update((a) => [...a, account]);
    this.save();
    return account;
  }

  create(payload: { name: string; isInternal?: boolean; note?: string }): Account {
    const account = this.add(payload.name);
    const updates: Partial<Account> = {};
    if (payload.isInternal !== undefined && account.isInternal !== payload.isInternal) {
      updates.isInternal = payload.isInternal;
    }
    if (payload.note !== undefined) {
      updates.note = payload.note.trim() || undefined;
    }
    if (Object.keys(updates).length > 0) {
      this.update(account.id, { name: account.name, ...updates });
    }
    return this.getById(account.id)!;
  }

  update(id: string, payload: { name: string; isInternal?: boolean; note?: string }): void {
    const trimmed = payload.name.trim();
    const existing = this.findByName(trimmed);
    if (existing && existing.id !== id) return;

    this.accounts.update((a) =>
      a.map((x) =>
        x.id === id
          ? {
              ...x,
              name: trimmed,
              isInternal: payload.isInternal ?? x.isInternal,
              note: payload.note !== undefined ? (payload.note.trim() || undefined) : x.note,
            }
          : x,
      ),
    );
    this.save();
  }

  delete(id: string): boolean {
    if (this.hasTransactions(id)) return false;
    this.accounts.update((a) => a.filter((x) => x.id !== id));
    this.save();
    return true;
  }
}
