import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import TransactionListComponent from './transaction-list.component';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';

describe('TransactionListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [provideRouter([]), TransactionsService, CategoriesService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TransactionListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders Add Transaction link', () => {
    const fixture = TestBed.createComponent(TransactionListComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/transactions/new"]');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toBe('Add Transaction');
  });

  it('renders Edit button for each transaction', () => {
    const transactionsService = TestBed.inject(TransactionsService);
    transactionsService.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Test',
      cleared: true,
      tags: [],
    });
    const fixture = TestBed.createComponent(TransactionListComponent);
    fixture.detectChanges();
    const editButtons = fixture.nativeElement.querySelectorAll('button[aria-label="Edit"]');
    expect(editButtons.length).toBe(1);
  });

  it('copy transaction creates a new transaction with same fields except date (today) and cleared (false)', () => {
    const transactionsService = TestBed.inject(TransactionsService);
    const original = transactionsService.create({
      date: '2026-01-15',
      amount: -65000,
      categoryId: 'cat-1',
      payee: 'Grocery Store',
      payer: 'Checking',
      owner: 'TW',
      cleared: true,
      tags: ['food'],
      memo: 'Weekly shop',
    });
    const countBefore = transactionsService.transactions().length;
    const fixture = TestBed.createComponent(TransactionListComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]') as NodeListOf<HTMLElement>;
    const rowWithPayee = Array.from(rows).find((r) => r.textContent?.includes('Grocery Store'));
    const copyButton = rowWithPayee?.querySelector<HTMLButtonElement>(
      'button[aria-label="Copy transaction"]',
    );
    expect(copyButton).toBeTruthy();
    (copyButton as HTMLElement).click();
    fixture.detectChanges();

    const transactions = transactionsService.transactions();
    expect(transactions.length).toBe(countBefore + 1);
    const copied = transactions.find((t) => t.id !== original.id && t.payee === original.payee);
    expect(copied).toBeTruthy();
    const today = new Date().toISOString().slice(0, 10);
    expect(copied!.amount).toBe(original.amount);
    expect(copied!.categoryId).toBe(original.categoryId);
    expect(copied!.payee).toBe(original.payee);
    expect(copied!.payer).toBe(original.payer);
    expect(copied!.owner).toBe(original.owner);
    expect(copied!.tags).toEqual(original.tags);
    expect(copied!.memo).toBe(original.memo);
    expect(copied!.cleared).toBe(false);
    expect(copied!.date).toBe(today);
    expect(copied!.importHash).toBeUndefined();
    expect(copied!.id).not.toBe(original.id);
  });
});
