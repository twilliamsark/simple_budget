import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ImportStepUploadComponent } from './import-step-upload.component';
import { ImportStepMappingComponent } from './import-step-mapping.component';
import { ImportStepPreviewComponent } from './import-step-preview.component';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import type { ImportColumnMapping } from '../../data-access/import/import.types';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-import-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImportStepUploadComponent,
    ImportStepMappingComponent,
    ImportStepPreviewComponent,
    MatCard,
  ],
  template: `
    <mat-card>
      <h1>Import CSV</h1>
      <div class="steps">
        <span [class.active]="step() >= 1">1. Upload</span>
        <span [class.active]="step() >= 2">2. Mapping</span>
        <span [class.active]="step() >= 3">3. Preview</span>
      </div>

      @switch (step()) {
        @case (1) {
          <app-import-step-upload (fileLoaded)="onFileLoaded($event)" />
        }
        @case (2) {
          <app-import-step-mapping
            [headers]="headers()"
            [rows]="rows()"
            (nextStep)="onMappingNext($event)"
          />
        }
        @case (3) {
          <app-import-step-preview
            [headers]="headers()"
            [rows]="rows()"
            [mapping]="mapping()"
            (importComplete)="onImportComplete($event)"
          />
        }
      }
    </mat-card>
  `,
  styles: `
    mat-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .steps {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
      color: #9e9e9e;
    }
    .steps .active {
      color: #1976d2;
      font-weight: 500;
    }
  `,
})
export default class ImportWizardComponent {
  private readonly router = inject(Router);
  private readonly parser = inject(ImportParserService);

  protected step = signal(1);
  protected headers = signal<string[]>([]);
  protected rows = signal<string[][]>([]);
  protected mapping = signal<ImportColumnMapping>({
    date: '',
    amount: '',
    payee: '',
  });

  protected onFileLoaded(event: { headers: string[]; rows: string[][] }): void {
    this.headers.set(event.headers);
    this.rows.set(event.rows);
    this.step.set(2);
  }

  protected onMappingNext(event: {
    mapping: ImportColumnMapping;
    rows: string[][];
  }): void {
    let mapping = event.mapping;
    if (!mapping.date || !mapping.amount || !mapping.payee) {
      const detected = this.parser.detectMapping(this.headers());
      if (detected) mapping = detected;
    }
    this.mapping.set(mapping);
    this.rows.set(event.rows);
    this.step.set(3);
  }

  protected onImportComplete(success: boolean): void {
    if (success) {
      this.router.navigate(['/transactions']);
    } else {
      this.step.set(2);
    }
  }
}
