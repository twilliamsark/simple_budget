import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImportParserService } from './import-parser.service';

describe('ImportParserService', () => {
  let service: ImportParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImportParserService],
    });
    service = TestBed.inject(ImportParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseAmount', () => {
    it('parses negative dollar amount to cents', () => {
      expect(service.parseAmount('-$650.00')).toBe(-65000);
    });

    it('parses positive dollar amount to cents', () => {
      expect(service.parseAmount('$115.50')).toBe(11550);
    });

    it('parses amount without dollar sign', () => {
      expect(service.parseAmount('-249.50')).toBe(-24950);
    });

    it('handles commas', () => {
      expect(service.parseAmount('$1,234.56')).toBe(123456);
    });

    it('returns 0 for invalid input', () => {
      expect(service.parseAmount('invalid')).toBe(0);
    });
  });

  describe('parseDate', () => {
    it('parses M/D/YY format', () => {
      const result = service.parseDate('1/15/26');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('parses MM/DD/YY format', () => {
      const result = service.parseDate('03/07/26');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns empty string for invalid date', () => {
      expect(service.parseDate('not-a-date')).toBe('');
    });
  });

  describe('parseCsvText', () => {
    it('parses simple CSV', () => {
      const text = 'Date,Amount,Payee\n1/15/26,-100,Test';
      const result = service.parseCsvText(text);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['Date', 'Amount', 'Payee']);
      expect(result[1]).toEqual(['1/15/26', '-100', 'Test']);
    });

    it('handles quoted fields', () => {
      const text = 'Date,Payee\n1/15/26,"Cursor, AI POWERED IDE"';
      const result = service.parseCsvText(text);
      expect(result[1][1]).toBe('Cursor, AI POWERED IDE');
    });
  });

  describe('mapRowToImportRow', () => {
    it('maps row to import row with correct fields', () => {
      const headers = ['Date', 'Amount', 'To', 'Category', 'Account'];
      const row = ['1/15/26', '-$100.00', 'Merchant', 'Food', 'CC-1'];
      const mapping = {
        date: 'Date',
        amount: 'Amount',
        payee: 'To',
        category: 'Category',
      };
      const result = service.mapRowToImportRow(row, headers, mapping);
      expect(result.date).toBeDefined();
      expect(result.amount).toBe(-10000);
      expect(result.payee).toBe('Merchant');
      expect(result.categoryName).toBe('Food');
      expect(result.importHash).toBeDefined();
    });
  });

  describe('detectMapping', () => {
    it('detects mapping for expense format', () => {
      const headers = ['Date', 'From', 'To', 'Category', 'Amount'];
      const result = service.detectMapping(headers);
      expect(result).not.toBeNull();
      expect(result!.date).toBe('Date');
      expect(result!.amount).toBe('Amount');
      expect(result!.payee).toBe('To');
      expect(result!.category).toBe('Category');
    });

    it('detects mapping for income format', () => {
      const headers = ['Date', 'To', 'Category', 'Amount', 'Memo'];
      const result = service.detectMapping(headers);
      expect(result).not.toBeNull();
      expect(result!.payee).toBe('Memo');
    });
  });
});
