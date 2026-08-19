import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import {
  MapPin,
  Share2,
  Check,
  Ticket,
  FileDown,
  Printer,
  Loader2,
} from 'lucide-react';
import { generateTicketPdf } from '../utils/generateTicketPdf';

interface TicketCardProps {
  ticket: any;
  isPublicView?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isPublicView = false }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const event = ticket.event;
  const isUsed = ticket.status === 'USED';
  const shareUrl = `${window.location.origin}/ticket/${ticket.shareToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`Link do ingresso: ${shareUrl}`);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateTicketPdf(ticket);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback to window.print if anything unexpected occurs
      window.print();
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="ticket-container max-w-md w-full mx-auto shadow-md bg-white border border-slate-200 transition-all hover:border-slate-300">
      {/* Ticket Top Banner */}
      <div className="relative h-32 overflow-hidden bg-slate-900">
        <img
          src={
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-900 shadow-xs">
            <Ticket className="w-3.5 h-3.5 text-[#2b55f5]" />
            <span>Passfy Pass</span>
          </div>

          <Badge variant={isUsed ? 'neutral' : 'success'} size="sm">
            {isUsed ? 'Utilizado na Portaria' : 'Ingresso Válido'}
          </Badge>
        </div>
      </div>

      {/* Main Info */}
      <div className="px-6 pt-3 pb-4 space-y-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{event.venue}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Data & Horário
            </span>
            <span className="text-slate-900 font-bold capitalize">{formattedDate}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Assento / Setor
            </span>
            <span className="text-[#2b55f5] font-black text-sm">
              {ticket.seat?.label ? `Poltrona ${ticket.seat.label}` : 'Pista Geral'}
            </span>
          </div>

          {/* Holder Name & Ticket Modality */}
          <div className="pt-2 border-t border-slate-200/60 col-span-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Titular do Ingresso
              </span>
              <span className="text-slate-900 font-bold">
                {ticket.holderName || ticket.user?.name || 'Cliente Passfy'}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  ticket.ticketType === 'MEIA_ESTUDANTE'
                    ? 'bg-purple-50 border border-purple-200 text-purple-700'
                    : 'bg-blue-50 border border-blue-200 text-[#2b55f5]'
                }`}
              >
                {ticket.ticketType === 'MEIA_ESTUDANTE' ? 'Meia Estudante' : 'Inteira'}
              </span>
              {ticket.studentId && (
                <span className="block text-[9px] font-mono text-slate-500 mt-0.5">
                  ID: {ticket.studentId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Divider Cutouts */}
      <div className="ticket-divider" />

      {/* QR Code & Validation Section */}
      <div className="px-6 pb-6 text-center space-y-4">
        <div className="inline-block p-4 rounded-2xl bg-white shadow-xs border-2 border-slate-200">
          {ticket.qrDataUrl ? (
            <img
              src={ticket.qrDataUrl}
              alt={`QR Code ${ticket.ticketCode}`}
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">
              Gerando QR Code...
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
            Código de Entrada
          </span>
          <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
            {ticket.ticketCode}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!isPublicView && (
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              title="Copiar link público do ingresso"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#2b55f5]" />
                  <span>Compartilhar</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Baixar Ingresso (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
