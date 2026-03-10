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

  it('renders Import CSV link', () => {
    const fixture = TestBed.createComponent(TransactionListComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/transactions/import"]');
    expect(link).toBeTruthy();
  });

  it('renders Add Transaction link', () => {
    const fixture = TestBed.createComponent(TransactionListComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/transactions/new"]');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toBe('Add Transaction');
  });

  it('renders Edit link for each transaction', () => {
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
    const editLinks = fixture.nativeElement.querySelectorAll('a[aria-label="Edit"]');
    expect(editLinks.length).toBe(1);
  });
});
