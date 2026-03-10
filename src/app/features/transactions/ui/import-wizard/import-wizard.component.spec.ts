import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import ImportWizardComponent from './import-wizard.component';

describe('ImportWizardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportWizardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImportWizardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows step 1 initially', () => {
    const fixture = TestBed.createComponent(ImportWizardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-import-step-upload')).toBeTruthy();
  });
});
