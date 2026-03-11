import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
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
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { AccountsService } from '../../../../shared/data-access/accounts.service';
import type { Account } from '../../../../shared/models/account.model';

@Component({
  selector: 'app-account-list',
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
    MatSort,
    MatSortHeader,
    MatToolbar,
    MatButton,
    MatIcon,
    MatCard,
    MatTooltip,
  ],
  template: `
    <mat-card>
      <mat-toolbar>
        <span>Accounts</span>
        <span class="spacer"></span>
        <a mat-raised-button color="primary" routerLink="/accounts/new">Add Account</a>
        <button mat-raised-button color="primary" type="button" (click)="importCsvClick()">
          Import CSV
        </button>
        <button mat-raised-button color="primary" type="button" (click)="exportCsv()">
          Export CSV
        </button>
      </mat-toolbar>
      <input
        #fileInput
        type="file"
        accept=".csv"
        (change)="onImportFile($event)"
        style="display: none"
      />

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let acc">{{ acc.name }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let acc">{{ acc.isInternal ? 'Internal' : 'External' }}</td>
          </ng-container>
          <ng-container matColumnDef="note">
            <th mat-header-cell *matHeaderCellDef>Note</th>
            <td mat-cell *matCellDef="let acc">{{ acc.note || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let acc">
              <a mat-icon-button [routerLink]="['/accounts', acc.id, 'edit']" aria-label="Edit">
                <mat-icon>edit</mat-icon>
              </a>
              @if (hasTransactions(acc.id)) {
                <button
                  mat-icon-button
                  color="warn"
                  disabled
                  [matTooltip]="'Cannot delete: account has transactions'"
                  aria-label="Delete (disabled)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              } @else {
                <button mat-icon-button color="warn" (click)="delete(acc)" aria-label="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="4">No accounts.</td>
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
    button[disabled] {
      opacity: 0.5;
    }
  `,
})
export default class AccountListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly accountsService = inject(AccountsService);

  protected dataSource = new MatTableDataSource<Account>([]);
  protected displayedColumns = ['name', 'type', 'note', 'actions'];

  constructor() {
    this.dataSource.data = this.accountsService.accounts();
    effect(() => {
      this.dataSource.data = this.accountsService.accounts();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (acc: Account, prop: string) => {
      if (prop === 'name') return acc.name.toLowerCase();
      if (prop === 'type') return acc.isInternal ? 'internal' : 'external';
      return '';
    };
  }

  protected hasTransactions(accountId: string): boolean {
    return this.accountsService.hasTransactions(accountId);
  }

  protected delete(acc: Account): void {
    if (confirm(`Delete account "${acc.name}"?`)) {
      const deleted = this.accountsService.delete(acc.id);
      if (!deleted) {
        alert('Cannot delete: this account has transactions.');
      }
    }
  }

  protected importCsvClick(): void {
    this.fileInputRef?.nativeElement?.click();
  }

  protected onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const rows = this.parseCsv(text);
      if (rows.length < 2) return;
      const headers = rows[0].map((c) => c.toLowerCase());
      const nameIdx = headers.indexOf('name');
      const typeIdx = headers.indexOf('type');
      const noteIdx = headers.indexOf('note');
      if (nameIdx === -1) return;
      let created = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = (row[nameIdx] ?? '').trim();
        if (!name) continue;
        const typeVal = (row[typeIdx] ?? '').trim().toLowerCase();
        const isInternal = typeVal !== 'external' && typeVal !== 'no' && typeVal !== 'false';
        const note = noteIdx >= 0 ? (row[noteIdx] ?? '').trim() || undefined : undefined;
        this.accountsService.create({ name, isInternal, note });
        created++;
      }
      if (created > 0) {
        this.dataSource.data = this.accountsService.accounts();
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  private parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',' || c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
          if (c === '\r') i++;
          row.push(field);
          field = '';
          if (c !== ',') {
            rows.push(row);
            row = [];
          }
        } else {
          field += c;
        }
      }
    }
    row.push(field);
    if (row.length > 0 || field !== '') rows.push(row);
    return rows;
  }

  protected exportCsv(): void {
    const accounts = this.accountsService.accounts();
    const escape = (v: string): string => {
      if (/[",\r\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
      return v;
    };
    const headers = ['Name', 'Type', 'Note'];
    const lines = [
      headers.join(','),
      ...accounts.map((acc) =>
        [
          escape(acc.name),
          acc.isInternal ? 'Internal' : 'External',
          escape(acc.note ?? ''),
        ].join(',')
      ),
    ];
    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
