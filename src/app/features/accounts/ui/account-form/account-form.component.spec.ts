import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import AccountFormComponent from './account-form.component';
import { AccountsService } from '../../../../shared/data-access/accounts.service';
import { TransactionsService } from '../../../transactions/data-access/transactions.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

describe('AccountFormComponent', () => {
  let accountsService: AccountsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AccountFormComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
      ],
      providers: [
        provideRouter([]),
        AccountsService,
        TransactionsService,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    accountsService = TestBed.inject(AccountsService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccountFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows Add Account title in create mode', () => {
    const fixture = TestBed.createComponent(AccountFormComponent);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title?.textContent?.trim()).toBe('Add Account');
  });

  it('creates account and navigates on save', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(AccountFormComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.name = 'New Account';
    comp.isInternalSelect = false;

    const form = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const created = accountsService.accounts().find((a) => a.name === 'New Account');
    expect(created).toBeDefined();
    expect(created?.isInternal).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/accounts']);
  });
});
