import { Injectable } from '@angular/core';
import { computeImportHash } from '../../../../shared/utils/import-hash.util';
import type { TransactionImportRow } from '../../../../shared/models/transaction.model';
import type { ImportColumnMapping } from './import.types';

@Injectable({ providedIn: 'root' })
export class ImportParserService {
  async parseCsvFile(file: File): Promise<string[][]> {
    const text = await file.text();
    return this.parseCsvText(text);
  }

  parseCsvText(text: string): string[][] {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    return lines.map((line) => this.parseCsvLine(line));
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        current += char;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  parseAmount(raw: string): number {
    const cleaned = raw.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100);
  }

  parseDate(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return this.toIsoDate(parsed);
    }

    const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (mdy) {
      const [, month, day, year] = mdy;
      const y = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
      const d = new Date(y, parseInt(month, 10) - 1, parseInt(day, 10));
      if (!Number.isNaN(d.getTime())) return this.toIsoDate(d);
    }

    return '';
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  mapRowToImportRow(
    row: string[],
    headers: string[],
    mapping: ImportColumnMapping,
  ): TransactionImportRow {
    const getVal = (col: string): string => {
      const idx = headers.indexOf(col);
      return idx >= 0 && row[idx] !== undefined ? String(row[idx] ?? '').trim() : '';
    };

    const dateStr = getVal(mapping.date);
    const amountRaw = getVal(mapping.amount);
    const payee = getVal(mapping.payee) || getVal(mapping.category ?? '') || 'Unknown';
    const payer = mapping.payer ? getVal(mapping.payer) || undefined : undefined;

    const date = this.parseDate(dateStr) || dateStr;
    const amount = this.parseAmount(amountRaw);

    const importHash = computeImportHash(date, amount, payee);
    const categoryName = mapping.category ? getVal(mapping.category) || undefined : undefined;

    return {
      date,
      amount,
      payee,
      payer,
      categoryName,
      importHash,
    };
  }

  detectMapping(headers: string[]): ImportColumnMapping | null {
    const lower = headers.map((h) => h.toLowerCase().trim());

    const find = (...candidates: string[]): string => {
      for (const c of candidates) {
        const idx = lower.findIndex((h) => h === c || h.includes(c));
        if (idx >= 0) return headers[idx];
      }
      return headers[0] ?? '';
    };

    return {
      date: find('date'),
      amount: find('amount'),
      payee: find('memo', 'to', 'description', 'payee'),
      payer: find('payer', 'from') || undefined,
      category: find('category') || undefined,
    };
  }
}
