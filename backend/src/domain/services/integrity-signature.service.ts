import { createHash } from 'crypto';

export function buildIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): string {
  const payload = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash('sha256').update(payload).digest('hex');
}
