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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AccountsService } from '../../../../shared/data-access/accounts.service';

@Component({
  selector: 'app-account-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit() ? 'Edit Account' : 'Add Account' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form class="account-form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input
              matNativeControl
              matInput
              [(ngModel)]="name"
              name="name"
              required
              placeholder="e.g. Checking"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select matNativeControl [(ngModel)]="isInternalSelect" name="isInternalSelect">
              <mat-option [value]="true">Internal</mat-option>
              <mat-option [value]="false">External</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Note (optional)</mat-label>
            <textarea
              matNativeControl
              matInput
              [(ngModel)]="note"
              name="note"
              placeholder="Optional notes about this account"
              rows="3"
            ></textarea>
          </mat-form-field>

          <div class="actions">
            <button mat-stroked-button type="button" routerLink="/accounts">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!isValid()">
              {{ isEdit() ? 'Update' : 'Add' }} Account
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .account-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `,
})
export default class AccountFormComponent {
  private readonly accountsService = inject(AccountsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly accountId = signal<string | undefined>(undefined);

  readonly isEdit = computed(() => !!this.accountId());

  name = '';
  isInternalSelect = true;
  note = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.accountId.set(!id || id === 'new' ? undefined : id);
    });

    effect(() => {
      const id = this.accountId();
      if (id) {
        const acc = this.accountsService.getById(id);
        if (!acc) {
          this.router.navigate(['/accounts']);
          return;
        }
        this.name = acc.name;
        this.isInternalSelect = acc.isInternal;
        this.note = acc.note ?? '';
      } else {
        this.name = '';
        this.isInternalSelect = true;
        this.note = '';
      }
    });
  }

  protected isValid(): boolean {
    return !!this.name.trim();
  }

  protected save(): void {
    if (!this.isValid()) return;

    const id = this.accountId();
    if (id) {
      this.accountsService.update(id, {
        name: this.name.trim(),
        isInternal: this.isInternalSelect,
        note: this.note.trim() || undefined,
      });
    } else {
      this.accountsService.create({
        name: this.name.trim(),
        isInternal: this.isInternalSelect,
        note: this.note.trim() || undefined,
      });
    }
    this.router.navigate(['/accounts']);
  }
}
