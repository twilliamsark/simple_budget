import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImportStepUploadComponent } from './import-step-upload.component';
import { ImportParserService } from '../../data-access/import/import-parser.service';

describe('ImportStepUploadComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStepUploadComponent],
      providers: [ImportParserService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImportStepUploadComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders file input', () => {
    const fixture = TestBed.createComponent(ImportStepUploadComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('accept')).toBe('.csv');
  });
});
