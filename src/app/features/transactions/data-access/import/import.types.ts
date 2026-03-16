export type ImportField = 'date' | 'amount' | 'payee' | 'payer' | 'owner' | 'category';

export interface ImportColumnMapping {
  date: string;
  amount: string;
  payee: string;
  payer?: string;
  owner?: string;
  category?: string;
}

export interface ImportRule {
  id: string;
  name: string;
  mapping: ImportColumnMapping;
  createdAt: string;
}
