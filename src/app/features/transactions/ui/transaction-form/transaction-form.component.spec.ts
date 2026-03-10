import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import TransactionFormComponent from './transaction-form.component';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';

describe('TransactionFormComponent', () => {
  let transactionsService: TransactionsService;
  let storage: Record<string, string>;

  beforeEach(async () => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => storage[key] ?? null,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });

    await TestBed.configureTestingModule({
      imports: [TransactionFormComponent],
      providers: [
        provideRouter([]),
        provideNativeDateAdapter(),
        TransactionsService,
        CategoriesService,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    transactionsService = TestBed.inject(TransactionsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows Add Transaction title in create mode', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title?.textContent?.trim()).toBe('Add Transaction');
  });

  it('shows Add Transaction submit button in create mode', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn?.textContent?.trim()).toBe('Add Transaction');
  });

  it('renders Cancel button', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cancel');
  });

  it('creates transaction and navigates on save', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.dateValue = new Date(2026, 0, 15);
    comp.type = 'expense';
    comp.amountDisplay = '50.00';
    comp.categoryId = comp.categories()[0]?.id ?? '';
    comp.payee = 'Test Payee';
    comp.cleared = true;

    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(transactionsService.transactions().length).toBe(1);
    const created = transactionsService.transactions()[0];
    expect(created.amount).toBe(-5000);
    expect(created.payee).toBe('Test Payee');
    expect(created.date).toBe('2026-01-15');
    expect(navigateSpy).toHaveBeenCalledWith(['/transactions']);
  });

  it('creates income transaction with positive amount', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.dateValue = new Date(2026, 0, 15);
    comp.type = 'income';
    comp.amountDisplay = '100.50';
    comp.categoryId = comp.categories()[0]?.id ?? '';
    comp.payee = 'Salary';
    comp.cleared = true;

    const form = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const created = transactionsService.transactions()[0];
    expect(created.amount).toBe(10050);
  });
});

describe('TransactionFormComponent (edit mode)', () => {
  let transactionsService: TransactionsService;
  let storage: Record<string, string>;
  let createdId: string;

  beforeEach(async () => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => storage[key] ?? null,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });

    await TestBed.configureTestingModule({
      imports: [TransactionFormComponent],
      providers: [
        provideRouter([]),
        provideNativeDateAdapter(),
        TransactionsService,
        CategoriesService,
        {
          provide: ActivatedRoute,
          useValue: {
            get paramMap() {
              return of(convertToParamMap({ id: createdId }));
            },
          },
        },
      ],
    }).compileComponents();

    transactionsService = TestBed.inject(TransactionsService);
    const tx = transactionsService.create({
      date: '2026-01-20',
      amount: -7500,
      categoryId: 'cat-uncategorized',
      payee: 'Original Payee',
      cleared: false,
      tags: [],
    });
    createdId = tx.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows Edit Transaction title in edit mode', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title?.textContent?.trim()).toBe('Edit Transaction');
  });

  it('loads transaction data into form', () => {
    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.dateValue).toEqual(new Date(2026, 0, 20));
    expect(comp.type).toBe('expense');
    expect(comp.amountDisplay).toBe('75.00');
    expect(comp.payee).toBe('Original Payee');
    expect(comp.cleared).toBe(false);
  });

  it('updates transaction and navigates on save', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TransactionFormComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.payee = 'Updated Payee';
    comp.amountDisplay = '80.00';

    const form = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const updated = transactionsService.transactions()[0];
    expect(updated.payee).toBe('Updated Payee');
    expect(updated.amount).toBe(-8000);
    expect(navigateSpy).toHaveBeenCalledWith(['/transactions']);
  });
});
