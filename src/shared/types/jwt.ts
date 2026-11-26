export interface JwtPayloadClaims {
  sub: number;
  prv?: string;
  iat?: number;
  exp?: number;
  pwd?: string;
}

export type AuthUserType = 'student' | 'institution_user';

export interface AuthenticatedUser {
  id: number;
  type: AuthUserType;
  role?: string;
  entity: unknown;
  session?: { digest: string; expiresAt: Date };
}

