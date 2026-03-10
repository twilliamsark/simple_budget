import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImportStepPreviewComponent } from './import-step-preview.component';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import { AccountsService } from '../../../../shared/data-access/accounts.service';

describe('ImportStepPreviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStepPreviewComponent],
      providers: [
        ImportParserService,
        TransactionsService,
        CategoriesService,
        AccountsService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImportStepPreviewComponent);
    fixture.componentRef.setInput('headers', ['Date', 'Amount', 'To']);
    fixture.componentRef.setInput('rows', [['1/15/26', '-100', 'Test']]);
    fixture.componentRef.setInput('mapping', {
      date: 'Date',
      amount: 'Amount',
      payee: 'To',
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders preview table', () => {
    const fixture = TestBed.createComponent(ImportStepPreviewComponent);
    fixture.componentRef.setInput('headers', ['Date', 'Amount', 'To']);
    fixture.componentRef.setInput('rows', [['1/15/26', '-100', 'Test']]);
    fixture.componentRef.setInput('mapping', {
      date: 'Date',
      amount: 'Amount',
      payee: 'To',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
  });
});
