export function computeImportHash(
  date: string,
  amount: number,
  payee: string
): string {
  const normalized = `${date}|${amount}|${payee.trim().toLowerCase()}`;
  return btoa(normalized);
}
