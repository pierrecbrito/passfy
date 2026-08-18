import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import {
  Calendar,
  MapPin,
  Share2,
  Check,
  Download,
  Ticket,
  Printer,
  Sparkles,
} from 'lucide-react';

interface TicketCardProps {
  ticket: any;
  isPublicView?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isPublicView = false }) => {
  const [copied, setCopied] = useState(false);

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

  const handlePrint = () => {
    window.print();
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
    <div className="ticket-container max-w-md w-full mx-auto shadow-2xl bg-surface-100 border border-slate-800 transition-all hover:border-slate-700">
      {/* Ticket Top Banner */}
      <div className="relative h-32 overflow-hidden bg-slate-950">
        <img
          src={
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-surface-100/40 to-transparent" />

        <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-bold text-white">
            <Ticket className="w-3.5 h-3.5 text-brand-400" />
            <span>Passfy Pass</span>
          </div>

          <Badge variant={isUsed ? 'neutral' : 'success'} size="sm">
            {isUsed ? 'Utilizado na Portaria' : 'Ingresso Válido'}
          </Badge>
        </div>
      </div>

      {/* Main Info */}
      <div className="px-6 pt-2 pb-4 space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{event.venue}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-200/70 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Data & Horário
            </span>
            <span className="text-slate-200 font-bold capitalize">{formattedDate}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Assento / Setor
            </span>
            <span className="text-brand-400 font-extrabold text-sm">
              {ticket.seat?.label ? `Poltrona ${ticket.seat.label}` : 'Pista Geral'}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Divider Cutouts */}
      <div className="ticket-divider" />

      {/* QR Code & Validation Section */}
      <div className="px-6 pb-6 text-center space-y-4">
        <div className="inline-block p-4 rounded-2xl bg-white shadow-2xl border-4 border-slate-800">
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
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">
            Código de Entrada
          </span>
          <span className="text-lg font-mono font-black text-white tracking-wider">
            {ticket.ticketCode}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!isPublicView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleCopyLink}
              leftIcon={
                copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-brand-400" />
                )
              }
            >
              {copied ? 'Link Copiado!' : 'Compartilhar Link'}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            className={isPublicView ? 'w-full text-xs' : 'text-xs'}
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};
