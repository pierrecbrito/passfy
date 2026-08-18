import { describe, it, expect, vi } from 'vitest';
import { CheckinService } from '../services/CheckinService';
import { CryptoProvider } from '../../../core/security/cryptoProvider';
import { prisma } from '../../../core/database/prisma';
import { TicketStatus } from '@prisma/client';

describe('Gatekeeper Check-in & Cryptographic QR Verification', () => {
  const gatekeeperId = 'gatekeeper-123';
  const targetEventId = 'event-111';
  const otherEventId = 'event-999';

  it('should authorize entrance (VALID) with valid cryptographic QR Code', async () => {
    const ticketId = 'ticket-valid-1';
    const { token: qrToken } = CryptoProvider.sign({
      ticketId,
      eventId: targetEventId,
      timestamp: Date.now(),
    });

    vi.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: targetEventId,
      title: 'Festival Duna 2',
      venue: 'Cinemark Sala 1',
      date: new Date(),
    } as any);

    vi.spyOn(prisma.ticket, 'findFirst').mockResolvedValue({
      id: ticketId,
      ticketCode: 'PAS-VALID',
      eventId: targetEventId,
      status: TicketStatus.ISSUED,
      user: { name: 'Ana Silva' },
      event: { id: targetEventId, title: 'Festival Duna 2', venue: 'Cinemark Sala 1' },
      seat: { label: 'B-4' },
      usedByGatekeeper: null,
    } as any);

    vi.spyOn(prisma.ticket, 'updateMany').mockResolvedValue({ count: 1 });

    const result = await CheckinService.validate(gatekeeperId, {
      eventId: targetEventId,
      qrToken,
    });

    expect(result.status).toBe('VALID');
    expect(result.message).toContain('Entrada autorizada');
    if (result.status === 'VALID') {
      expect(result.ticket.customerName).toBe('Ana Silva');
      expect(result.ticket.seatLabel).toBe('B-4');
    }
  });

  it('should reject already used ticket (ALREADY_USED)', async () => {
    const ticketId = 'ticket-used-1';
    const { token: qrToken } = CryptoProvider.sign({
      ticketId,
      eventId: targetEventId,
      timestamp: Date.now(),
    });

    vi.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: targetEventId,
      title: 'Festival Duna 2',
      venue: 'Cinemark Sala 1',
      date: new Date(),
    } as any);

    const pastDate = new Date(Date.now() - 3600000);

    vi.spyOn(prisma.ticket, 'findFirst').mockResolvedValue({
      id: ticketId,
      ticketCode: 'PAS-USED1',
      eventId: targetEventId,
      status: TicketStatus.USED,
      usedAt: pastDate,
      user: { name: 'Bruno Costa' },
      event: { id: targetEventId, title: 'Festival Duna 2', venue: 'Cinemark Sala 1' },
      seat: { label: 'C-2' },
      usedByGatekeeper: { name: 'Lucas Portaria' },
    } as any);

    const result = await CheckinService.validate(gatekeeperId, {
      eventId: targetEventId,
      qrToken,
    });

    expect(result.status).toBe('ALREADY_USED');
    expect(result.message).toContain('já foi utilizado');
  });

  it('should reject ticket for a different event (WRONG_EVENT)', async () => {
    const ticketId = 'ticket-wrong-1';
    const { token: qrToken } = CryptoProvider.sign({
      ticketId,
      eventId: otherEventId,
      timestamp: Date.now(),
    });

    vi.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: targetEventId,
      title: 'Festival Duna 2',
      venue: 'Cinemark Sala 1',
      date: new Date(),
    } as any);

    vi.spyOn(prisma.ticket, 'findFirst').mockResolvedValue({
      id: ticketId,
      ticketCode: 'PAS-WRONG',
      eventId: otherEventId, // Differs from targetEventId
      status: TicketStatus.ISSUED,
      user: { name: 'Carlos Santos' },
      event: { id: otherEventId, title: 'Rock World Festival', venue: 'Allianz Parque' },
      seat: null,
      usedByGatekeeper: null,
    } as any);

    const result = await CheckinService.validate(gatekeeperId, {
      eventId: targetEventId,
      qrToken,
    });

    expect(result.status).toBe('WRONG_EVENT');
    expect(result.message).toContain('Rock World Festival');
  });

  it('should reject forged or corrupted QR Code signature (INVALID)', async () => {
    vi.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: targetEventId,
      title: 'Festival Duna 2',
      venue: 'Cinemark Sala 1',
      date: new Date(),
    } as any);

    const tamperedQrToken = 'eyJ0aWNrZXRJZCI6ImZha2UifQ.fake_tampered_signature_12345';

    const result = await CheckinService.validate(gatekeeperId, {
      eventId: targetEventId,
      qrToken: tamperedQrToken,
    });

    expect(result.status).toBe('INVALID');
    expect(result.message).toContain('inválido');
  });
});
