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
import type { TransactionCreate } from '../../../../shared/models/transaction.model';

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
              @for (c of categories(); track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payee / Description</mat-label>
            <input
              matInput
              [(ngModel)]="payee"
              name="payee"
              required
              placeholder="e.g. Grocery Store"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payer (optional)</mat-label>
            <input
              matInput
              [(ngModel)]="payer"
              name="payer"
              placeholder="Who paid / source of payment"
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly transactionId = signal<string | undefined>(undefined);

  readonly isEdit = computed(() => !!this.transactionId());

  readonly categories = this.categoriesService.categories;

  dateValue: Date | null = new Date();
  type: 'income' | 'expense' = 'expense';
  amountDisplay = '';
  categoryId = '';
  payee = '';
  payer = '';
  cleared = true;

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
        this.payee = tx.payee;
        this.payer = tx.payer ?? '';
        this.cleared = tx.cleared;
      } else {
        this.dateValue = new Date();
        this.type = 'expense';
        this.amountDisplay = '';
        this.categoryId = this.categories()[0]?.id ?? '';
        this.payee = '';
        this.payer = '';
        this.cleared = true;
      }
    });
  }

  protected isValid(): boolean {
    const amt = parseFloat(this.amountDisplay);
    return (
      this.dateValue != null &&
      !Number.isNaN(amt) &&
      amt > 0 &&
      !!this.categoryId &&
      !!this.payee.trim()
    );
  }

  protected save(): void {
    if (!this.isValid()) return;

    const amt = parseFloat(this.amountDisplay);
    const cents = Math.round(amt * 100);
    const signedAmount = this.type === 'income' ? cents : -cents;

    const dateStr =
      this.dateValue != null ? this.dateValue.toISOString().slice(0, 10) : '';
    const payload: TransactionCreate = {
      date: dateStr,
      amount: signedAmount,
      categoryId: this.categoryId,
      payee: this.payee.trim(),
      payer: this.payer.trim() || undefined,
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
