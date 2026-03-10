import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  ViewChild,
  AfterViewInit,
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
        <a mat-raised-button color="primary" routerLink="/accounts/new"> Add Account </a>
      </mat-toolbar>

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
}
