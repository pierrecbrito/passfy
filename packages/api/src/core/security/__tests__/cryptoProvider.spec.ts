import { describe, it, expect } from 'vitest';
import { CryptoProvider, QrPayload } from '../cryptoProvider';

describe('CryptoProvider HMAC-SHA256 Signing & Verification', () => {
  const samplePayload: QrPayload = {
    ticketId: '123e4567-e89b-12d3-a456-426614174000',
    eventId: '223e4567-e89b-12d3-a456-426614174001',
    seatId: '323e4567-e89b-12d3-a456-426614174002',
    holderName: 'João da Silva',
    ticketType: 'INTEIRA',
    timestamp: 1700000000000,
  };

  it('should sign and verify valid payload successfully', () => {
    const { token, signature } = CryptoProvider.sign(samplePayload);

    expect(token).toBeDefined();
    expect(signature).toBeDefined();
    expect(token).toContain('.');

    const verification = CryptoProvider.verify(token);
    expect(verification.isValid).toBe(true);
    expect(verification.payload).toBeDefined();
    expect(verification.payload?.ticketId).toBe(samplePayload.ticketId);
    expect(verification.payload?.eventId).toBe(samplePayload.eventId);
    expect(verification.payload?.holderName).toBe(samplePayload.holderName);
  });

  it('should reject token if payload was tampered with', () => {
    const { token } = CryptoProvider.sign(samplePayload);
    const [originalBase64, signature] = token.split('.');

    // Tamper with payload (e.g. change seatId)
    const decoded = JSON.parse(Buffer.from(originalBase64, 'base64url').toString('utf-8'));
    decoded.seatId = 'tampered-seat-id';
    const tamperedBase64 = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const tamperedToken = `${tamperedBase64}.${signature}`;
    const verification = CryptoProvider.verify(tamperedToken);

    expect(verification.isValid).toBe(false);
    expect(verification.payload).toBeUndefined();
  });

  it('should reject token if signature was forged or altered', () => {
    const { token } = CryptoProvider.sign(samplePayload);
    const [originalBase64] = token.split('.');

    const forgedSignature = 'a'.repeat(64);
    const forgedToken = `${originalBase64}.${forgedSignature}`;

    const verification = CryptoProvider.verify(forgedToken);
    expect(verification.isValid).toBe(false);
  });

  it('should reject malformed tokens without dot delimiter or with multiple dots', () => {
    expect(CryptoProvider.verify('malformedTokenWithoutDelimiter').isValid).toBe(false);
    expect(CryptoProvider.verify('part1.part2.part3').isValid).toBe(false);
    expect(CryptoProvider.verify('').isValid).toBe(false);
  });

  it('should generate formatted random codes with prefix', () => {
    const code1 = CryptoProvider.generateRandomCode('PAS', 5);
    const code2 = CryptoProvider.generateRandomCode('VIP', 6);

    expect(code1).toMatch(/^PAS-[A-Z2-9]{5}$/);
    expect(code2).toMatch(/^VIP-[A-Z2-9]{6}$/);
    expect(code1).not.toBe(code2);
  });
});
