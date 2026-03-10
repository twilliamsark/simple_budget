import {
  Component,
  output,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-import-step-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatButton, MatIcon],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Step 1: Upload CSV</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <input
          #fileInput
          type="file"
          accept=".csv"
          class="file-input"
          (change)="onFileSelected($event)"
        />
        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="fileInput.click()"
        >
          <mat-icon>upload_file</mat-icon>
          Choose CSV file
        </button>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        @if (headers().length > 0) {
          <div class="preview">
            <p><strong>Headers:</strong> {{ headers().join(', ') }}</p>
            <p>{{ rows().length }} rows found</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .file-input {
      display: none;
    }
    button {
      margin: 1rem 0;
      cursor: pointer;
    }
    .error {
      color: var(--mat-sys-error);
      margin: 1rem 0;
    }
    .preview {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--mat-sys-surface-container-highest);
      border-radius: 8px;
    }
  `,
})
export class ImportStepUploadComponent {
  private readonly parser = inject(ImportParserService);

  readonly fileLoaded = output<{ headers: string[]; rows: string[][] }>();

  protected error = signal<string | null>(null);
  protected headers = signal<string[]>([]);
  protected rows = signal<string[][]>([]);

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);
    try {
      const rows = await this.parser.parseCsvFile(file);
      if (rows.length < 2) {
        this.error.set('File must have at least a header row and one data row');
        return;
      }
      const [headerRow, ...dataRows] = rows;
      const headers = headerRow ?? [];
      this.headers.set(headers);
      this.rows.set(dataRows);
      this.fileLoaded.emit({ headers, rows: dataRows });
    } catch (e) {
      this.error.set('Failed to parse CSV file');
    }
  }
}
