import { PrismaClient, Role, EventCategory, EventType, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Passfy...');

  // 1. Clean existing records in reverse dependency order
  await prisma.ticket.deleteMany({});
  await prisma.reservationItem.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Hash default password
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 3. Create Seed Users
  const organizer = await prisma.user.create({
    data: {
      name: 'Carlos Organizador',
      email: 'organizador@passfy.com',
      password: defaultPasswordHash,
      role: Role.ORGANIZER,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Ana Silva (Cliente 1)',
      email: 'cliente1@passfy.com',
      password: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Bruno Costa (Cliente 2)',
      email: 'cliente2@passfy.com',
      password: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const gatekeeper = await prisma.user.create({
    data: {
      name: 'Lucas Portaria',
      email: 'portaria@passfy.com',
      password: defaultPasswordHash,
      role: Role.GATEKEEPER,
    },
  });

  console.log('👥 Created Users (Organizer, 2 Customers, Gatekeeper).');

  // 4. Create Event 1: Seated Cinema Event (Duna: Parte 2)
  const movieEvent = await prisma.event.create({
    data: {
      title: 'Duna: Parte 2 - Sessão Especial IMAX',
      description:
        'A jornada mítica de Paul Atreides ao lado de Chani e dos Fremen em busca de vingança. Sala IMAX com som Dolby Atmos de última geração.',
      category: EventCategory.MOVIE,
      type: EventType.SEATED,
      venue: 'Cinemark Shopping Iguatemi - Sala 1 (IMAX)',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      price: 45.0,
      capacity: 48,
      bannerUrl:
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      externalId: null,
      externalSource: null,
      organizerId: organizer.id,
    },
  });

  // Generate 48 seats for movie event (Rows A-F, Seats 1-8)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsData = [];
  for (const row of rows) {
    for (let num = 1; num <= 8; num++) {
      seatsData.push({
        eventId: movieEvent.id,
        row,
        number: num,
        label: `${row}-${num}`,
        isAvailable: true,
      });
    }
  }

  await prisma.seat.createMany({
    data: seatsData,
  });

  console.log('🎬 Created Cinema Event with 48 numbered seats.');

  // 5. Create Event 2: General Admission Concert (Rock World Festival)
  const concertEvent = await prisma.event.create({
    data: {
      title: 'Rock World Festival 2026',
      description:
        'O maior festival de rock do ano com as principais bandas internacionais reunidas em um único dia. Área de pista premium com visão privilegiada.',
      category: EventCategory.CONCERT,
      type: EventType.GENERAL_ADMISSION,
      venue: 'Allianz Parque - Pista Premium',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      price: 180.0,
      capacity: 500,
      bannerUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  console.log('🎸 Created Concert Event with 500 general admission capacity.');

  // 6. Create 1 pre-existing ticket for Customer 1 (Seat A-1) so Gatekeeper can test immediately
  const seatA1 = await prisma.seat.findFirst({
    where: { eventId: movieEvent.id, row: 'A', number: 1 },
  });

  if (seatA1) {
    // Mark seat as unavailable
    await prisma.seat.update({
      where: { id: seatA1.id },
      data: { isAvailable: false },
    });

    const ticketCode = 'PAS-DEMO1';
    const shareToken = crypto.randomUUID();
    const qrSecret = process.env.QR_SECRET_KEY || 'passfy_cryptographic_qr_signing_key_hmac_sha256_secret';

    const ticketId = crypto.randomUUID();
    const qrPayload = {
      ticketId,
      eventId: movieEvent.id,
      seatId: seatA1.id,
      timestamp: Date.now(),
    };

    const base64Data = Buffer.from(JSON.stringify(qrPayload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', qrSecret);
    hmac.update(base64Data);
    const qrSignature = hmac.digest('hex');
    const qrToken = `${base64Data}.${qrSignature}`;

    await prisma.ticket.create({
      data: {
        id: ticketId,
        ticketCode,
        qrToken,
        qrSignature,
        shareToken,
        status: TicketStatus.ISSUED,
        userId: customer1.id,
        eventId: movieEvent.id,
        seatId: seatA1.id,
      },
    });

    console.log(`🎟️ Created demo ticket (${ticketCode}) for ${customer1.name} on Seat A-1.`);
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n--- 📋 CREDENCIAIS DE TESTE ---');
  console.log('Organizador: organizador@passfy.com / password123');
  console.log('Cliente 1:   cliente1@passfy.com    / password123');
  console.log('Cliente 2:   cliente2@passfy.com    / password123');
  console.log('Portaria:    portaria@passfy.com    / password123');
  console.log('-------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
