import { describe, it, expect } from 'vitest';
import type { Account } from './account.model';

describe('Account model', () => {
  it('has required id and name', () => {
    const acc: Account = { id: 'acc-1', name: 'Checking', isInternal: true };
    expect(acc.id).toBe('acc-1');
    expect(acc.name).toBe('Checking');
    expect(acc.isInternal).toBe(true);
  });
});
