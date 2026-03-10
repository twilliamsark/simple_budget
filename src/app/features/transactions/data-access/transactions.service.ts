import { Injectable, signal, computed } from '@angular/core';
import type { Transaction, TransactionCreate } from '../../../shared/models/transaction.model';

const STORAGE_KEY = 'simple_budget_transactions';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  readonly transactions = signal<Transaction[]>([]);

  /** Sum of all transaction amounts in cents (positive = net income, negative = net expense). */
  readonly totalAmount = computed(() =>
    this.transactions().reduce((sum, t) => sum + t.amount, 0)
  );

  constructor() {
    this.load();
  }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      this.transactions.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.transactions.set([]);
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions()));
  }

  create(payload: TransactionCreate): Transaction {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.update((t) => [...t, transaction]);
    this.save();
    return transaction;
  }

  update(id: string, payload: Partial<TransactionCreate>): void {
    const now = new Date().toISOString();
    this.transactions.update((t) =>
      t.map((x) =>
        x.id === id ? { ...x, ...payload, updatedAt: now } : x
      )
    );
    this.save();
  }

  delete(id: string): void {
    this.transactions.update((t) => t.filter((x) => x.id !== id));
    this.save();
  }

  getById(id: string): Transaction | undefined {
    return this.transactions().find((t) => t.id === id);
  }

  getByImportHash(hash: string): Transaction | undefined {
    return this.transactions().find((t) => t.importHash === hash);
  }
}
