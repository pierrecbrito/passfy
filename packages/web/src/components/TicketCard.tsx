import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import {
  MapPin,
  Share2,
  Check,
  Ticket,
  FileDown,
  Loader2,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Shield,
} from 'lucide-react';

import { generateTicketPdf } from '../utils/generateTicketPdf';
import { api } from '../services/api';

interface TicketCardProps {
  ticket: any;
  isPublicView?: boolean;
  onTicketReturned?: (updatedTicket: any) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isPublicView = false,
  onTicketReturned,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  const event = ticket.event;
  const isUsed = ticket.status === 'USED';
  const isCancelled = ticket.status === 'CANCELLED';
  const isIssued = ticket.status === 'ISSUED';
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
      window.print();
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  const handleReturnTicket = async () => {
    setIsReturning(true);
    setReturnError(null);
    try {
      const response = await api.post(`/tickets/${ticket.id}/return`);
      setShowReturnConfirm(false);
      if (onTicketReturned) {
        onTicketReturned(response.data.ticket);
      }
    } catch (err: any) {
      setReturnError(
        err.response?.data?.message || 'Erro ao devolver o ingresso ao estoque.'
      );
    } finally {
      setIsReturning(false);
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
    <div className={`ticket-container max-w-md w-full mx-auto shadow-md bg-white border transition-all ${
      isCancelled ? 'border-rose-200 opacity-80' : 'border-slate-200 hover:border-slate-300'
    }`}>
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

          <Badge
            variant={
              isCancelled
                ? 'danger'
                : isUsed
                ? 'neutral'
                : 'success'
            }
            size="sm"
          >
            {isCancelled
              ? 'Devolvido ao Estoque'
              : isUsed
              ? 'Utilizado na Portaria'
              : 'Ingresso Válido'}
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
                {ticket.ticketType === 'MEIA_ESTUDANTE' ? 'Estudante' : 'Inteira'}
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
        {isPublicView ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border-2 border-dashed border-blue-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 border border-blue-300 text-[#2b55f5] flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-6 h-6 text-[#2b55f5]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Ingresso Digital Autêntico
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed max-w-xs mx-auto">
                Este link público valida a autenticidade da compra. O <strong>QR Code oficial de acesso à portaria</strong> é exclusivo do titular e fica protegido na sua conta pessoal.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Status: {isCancelled ? 'Cancelado' : isUsed ? 'Utilizado' : 'Válido & Confirmado'}</span>
            </div>
          </div>
        ) : (
          <div className="relative inline-block p-4 rounded-2xl bg-white shadow-xs border-2 border-slate-200">
            {ticket.qrDataUrl ? (
              <img
                src={ticket.qrDataUrl}
                alt={`QR Code ${ticket.ticketCode}`}
                className={`w-48 h-48 mx-auto ${isCancelled ? 'grayscale opacity-30' : ''}`}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">
                Gerando QR Code...
              </div>
            )}

            {isCancelled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[2px] rounded-2xl p-4 text-center">
                <XCircle className="w-8 h-8 text-rose-500 mb-1" />
                <p className="text-xs font-black text-rose-600">INGRESSO CANCELADO</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Vaga liberada de volta ao estoque
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
            Código de Entrada
          </span>
          <span className={`text-lg font-mono font-black tracking-wider ${
            isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
          }`}>
            {ticket.ticketCode}
          </span>
        </div>

        {/* Action Buttons */}
        {!isCancelled && !isPublicView ? (
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
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


            {/* Devolução ao Estoque pelo Cliente */}
            {!isPublicView && isIssued && (
              <div>
                {!showReturnConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowReturnConfirm(true)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                    <span>Devolver ao Estoque</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          Devolver ingresso ao estoque?
                        </p>
                        <p className="text-[11px] text-rose-700 font-medium">
                          {ticket.seat?.label
                            ? `A Poltrona ${ticket.seat.label} será liberada imediatamente para outros compradores.`
                            : 'O ingresso será cancelado e a vaga voltará à disponibilidade.'}
                        </p>
                      </div>
                    </div>

                    {returnError && (
                      <p className="text-[11px] font-bold text-rose-800 bg-white/80 p-1.5 rounded-lg border border-rose-200">
                        {returnError}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isReturning}
                        onClick={handleReturnTicket}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {isReturning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Devolvendo...</span>
                          </>
                        ) : (
                          <span>Sim, Devolver</span>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isReturning}
                        onClick={() => {
                          setShowReturnConfirm(false);
                          setReturnError(null);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
            Ingresso devolvido ao estoque do evento.
          </div>
        )}
      </div>
    </div>
  );
};
