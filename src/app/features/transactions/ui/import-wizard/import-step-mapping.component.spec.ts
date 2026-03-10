import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImportStepMappingComponent } from './import-step-mapping.component';
import { ImportParserService } from '../../data-access/import/import-parser.service';
import { ImportRulesService } from '../../data-access/import/import-rules.service';

describe('ImportStepMappingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStepMappingComponent],
      providers: [ImportParserService, ImportRulesService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImportStepMappingComponent);
    fixture.componentRef.setInput('headers', ['Date', 'Amount', 'To']);
    fixture.componentRef.setInput('rows', [['1/15/26', '-100', 'Test']]);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders mapping dropdowns when headers provided', () => {
    const fixture = TestBed.createComponent(ImportStepMappingComponent);
    fixture.componentRef.setInput('headers', ['Date', 'Amount', 'To']);
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('mat-form-field').length).toBeGreaterThan(0);
  });
});
