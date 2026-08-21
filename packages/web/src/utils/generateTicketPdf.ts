import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface TicketData {
  id: string;
  ticketCode: string;
  qrDataUrl?: string;
  qrToken?: string;
  qrSignature?: string;
  shareToken?: string;
  status?: string;
  ticketType?: 'INTEIRA' | 'MEIA_ESTUDANTE' | 'ESTUDANTE' | string;
  holderName?: string;
  studentId?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
  seat?: {
    label?: string;
    row?: string;
    number?: number;
  };
  event: {
    id?: string;
    title: string;
    venue: string;
    date: string;
    price: number;
    category?: string;
    description?: string;
  };
}

export async function generateTicketPdf(ticket: TicketData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  // Background color subtle pattern
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.rect(0, 0, 210, 297, 'F');

  // Top Accent Bar
  doc.setFillColor(43, 85, 245); // #2b55f5
  doc.rect(0, 0, 210, 6, 'F');

  // ── MAIN VOUCHER CONTAINER ──
  const cardX = margin;
  const cardY = 16;
  const cardWidth = contentWidth;
  const cardHeight = 236;

  // Card Shadow & Card Body
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'FD');

  // ── CARD HEADER (Compact & Elegant Brand Navy) ──
  const headerHeight = 20;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(cardX, cardY, cardWidth, headerHeight, 6, 6, 'F');
  // Cover bottom round corners of header
  doc.rect(cardX, cardY + headerHeight - 4, cardWidth, 4, 'F');

  // Brand Logo Icon & Text
  doc.setFillColor(43, 85, 245);
  doc.roundedRect(cardX + 8, cardY + 5, 10, 10, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('P', cardX + 11.5, cardY + 12);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Passfy', cardX + 21, cardY + 11.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Ingresso Digital Criptografado Oficial', cardX + 21, cardY + 16.5);

  // ── EVENT TITLE SECTION ──
  const titleY = cardY + headerHeight + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42); // slate-900

  // Split title if too long
  const titleLines = doc.splitTextToSize(ticket.event.title, cardWidth - 16);
  doc.text(titleLines, cardX + 8, titleY);

  const titleBlockHeight = titleLines.length * 6.5;

  // Category Tag
  const categoryName =
    ticket.event.category === 'MOVIE'
      ? 'Cinema & Filme'
      : ticket.event.category === 'CONCERT'
      ? 'Show & Concerto'
      : ticket.event.category === 'THEATER'
      ? 'Teatro & Espetáculo'
      : 'Evento Cultural';

  const categoryY = titleY + titleBlockHeight;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 85, 245);
  doc.text(categoryName.toUpperCase(), cardX + 8, categoryY);

  // ── EVENT DETAILS GRID (LIGHT GREY BOX) ──
  const gridY = categoryY + 4;
  const gridHeight = 42;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX + 8, gridY, cardWidth - 16, gridHeight, 4, 4, 'FD');

  const col1X = cardX + 14;
  const col2X = cardX + 94;

  // Data e Horário
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('DATA E HORÁRIO', col1X, gridY + 8);

  const eventDate = new Date(ticket.event.date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(formattedDate, col1X, gridY + 14.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(43, 85, 245);
  doc.text(`Início às ${formattedTime}h`, col1X, gridY + 19.5);

  // Local / Espaço
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LOCAL DO EVENTO', col2X, gridY + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const venueLines = doc.splitTextToSize(ticket.event.venue, cardWidth - 100);
  doc.text(venueLines, col2X, gridY + 14.5);

  // Setor / Poltrona
  const seatInfoY = gridY + 28;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SETOR / ASSENTO', col1X, seatInfoY);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const seatText = ticket.seat?.label ? `Poltrona ${ticket.seat.label}` : 'Pista Geral';
  doc.text(seatText, col1X, seatInfoY + 6);

  // Valor Pago
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VALOR', col2X, seatInfoY);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const isStudent =
    ticket.ticketType === 'MEIA_ESTUDANTE' || ticket.ticketType === 'ESTUDANTE';
  const finalPrice = isStudent ? Number(ticket.event.price) * 0.5 : Number(ticket.event.price);
  doc.text(`R$ ${finalPrice.toFixed(2)}`, col2X, seatInfoY + 6);

  // ── HOLDER & TICKET MODALITY ──
  const holderY = gridY + gridHeight + 6;
  const holderHeight = 21;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(cardX + 8, holderY, cardWidth - 16, holderHeight, 3, 3, 'F');

  const holderName = ticket.holderName || ticket.user?.name || 'Cliente Passfy';
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TITULAR DO INGRESSO', col1X, holderY + 6.5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(holderName, col1X, holderY + 13.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('MODALIDADE', col2X, holderY + 6.5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  if (isStudent) {
    doc.setTextColor(124, 58, 237); // violet-600
    doc.text('Estudante', col2X, holderY + 12.5);
    if (ticket.studentId) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Doc: ${ticket.studentId}`, col2X, holderY + 17);
    }
  } else {
    doc.setTextColor(43, 85, 245);
    doc.text('Inteira', col2X, holderY + 12.5);
  }

  // ── PERFORATED LINE CUTOUT ──
  const cutY = holderY + holderHeight + 7;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineDashPattern([2.5, 2], 0);
  doc.setLineWidth(0.5);
  doc.line(cardX + 4, cutY, cardX + cardWidth - 4, cutY);
  doc.setLineDashPattern([], 0);

  // Left & Right circular notch holes
  doc.setFillColor(248, 250, 252);
  doc.circle(cardX, cutY, 4, 'F');
  doc.circle(cardX + cardWidth, cutY, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.circle(cardX, cutY, 4, 'S');
  doc.circle(cardX + cardWidth, cutY, 4, 'S');

  // ── QR CODE & VALIDATION SECTION ──
  const qrSectionY = cutY + 5;
  const qrSize = 46; // 46mm x 46mm
  const qrX = cardX + cardWidth / 2 - qrSize / 2;

  // QR Code Frame
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.roundedRect(qrX - 3, qrSectionY, qrSize + 6, qrSize + 6, 3, 3, 'FD');

  // Generate QR Code Data URL if not already present
  let qrImageSrc = ticket.qrDataUrl;
  if (!qrImageSrc) {
    const qrPayload = JSON.stringify({
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      eventId: ticket.event?.id,
      holderName: ticket.holderName,
      ticketType: ticket.ticketType,
      signature: ticket.qrSignature || ticket.qrToken || ticket.ticketCode,
    });
    try {
      qrImageSrc = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('Error generating QR code data URL for PDF:', e);
    }
  }

  if (qrImageSrc) {
    try {
      doc.addImage(qrImageSrc, 'PNG', qrX, qrSectionY + 3, qrSize, qrSize);
    } catch (err) {
      console.error('Failed to add QR Code image to PDF:', err);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('QR Code Disponível no App', qrX + qrSize / 2, qrSectionY + 23, { align: 'center' });
    }
  }

  // Ticket Alpha Code
  const codeY = qrSectionY + qrSize + 13;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CÓDIGO DE ENTRADA / PORTARIA', cardX + cardWidth / 2, codeY, { align: 'center' });

  doc.setFontSize(15);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.ticketCode, cardX + cardWidth / 2, codeY + 6, { align: 'center' });

  // ── SECURITY TOKEN HMAC BADGE ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const badgeText = 'Criptografia HMAC-SHA256 • Validação Única';
  const textWidth = doc.getTextWidth(badgeText);
  const badgeBoxWidth = textWidth + 14;
  const badgeBoxX = cardX + cardWidth / 2 - badgeBoxWidth / 2;
  const badgeBoxY = codeY + 9;

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.setLineWidth(0.4);
  doc.roundedRect(badgeBoxX, badgeBoxY, badgeBoxWidth, 7, 3.5, 3.5, 'FD');

  doc.setTextColor(5, 150, 105); // emerald-700
  doc.text(badgeText, cardX + cardWidth / 2, badgeBoxY + 4.8, {
    align: 'center',
  });

  // ── INSTRUCTIONS & SECURITY FOOTER ──
  const footerY = cardY + cardHeight + 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const instructions = [
    '• Apresente este ingresso impresso ou na tela do seu smartphone diretamente na portaria do evento.',
    '• Obrigatória a apresentação de documento oficial com foto. Para estudantes, apresente carteirinha válida.',
    '• Cada QR Code permite 1 único acesso e é invalidado automaticamente após a leitura na portaria.',
  ];

  let lineOffset = 0;
  instructions.forEach((inst) => {
    doc.text(inst, margin + 4, footerY + lineOffset);
    lineOffset += 4;
  });

  // Emitted date & Doc ID
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(
    `Emitido via Plataforma Passfy em ${now} • Token: ${ticket.id.slice(0, 14)}...`,
    pageWidth / 2,
    290,
    { align: 'center' }
  );

  // Save PDF file with sanitized filename
  const cleanTitle = ticket.event.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 20);
  const fileName = `passfy_ingresso_${cleanTitle}_${ticket.ticketCode}.pdf`;
  doc.save(fileName);
}
