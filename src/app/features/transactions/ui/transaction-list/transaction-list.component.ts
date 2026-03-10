import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatRowDef,
  MatHeaderRow,
  MatRow,
  MatNoDataRow,
} from '@angular/material/table';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import type { Transaction } from '../../../../shared/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderRow,
    MatRow,
    MatNoDataRow,
    MatToolbar,
    MatButton,
    MatIcon,
    MatCard,
  ],
  template: `
    <mat-card>
      <mat-toolbar>
        <span
          >Transactions
          <span [class.income]="totalAmountPositive()" [class.expense]="totalAmountNegative()">{{
            totalAmountLabel()
          }}</span></span
        >
        <span class="spacer"></span>
        <a mat-button routerLink="/transactions/new">Add Transaction</a>
        <a mat-raised-button color="primary" routerLink="/transactions/import"> Import CSV </a>
      </mat-toolbar>

      <div class="table-container">
        <table mat-table [dataSource]="sortedTransactions()">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let tx">{{ tx.date }}</td>
          </ng-container>
          <ng-container matColumnDef="payee">
            <th mat-header-cell *matHeaderCellDef>Payee</th>
            <td mat-cell *matCellDef="let tx">{{ tx.payee }}</td>
          </ng-container>
          <ng-container matColumnDef="payer">
            <th mat-header-cell *matHeaderCellDef>Payer</th>
            <td mat-cell *matCellDef="let tx">{{ tx.payer || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td
              mat-cell
              *matCellDef="let tx"
              [class.income]="tx.amount > 0"
              [class.expense]="tx.amount < 0"
            >
              {{ formatAmount(tx.amount) }}
            </td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let tx">{{ categoryName(tx.categoryId) }}</td>
          </ng-container>
          <ng-container matColumnDef="cleared">
            <th mat-header-cell *matHeaderCellDef>Cleared</th>
            <td mat-cell *matCellDef="let tx">{{ tx.cleared ? 'Yes' : 'No' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let tx">
              <a mat-icon-button [routerLink]="['/transactions', tx.id, 'edit']" aria-label="Edit">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" (click)="delete(tx)" aria-label="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="7">No transactions. Import a CSV or add manually.</td>
          </tr>
        </table>
      </div>
    </mat-card>
  `,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      background: transparent !important;
      padding: 0;
      min-height: 48px;
    }
    .table-container {
      overflow-x: auto;
    }
    .income {
      color: #2e7d32;
    }
    .expense {
      color: #c62828;
    }
  `,
})
export default class TransactionListComponent {
  private readonly transactions = inject(TransactionsService);
  private readonly categories = inject(CategoriesService);

  protected displayedColumns = [
    'date',
    'payee',
    'payer',
    'amount',
    'category',
    'cleared',
    'actions',
  ];

  protected sortedTransactions = computed(() => {
    return [...this.transactions.transactions()].sort((a, b) => b.date.localeCompare(a.date));
  });

  protected totalAmountLabel = computed(() => {
    const cents = this.transactions.totalAmount();
    const formatted = this.formatAmount(cents);
    return `(Total: ${formatted})`;
  });

  protected totalAmountPositive = computed(() => this.transactions.totalAmount() > 0);
  protected totalAmountNegative = computed(() => this.transactions.totalAmount() < 0);

  protected formatAmount(cents: number): string {
    const sign = cents < 0 ? '-' : '';
    return sign + '$' + Math.abs(cents / 100).toFixed(2);
  }

  protected categoryName(id: string): string {
    return this.categories.categories().find((c) => c.id === id)?.name ?? '—';
  }

  protected delete(tx: Transaction): void {
    if (confirm('Delete this transaction?')) {
      this.transactions.delete(tx.id);
    }
  }
}
