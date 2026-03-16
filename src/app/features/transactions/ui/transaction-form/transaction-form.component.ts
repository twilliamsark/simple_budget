import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import { AccountsService } from '../../../../shared/data-access/accounts.service';
import type { TransactionCreate } from '../../../../shared/models/transaction.model';

const PAYER_OTHER = '__other__';

@Component({
  selector: 'app-transaction-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatButton,
    MatDatepickerModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit() ? 'Edit Transaction' : 'Add Transaction' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form class="transaction-form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              [(ngModel)]="dateValue"
              name="date"
              required
              (click)="picker.open()"
            />
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="type" name="type">
              <mat-option value="income">Income</mat-option>
              <mat-option value="expense">Expense</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input
              matInput
              type="number"
              step="0.01"
              min="0"
              [(ngModel)]="amountDisplay"
              name="amount"
              required
              placeholder="0.00"
            />
            <span matTextPrefix>$</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="categoryId" name="categoryId" required>
              @for (c of sortedCategories(); track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payee</mat-label>
            <mat-select [(ngModel)]="payeeAccountId" name="payeeAccountId" (ngModelChange)="onPayeeSourceChange()">
              <mat-option value="">Other (free form)</mat-option>
              @for (a of sortedAccounts(); track a.id) {
                <mat-option [value]="a.id">{{ a.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (!payeeAccountId) {
            <mat-form-field appearance="outline">
              <mat-label>Payee (free form)</mat-label>
              <input
                matInput
                [(ngModel)]="payeeFreeform"
                name="payeeFreeform"
                placeholder="e.g. Grocery Store"
              />
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>Payer (optional)</mat-label>
            <mat-select [(ngModel)]="payerAccountId" name="payerAccountId" (ngModelChange)="onPayerSourceChange()">
              <mat-option value="">None</mat-option>
              <mat-option value="__other__">Other (free form)</mat-option>
              @for (a of sortedAccounts(); track a.id) {
                <mat-option [value]="a.id">{{ a.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (payerAccountId === '__other__') {
            <mat-form-field appearance="outline">
              <mat-label>Payer (free form)</mat-label>
              <input
                matInput
                [(ngModel)]="payerFreeform"
                name="payerFreeform"
                placeholder="Who paid / source of payment"
              />
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>Owner (optional)</mat-label>
            <input
              matInput
              [(ngModel)]="owner"
              name="owner"
              placeholder="e.g. TW"
            />
          </mat-form-field>

          <div class="cleared-row">
            <mat-checkbox [(ngModel)]="cleared" name="cleared">Cleared</mat-checkbox>
          </div>

          <div class="actions">
            <button mat-stroked-button type="button" routerLink="/transactions">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!isValid()">
              {{ isEdit() ? 'Update' : 'Add' }} Transaction
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }
    .cleared-row {
      margin: 0.5rem 0;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class TransactionFormComponent {
  private readonly transactions = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly accountsService = inject(AccountsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly transactionId = signal<string | undefined>(undefined);

  readonly isEdit = computed(() => !!this.transactionId());

  readonly categories = this.categoriesService.categories;
  readonly sortedCategories = computed(() =>
    [...this.categoriesService.categories()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  );
  readonly sortedAccounts = computed(() =>
    [...this.accountsService.accounts()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  );

  dateValue: Date | null = new Date();
  type: 'income' | 'expense' = 'expense';
  amountDisplay = '';
  categoryId = '';
  payeeAccountId = '';
  payeeFreeform = '';
  payerAccountId = '';
  payerFreeform = '';
  owner = '';
  cleared = false;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.transactionId.set(!id || id === 'new' ? undefined : id);
    });

    effect(() => {
      const id = this.transactionId();
      if (id) {
        const tx = this.transactions.getById(id);
        if (!tx) {
          this.router.navigate(['/transactions']);
          return;
        }
        const [y, m, d] = tx.date.split('-').map(Number);
        this.dateValue = new Date(y, m - 1, d);
        this.type = tx.amount >= 0 ? 'income' : 'expense';
        this.amountDisplay = (Math.abs(tx.amount) / 100).toFixed(2);
        this.categoryId = tx.categoryId;
        this.setPayeeFromTx(tx.payee);
        this.setPayerFromTx(tx.payer ?? '');
        this.owner = tx.owner ?? '';
        this.cleared = tx.cleared;
      } else {
        this.dateValue = new Date();
        this.type = 'expense';
        this.amountDisplay = '';
        this.categoryId = this.sortedCategories()[0]?.id ?? '';
        this.payeeAccountId = '';
        this.payeeFreeform = '';
        this.payerAccountId = '';
        this.payerFreeform = '';
        this.owner = '';
        this.cleared = false;
      }
    });
  }

  private setPayeeFromTx(payee: string): void {
    const account = this.accountsService.findByName(payee);
    if (account) {
      this.payeeAccountId = account.id;
      this.payeeFreeform = '';
    } else {
      this.payeeAccountId = '';
      this.payeeFreeform = payee;
    }
  }

  private setPayerFromTx(payer: string): void {
    if (!payer) {
      this.payerAccountId = '';
      this.payerFreeform = '';
      return;
    }
    const account = this.accountsService.findByName(payer);
    if (account) {
      this.payerAccountId = account.id;
      this.payerFreeform = '';
    } else {
      this.payerAccountId = PAYER_OTHER;
      this.payerFreeform = payer;
    }
  }

  protected onPayeeSourceChange(): void {
    if (this.payeeAccountId) this.payeeFreeform = '';
  }

  protected onPayerSourceChange(): void {
    if (this.payerAccountId !== PAYER_OTHER) this.payerFreeform = '';
  }

  protected isValid(): boolean {
    const amt = parseFloat(this.amountDisplay);
    const payeeStr = this.getPayeeValue();
    return (
      this.dateValue != null &&
      !Number.isNaN(amt) &&
      amt > 0 &&
      !!this.categoryId &&
      !!payeeStr.trim()
    );
  }

  private getPayeeValue(): string {
    if (this.payeeAccountId) {
      const a = this.accountsService.getById(this.payeeAccountId);
      return a?.name ?? '';
    }
    return this.payeeFreeform;
  }

  private getPayerValue(): string | undefined {
    if (this.payerAccountId === '' || !this.payerAccountId) return undefined;
    if (this.payerAccountId === PAYER_OTHER) return this.payerFreeform.trim() || undefined;
    const a = this.accountsService.getById(this.payerAccountId);
    return a?.name ?? undefined;
  }

  protected save(): void {
    if (!this.isValid()) return;

    const amt = parseFloat(this.amountDisplay);
    const cents = Math.round(amt * 100);
    const signedAmount = this.type === 'income' ? cents : -cents;

    const payee = this.getPayeeValue().trim();
    let payer: string | undefined = this.getPayerValue();
    if (payer && this.payerAccountId === PAYER_OTHER) {
      const existing = this.accountsService.findByName(payer);
      if (!existing) {
        this.accountsService.create({
          name: payer,
          isInternal: false,
          note: 'To review',
        });
      }
    }

    const dateStr =
      this.dateValue != null ? this.dateValue.toISOString().slice(0, 10) : '';
    const payload: TransactionCreate = {
      date: dateStr,
      amount: signedAmount,
      categoryId: this.categoryId,
      payee,
      payer: payer || undefined,
      owner: this.owner.trim() || undefined,
      cleared: this.cleared,
      tags: [],
    };

    const id = this.transactionId();
    if (id) {
      this.transactions.update(id, payload);
    } else {
      this.transactions.create(payload);
    }
    this.router.navigate(['/transactions']);
  }
}
