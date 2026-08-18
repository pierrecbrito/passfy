import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  sub: string; // User ID
  name: string;
  email: string;
  role: 'ORGANIZER' | 'CUSTOMER' | 'GATEKEEPER';
}

export class JwtProvider {
  private static readonly EXPIRES_IN = '7d';

  static sign(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: this.EXPIRES_IN,
    });
  }

  static verify(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }
}
