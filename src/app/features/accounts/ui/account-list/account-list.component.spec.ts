import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import AccountListComponent from './account-list.component';
import { AccountsService } from '../../../../shared/data-access/accounts.service';
import { TransactionsService } from '../../../transactions/data-access/transactions.service';

describe('AccountListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [
        provideRouter([]),
        AccountsService,
        TransactionsService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccountListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders Add Account link', () => {
    const fixture = TestBed.createComponent(AccountListComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/accounts/new"]');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toBe('Add Account');
  });

  it('renders accounts table', () => {
    const fixture = TestBed.createComponent(AccountListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
  });
});
