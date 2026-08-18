import crypto from 'crypto';
import { env } from '../config/env';

export interface QrPayload {
  ticketId: string;
  eventId: string;
  seatId?: string | null;
  timestamp: number;
}

export class CryptoProvider {
  static sign(payload: QrPayload): { token: string; signature: string } {
    const rawData = JSON.stringify(payload);
    const base64Data = Buffer.from(rawData).toString('base64url');

    const hmac = crypto.createHmac('sha256', env.QR_SECRET_KEY);
    hmac.update(base64Data);
    const signature = hmac.digest('hex');

    const token = `${base64Data}.${signature}`;
    return { token, signature };
  }

  static verify(token: string): { isValid: boolean; payload?: QrPayload } {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        return { isValid: false };
      }

      const [base64Data, providedSignature] = parts;

      const hmac = crypto.createHmac('sha256', env.QR_SECRET_KEY);
      hmac.update(base64Data);
      const expectedSignature = hmac.digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );

      if (!isSignatureValid) {
        return { isValid: false };
      }

      const rawData = Buffer.from(base64Data, 'base64url').toString('utf-8');
      const payload: QrPayload = JSON.parse(rawData);

      return { isValid: true, payload };
    } catch {
      return { isValid: false };
    }
  }

  static generateRandomCode(prefix = 'PAS', length = 5): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  }
}
