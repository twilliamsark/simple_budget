export interface Transaction {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  payee: string;
  payer?: string;
  cleared: boolean;
  tags: string[];
  memo?: string;
  importHash?: string;
  reconciledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionCreate = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export interface TransactionImportRow {
  date: string;
  amount: number;
  payee: string;
  payer?: string;
  categoryId?: string;
  categoryName?: string;
  importHash: string;
}
