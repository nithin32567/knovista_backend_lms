import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function passwordSessionProof(passwordHash: string, secret: string): string {
  return createHmac('sha256', secret).update('knovista:password-session:').update(passwordHash).digest('hex');
}

export function hasValidSessionProof(proof: unknown, passwordHash: string, secret: string): boolean {
  if (typeof proof !== 'string' || !/^[a-f0-9]{64}$/.test(proof)) return false;
  return timingSafeEqual(Buffer.from(proof, 'hex'), Buffer.from(passwordSessionProof(passwordHash, secret), 'hex'));
}

export function sessionTokenDigest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
