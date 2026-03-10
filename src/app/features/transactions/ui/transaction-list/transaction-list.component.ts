import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  effect,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  MatTableDataSource,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import type { Transaction } from '../../../../shared/models/transaction.model';

interface TransactionFilterState {
  search: string;
  categoryId: string;
  payer: string;
  amountMin: string | number;
  amountMax: string | number;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'app-transaction-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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
    MatSort,
    MatSortHeader,
    MatToolbar,
    MatButton,
    MatIcon,
    MatCard,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOption,
  ],
  template: `
    <mat-card>
      <mat-toolbar>
        <span
          >Transactions
          <span [class.income]="filteredTotalPositive()" [class.expense]="filteredTotalNegative()">{{
            filteredTotalLabel()
          }}</span></span
        >
        <span class="spacer"></span>
        <a mat-button routerLink="/transactions/new">Add Transaction</a>
      </mat-toolbar>

      <div class="filters">
        <div class="filters-row filters-row--first">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input
              matInput
              [(ngModel)]="filterState.search"
              (ngModelChange)="applyFilters()"
              placeholder="Payee, memo..."
            />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date from</mat-label>
            <input
              matInput
              type="date"
              [(ngModel)]="filterState.dateFrom"
              (ngModelChange)="applyFilters()"
            />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date to</mat-label>
            <input
              matInput
              type="date"
              [(ngModel)]="filterState.dateTo"
              (ngModelChange)="applyFilters()"
            />
          </mat-form-field>
        </div>
        <div class="filters-row filters-row--second">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="filterState.categoryId" (ngModelChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              @for (c of sortedCategories(); track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Payer</mat-label>
            <input
              matInput
              [(ngModel)]="filterState.payer"
              (ngModelChange)="applyFilters()"
              placeholder="Filter by payer"
            />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Amount min ($)</mat-label>
            <input
              matInput
              type="number"
              step="0.01"
              [(ngModel)]="filterState.amountMin"
              (ngModelChange)="applyFilters()"
              placeholder="—"
            />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Amount max ($)</mat-label>
            <input
              matInput
              type="number"
              step="0.01"
              [(ngModel)]="filterState.amountMax"
              (ngModelChange)="applyFilters()"
              placeholder="—"
            />
          </mat-form-field>
          <button
            mat-stroked-button
            type="button"
            [disabled]="!hasActiveFilters()"
            (click)="clearFilters()"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="date-column">Date</th>
            <td mat-cell *matCellDef="let tx" class="date-column">{{ tx.date }}</td>
          </ng-container>
          <ng-container matColumnDef="payee">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payee</th>
            <td mat-cell *matCellDef="let tx">{{ tx.payee }}</td>
          </ng-container>
          <ng-container matColumnDef="payer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payer</th>
            <td mat-cell *matCellDef="let tx">{{ tx.payer || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
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
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let tx">{{ categoryName(tx.categoryId) }}</td>
          </ng-container>
          <ng-container matColumnDef="cleared">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Cleared</th>
            <td mat-cell *matCellDef="let tx">{{ tx.cleared ? 'Yes' : 'No' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let tx" class="actions-cell">
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
            <td class="mat-cell" colspan="7">
              {{ hasActiveFilters() ? 'No transactions match your filters.' : 'No transactions. Import a CSV or add manually.' }}
            </td>
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
    .filters {
      padding: 0.5rem 1rem 0;
    }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
    }
    .filters-row--second {
      margin-top: 0.5rem;
    }
    .filters-row mat-form-field {
      min-width: 120px;
      max-width: 180px;
    }
    .table-container {
      overflow-x: auto;
    }
    .date-column {
      min-width: 7.5rem;
      white-space: nowrap;
    }
    .actions-cell {
      white-space: nowrap;
    }
    .actions-cell a,
    .actions-cell button {
      display: inline-flex;
    }
    .actions-cell a {
      margin-right: 10px;
    }
    .income {
      color: #2e7d32;
    }
    .expense {
      color: #c62828;
    }
  `,
})
export default class TransactionListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  private readonly transactions = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);

  protected categories = this.categoriesService.categories;
  protected sortedCategories = computed(() =>
    [...this.categoriesService.categories()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  );
  protected dataSource = new MatTableDataSource<Transaction>([]);
  protected filterState: TransactionFilterState = {
    search: '',
    categoryId: '',
    payer: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
  };
  private readonly filterVersion = signal(0);
  protected displayedColumns = [
    'date',
    'payee',
    'payer',
    'amount',
    'category',
    'cleared',
    'actions',
  ];

  constructor() {
    this.dataSource.data = this.transactions.transactions();
    this.dataSource.filterPredicate = (tx: Transaction, filterJson: string): boolean => {
      if (!filterJson?.trim()) return true;
      try {
        const state = JSON.parse(filterJson) as TransactionFilterState;
        return this.matchesFilter(tx, state);
      } catch {
        return true;
      }
    };
    effect(() => {
      this.dataSource.data = this.transactions.transactions();
    });
  }

  private matchesFilter(tx: Transaction, state: TransactionFilterState): boolean {
    if (state.search?.trim()) {
      const term = state.search.trim().toLowerCase();
      const searchable = [tx.date, tx.payee, tx.payer ?? '', this.formatAmount(tx.amount), this.categoryName(tx.categoryId), tx.cleared ? 'yes' : 'no'].join(' ').toLowerCase();
      if (!searchable.includes(term)) return false;
    }
    if (state.categoryId && tx.categoryId !== state.categoryId) return false;
    if (state.payer?.trim()) {
      const payer = (tx.payer ?? '').toLowerCase();
      if (!payer.includes(state.payer.trim().toLowerCase())) return false;
    }
    const amountDollars = tx.amount / 100;
    const min = typeof state.amountMin === 'number' ? state.amountMin : parseFloat(String(state.amountMin));
    if (!Number.isNaN(min) && amountDollars < min) return false;
    const max = typeof state.amountMax === 'number' ? state.amountMax : parseFloat(String(state.amountMax));
    if (!Number.isNaN(max) && amountDollars > max) return false;
    if (state.dateFrom && tx.date < state.dateFrom) return false;
    if (state.dateTo && tx.date > state.dateTo) return false;
    return true;
  }

  protected applyFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filterState);
    this.filterVersion.update((v) => v + 1);
  }

  protected clearFilters(): void {
    this.filterState.search = '';
    this.filterState.categoryId = '';
    this.filterState.payer = '';
    this.filterState.amountMin = '';
    this.filterState.amountMax = '';
    this.filterState.dateFrom = '';
    this.filterState.dateTo = '';
    this.applyFilters();
  }

  private getFilteredList(): Transaction[] {
    return this.transactions.transactions().filter((tx) => this.matchesFilter(tx, this.filterState));
  }

  protected hasActiveFilters(): boolean {
    const s = this.filterState;
    return !!(s.search?.trim() || s.categoryId || s.payer?.trim() || s.amountMin !== '' || s.amountMax !== '' || s.dateFrom || s.dateTo);
  }

  protected filteredTotalLabel = computed(() => {
    this.transactions.transactions();
    this.filterVersion();
    const cents = this.getFilteredList().reduce((sum, tx) => sum + tx.amount, 0);
    return `(Total: ${this.formatAmount(cents)})`;
  });

  protected filteredTotalPositive = computed(() => {
    this.transactions.transactions();
    this.filterVersion();
    return this.getFilteredList().reduce((sum, tx) => sum + tx.amount, 0) > 0;
  });

  protected filteredTotalNegative = computed(() => {
    this.transactions.transactions();
    this.filterVersion();
    return this.getFilteredList().reduce((sum, tx) => sum + tx.amount, 0) < 0;
  });

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (tx: Transaction, prop: string) => {
      if (prop === 'date') return tx.date;
      if (prop === 'payee') return tx.payee.toLowerCase();
      if (prop === 'payer') return (tx.payer ?? '').toLowerCase();
      if (prop === 'amount') return tx.amount;
      if (prop === 'category') return this.categoryName(tx.categoryId).toLowerCase();
      if (prop === 'cleared') return tx.cleared ? 'yes' : 'no';
      return '';
    };
    this.sort.sort({ id: 'date', start: 'desc', disableClear: false });
  }

  protected formatAmount(cents: number): string {
    const sign = cents < 0 ? '-' : '';
    return sign + '$' + Math.abs(cents / 100).toFixed(2);
  }

  protected categoryName(id: string): string {
    return this.categoriesService.categories().find((c) => c.id === id)?.name ?? '—';
  }

  protected delete(tx: Transaction): void {
    if (confirm('Delete this transaction?')) {
      this.transactions.delete(tx.id);
    }
  }
}
