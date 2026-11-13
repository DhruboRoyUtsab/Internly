import { createHash, randomBytes } from 'crypto';

export function randomToken(): string {
  return randomBytes(32).toString('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
