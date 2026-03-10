import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import { TransactionsService } from '../../data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import type { ImportColumnMapping } from '../../data-access/import/import.types';
import type { TransactionImportRow } from '../../../../shared/models/transaction.model';
import type { TransactionCreate } from '../../../../shared/models/transaction.model';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
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

interface ResolvedRow extends TransactionImportRow {
  isDuplicate: boolean;
}

@Component({
  selector: 'app-import-step-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCheckbox,
    MatButton,
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
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Step 3: Preview & Import</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-checkbox [checked]="importOnlyNew()" (change)="importOnlyNew.set(!importOnlyNew())">
          Import only new transactions (skip duplicates)
        </mat-checkbox>

        <div class="summary">
          @let toImport = rowsToImport();
          @let resolved = resolvedRows();
          @if (resolved.length === 0) {
            <p class="empty-message">
              No data to preview. Please go back and ensure your file was loaded correctly and
              column mapping is complete.
            </p>
          } @else {
            {{ toImport.length }} transaction(s) to import
            @if (importOnlyNew() && duplicateCount() > 0) {
              ({{ duplicateCount() }} duplicate(s) skipped)
            }
          }
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="resolvedRows()">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="payee">
              <th mat-header-cell *matHeaderCellDef>Payee</th>
              <td mat-cell *matCellDef="let row">{{ row.payee }}</td>
            </ng-container>
            <ng-container matColumnDef="payer">
              <th mat-header-cell *matHeaderCellDef>Payer</th>
              <td mat-cell *matCellDef="let row">{{ row.payer || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td
                mat-cell
                *matCellDef="let row"
                [class.income]="row.amount > 0"
                [class.expense]="row.amount < 0"
              >
                {{ formatAmount(row.amount) }}
              </td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let row">{{ row.categoryName || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                @if (row.isDuplicate) {
                  <span class="badge duplicate">Duplicate</span>
                } @else {
                  <span class="badge new">New</span>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              [class.duplicate]="row.isDuplicate"
            ></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6">No data to preview.</td>
            </tr>
          </table>
        </div>

        @if (resolvedRows().length > 0 && rowsToImport().length === 0) {
          <p class="all-duplicates">
            All {{ resolvedRows().length }} transaction(s) are duplicates. Uncheck "Import only new"
            above to import them anyway, or go back to select a different file.
          </p>
        }

        <div class="actions">
          <button mat-stroked-button type="button" (click)="importComplete.emit(false)">
            Back
          </button>
          <button
            mat-raised-button
            color="primary"
            type="button"
            [disabled]="rowsToImport().length === 0"
            (click)="doImport()"
          >
            Import {{ rowsToImport().length }} transaction(s)
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-checkbox {
      display: block;
      margin: 1rem 0;
    }
    .summary {
      margin: 1rem 0;
      font-weight: 500;
    }
    .table-container {
      overflow-x: auto;
      margin: 1rem 0;
      min-height: 100px;
    }
    tr.duplicate {
      opacity: 0.6;
    }
    .income {
      color: #2e7d32;
    }
    .expense {
      color: #c62828;
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .badge.duplicate {
      background: #ffebee;
      color: #c62828;
    }
    .badge.new {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
    .empty-message {
      color: var(--mat-sys-error);
      margin: 0;
    }
    .all-duplicates {
      color: var(--mat-sys-tertiary);
      margin: 1rem 0;
    }
  `,
})
export class ImportStepPreviewComponent {
  private readonly parser = inject(ImportParserService);
  private readonly transactions = inject(TransactionsService);
  private readonly categories = inject(CategoriesService);

  readonly headers = input.required<string[]>();
  readonly rows = input.required<string[][]>();
  readonly mapping = input.required<ImportColumnMapping>();

  readonly importComplete = output<boolean>();

  protected displayedColumns = [
    'date',
    'payee',
    'payer',
    'amount',
    'category',
    'status',
  ];
  protected importOnlyNew = signal(true);

  protected resolvedRows = computed(() => {
    const headers = this.headers();
    const rows = this.rows();
    const mapping = this.mapping();
    const existingHashes = new Set(
      this.transactions
        .transactions()
        .map((t) => t.importHash)
        .filter(Boolean),
    );
    const onlyNew = this.importOnlyNew();

    const result: ResolvedRow[] = [];
    for (const row of rows) {
      const importRow = this.parser.mapRowToImportRow(row, headers, mapping);
      const isDuplicate = existingHashes.has(importRow.importHash);
      result.push({
        ...importRow,
        isDuplicate,
      });
    }
    return result;
  });

  protected rowsToImport = computed(() => {
    const resolved = this.resolvedRows();
    if (this.importOnlyNew()) {
      return resolved.filter((r) => !r.isDuplicate);
    }
    return resolved;
  });

  protected duplicateCount = computed(() => {
    return this.resolvedRows().filter((r) => r.isDuplicate).length;
  });

  protected formatAmount(cents: number): string {
    const sign = cents < 0 ? '-' : '';
    return sign + '$' + Math.abs(cents / 100).toFixed(2);
  }

  protected doImport(): void {
    const toImport = this.rowsToImport();
    for (const row of toImport) {
      const payload: TransactionCreate = {
        date: row.date,
        amount: row.amount,
        categoryId: this.resolveCategory(row.categoryName),
        payee: row.payee,
        payer: row.payer,
        cleared: true,
        tags: [],
        importHash: row.importHash,
      };
      this.transactions.create(payload);
    }
    this.importComplete.emit(true);
  }

  private resolveCategory(name?: string): string {
    if (!name?.trim()) {
      const uncategorized = this.categories.findByName('Uncategorized');
      if (uncategorized) return uncategorized.id;
      return this.categories.add('Uncategorized').id;
    }
    const found = this.categories.findByName(name);
    if (found) return found.id;
    return this.categories.add(name).id;
  }
}
