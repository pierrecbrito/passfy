import { jsPDF } from 'jspdf';

interface TicketData {
  id: string;
  ticketCode: string;
  qrDataUrl?: string;
  status: string;
  ticketType?: 'INTEIRA' | 'MEIA_ESTUDANTE' | string;
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
    title: string;
    venue: string;
    date: string;
    price: number;
    category?: string;
    description?: string;
  };
}

export function generateTicketPdf(ticket: TicketData): void {
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
  const cardHeight = 250;

  // Card Shadow & Card Body
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'FD');

  // ── CARD HEADER (Gradient/Solid Brand Navy) ──
  const headerHeight = 34;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(cardX, cardY, cardWidth, headerHeight, 6, 6, 'F');
  // Cover bottom round corners of header
  doc.rect(cardX, cardY + headerHeight - 4, cardWidth, 4, 'F');

  // Brand Logo Icon & Text
  doc.setFillColor(43, 85, 245);
  doc.roundedRect(cardX + 8, cardY + 7, 10, 10, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('P', cardX + 11.5, cardY + 14);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Passfy', cardX + 22, cardY + 14.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Ingresso Digital Criptografado Oficial', cardX + 22, cardY + 20);

  // Status Badge on Right
  const isUsed = ticket.status === 'USED';
  if (isUsed) {
    doc.setFillColor(245, 158, 11); // amber-500
    doc.roundedRect(cardX + cardWidth - 45, cardY + 9, 37, 7, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('JÁ UTILIZADO', cardX + cardWidth - 26.5, cardY + 14, { align: 'center' });
  } else {
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.roundedRect(cardX + cardWidth - 38, cardY + 9, 30, 7, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INGRESSO VÁLIDO', cardX + cardWidth - 23, cardY + 14, { align: 'center' });
  }

  // ── EVENT TITLE SECTION ──
  const titleY = cardY + headerHeight + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900

  // Split title if too long
  const titleLines = doc.splitTextToSize(ticket.event.title, cardWidth - 16);
  doc.text(titleLines, cardX + 8, titleY);

  const titleBlockHeight = titleLines.length * 7;

  // Category Tag
  const categoryName =
    ticket.event.category === 'MOVIE'
      ? 'Cinema & Filme'
      : ticket.event.category === 'CONCERT'
      ? 'Show & Concerto'
      : ticket.event.category === 'THEATER'
      ? 'Teatro & Espetáculo'
      : 'Evento Cultural';

  const categoryY = titleY + titleBlockHeight - 1;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 85, 245);
  doc.text(categoryName.toUpperCase(), cardX + 8, categoryY);

  // ── EVENT DETAILS GRID (LIGHT GREY BOX) ──
  const gridY = categoryY + 5;
  const gridHeight = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX + 8, gridY, cardWidth - 16, gridHeight, 4, 4, 'FD');

  const col1X = cardX + 14;
  const col2X = cardX + (cardWidth / 2) + 4;

  // Date Formatting
  const eventDateObj = new Date(ticket.event.date);
  const formattedDate = eventDateObj.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = eventDateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Row 1: Date & Seat
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('DATA & HORÁRIO', col1X, gridY + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formattedDate} às ${formattedTime}h`, col1X, gridY + 13.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SETOR / POLTRONA', col2X, gridY + 8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 85, 245);
  doc.text(ticket.seat?.label ? `Poltrona ${ticket.seat.label}` : 'Pista Geral / Livre', col2X, gridY + 13.5);

  // Divider inside grid
  doc.setDrawColor(226, 232, 240);
  doc.line(col1X, gridY + 19, cardX + cardWidth - 14, gridY + 19);

  // Row 2: Venue & Price
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LOCAL DO EVENTO', col1X, gridY + 26);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const venueLines = doc.splitTextToSize(ticket.event.venue, (cardWidth / 2) - 16);
  doc.text(venueLines, col1X, gridY + 31);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VALOR DO INGRESSO', col2X, gridY + 26);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const isStudent = ticket.ticketType === 'MEIA_ESTUDANTE';
  const finalPrice = isStudent ? Number(ticket.event.price) * 0.5 : Number(ticket.event.price);
  doc.text(
    finalPrice === 0 ? 'Gratuito' : `R$ ${finalPrice.toFixed(2)} (${isStudent ? 'Meia' : 'Inteira'})`,
    col2X,
    gridY + 31
  );

  // ── HOLDER & NOMINAL IDENTIFICATION BOX ──
  const holderY = gridY + gridHeight + 4;
  const holderHeight = 22;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(cardX + 8, holderY, cardWidth - 16, holderHeight, 3, 3, 'F');

  const holderName = ticket.holderName || ticket.user?.name || 'Cliente Passfy';
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TITULAR DO INGRESSO', col1X, holderY + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(holderName, col1X, holderY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('MODALIDADE', col2X, holderY + 7);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  if (isStudent) {
    doc.setTextColor(124, 58, 237); // violet-600
    doc.text('Meia Estudante', col2X, holderY + 13);
    if (ticket.studentId) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Doc: ${ticket.studentId}`, col2X, holderY + 18);
    }
  } else {
    doc.setTextColor(43, 85, 245);
    doc.text('Inteira Regular', col2X, holderY + 13);
  }

  // ── PERFORATED LINE CUTOUT ──
  const cutY = holderY + holderHeight + 8;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineDashPattern([2.5, 2], 0);
  doc.setLineWidth(0.5);
  doc.line(cardX + 4, cutY, cardX + cardWidth - 4, cutY);
  doc.setLineDashPattern([], 0); // reset line dash

  // Left & Right circular notch holes (ticket cut effect)
  doc.setFillColor(248, 250, 252);
  doc.circle(cardX, cutY, 4, 'F');
  doc.circle(cardX + cardWidth, cutY, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.circle(cardX, cutY, 4, 'S');
  doc.circle(cardX + cardWidth, cutY, 4, 'S');

  // ── QR CODE & VALIDATION SECTION ──
  const qrSectionY = cutY + 6;
  const qrSize = 48; // 48mm x 48mm
  const qrX = cardX + (cardWidth / 2) - (qrSize / 2);

  // QR Code Frame
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.roundedRect(qrX - 3, qrSectionY, qrSize + 6, qrSize + 6, 3, 3, 'FD');

  if (ticket.qrDataUrl) {
    try {
      doc.addImage(ticket.qrDataUrl, 'PNG', qrX, qrSectionY + 3, qrSize, qrSize);
    } catch {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('QR Code Disponível no App', qrX + qrSize / 2, qrSectionY + 25, { align: 'center' });
    }
  }

  // Ticket Alpha Code
  const codeY = qrSectionY + qrSize + 14;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CÓDIGO DE ENTRADA / PORTARIA', cardX + cardWidth / 2, codeY, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.ticketCode, cardX + cardWidth / 2, codeY + 6, { align: 'center' });

  // Security Token HMAC Badge
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(cardX + (cardWidth / 2) - 48, codeY + 9, 96, 6.5, 3, 3, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Criptografia HMAC-SHA256 • Validação Única', cardX + cardWidth / 2, codeY + 13.5, {
    align: 'center',
  });

  // ── INSTRUCTIONS & SECURITY FOOTER ──
  const footerY = cardY + cardHeight + 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const instructions = [
    '• Apresente este ingresso impresso ou na tela do seu smartphone diretamente na portaria do evento.',
    '• Obrigatória a apresentação de documento oficial com foto. Para ingressos de meia-entrada, apresente a carteirinha de estudante válida.',
    '• Cada QR Code permite 1 único acesso e é invalidado automaticamente após a leitura na portaria.',
  ];

  let lineOffset = 0;
  instructions.forEach((inst) => {
    doc.text(inst, margin + 4, footerY + lineOffset);
    lineOffset += 4.5;
  });

  // Emitted date & Doc ID
  doc.setFontSize(7);
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

  // Save PDF file with sanitize filename
  const cleanTitle = ticket.event.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 20);
  const fileName = `passfy_ingresso_${cleanTitle}_${ticket.ticketCode}.pdf`;
  doc.save(fileName);
}
