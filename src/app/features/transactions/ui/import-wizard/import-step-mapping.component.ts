import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import { ImportRulesService } from '../../data-access/import/import-rules.service';
import type { ImportColumnMapping } from '../../data-access/import/import.types';
import { MatSelectChange } from '@angular/material/select';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-import-step-mapping',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Step 2: Column Mapping</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Map your CSV columns to transaction fields.</p>

        <div class="mapping-form">
          <mat-form-field appearance="outline">
            <mat-label>Date (required)</mat-label>
            <mat-select [ngModel]="mapping().date" (ngModelChange)="updateMapping('date', $event)">
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Amount (required)</mat-label>
            <mat-select
              [ngModel]="mapping().amount"
              (ngModelChange)="updateMapping('amount', $event)"
            >
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Payee / Description (required)</mat-label>
            <mat-select
              [ngModel]="mapping().payee"
              (ngModelChange)="updateMapping('payee', $event)"
            >
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Payer (optional)</mat-label>
            <mat-select
              [ngModel]="mapping().payer"
              (ngModelChange)="updateMapping('payer', $event)"
            >
              <mat-option value="">-- None --</mat-option>
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Owner (optional, default TW if blank)</mat-label>
            <mat-select
              [ngModel]="mapping().owner"
              (ngModelChange)="updateMapping('owner', $event)"
            >
              <mat-option value="">-- None (use TW) --</mat-option>
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category (optional)</mat-label>
            <mat-select
              [ngModel]="mapping().category"
              (ngModelChange)="updateMapping('category', $event)"
            >
              <mat-option value="">-- None --</mat-option>
              @for (h of headers(); track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-stroked-button type="button" (click)="autoDetect()">Auto-detect</button>
          @if (rules().length > 0) {
            <mat-form-field appearance="outline" class="rule-select">
              <mat-label>Load saved rule</mat-label>
              <mat-select (selectionChange)="loadRule($event)">
                <mat-option value="">-- Select rule --</mat-option>
                @for (r of rules(); track r.id) {
                  <mat-option [value]="r.id">{{ r.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          <div class="save-rule">
            <mat-form-field appearance="outline">
              <mat-label>Rule name</mat-label>
              <input matInput [(ngModel)]="ruleName" placeholder="Save mapping as..." />
            </mat-form-field>
            <button mat-stroked-button type="button" (click)="saveRule()">Save as rule</button>
          </div>
        </div>

        <button
          mat-raised-button
          color="primary"
          type="button"
          [disabled]="!canProceed()"
          (click)="next()"
        >
          Next: Preview
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .mapping-form {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }
    .actions {
      margin: 1rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
    .save-rule {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .rule-select {
      max-width: 200px;
    }
  `,
})
export class ImportStepMappingComponent {
  private readonly parser = inject(ImportParserService);
  private readonly rulesService = inject(ImportRulesService);

  readonly headers = input.required<string[]>();
  readonly rows = input.required<string[][]>();

  readonly mappingChange = output<ImportColumnMapping>();
  readonly nextStep = output<{ mapping: ImportColumnMapping; rows: string[][] }>();

  protected mapping = signal<ImportColumnMapping>({
    date: '',
    amount: '',
    payee: '',
  });

  protected ruleName = '';

  protected rules = computed(() => this.rulesService.rules());

  protected canProceed = computed(() => {
    const m = this.mapping();
    return !!(m.date && m.amount && m.payee);
  });

  constructor() {
    effect(() => {
      const h = this.headers();
      if (h.length > 0 && !this.mapping().date) {
        const detected = this.parser.detectMapping(h);
        if (detected) this.mapping.set(detected);
      }
    });
  }

  protected updateMapping(field: keyof ImportColumnMapping, value: string): void {
    this.mapping.update((m) => ({ ...m, [field]: value || undefined }));
  }

  protected autoDetect(): void {
    const h = this.headers();
    const detected = this.parser.detectMapping(h);
    if (detected) {
      this.mapping.set(detected);
    }
  }

  protected loadRule(change: MatSelectChange): void {
    const id = change.value;
    if (!id) return;
    const rule = this.rules().find((r) => r.id === id);
    if (rule) {
      this.mapping.set({ ...rule.mapping });
    }
  }

  protected saveRule(): void {
    const name = this.ruleName.trim();
    if (!name) return;
    this.rulesService.addRule(name, this.mapping());
    this.ruleName = '';
  }

  protected next(): void {
    this.mappingChange.emit(this.mapping());
    this.nextStep.emit({
      mapping: this.mapping(),
      rows: this.rows(),
    });
  }
}
