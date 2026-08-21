import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  Printer,
  Download,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Share2,
} from 'lucide-react';
import { generateTicketPdf } from '../utils/generateTicketPdf';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutResult = location.state?.result;
  const event = location.state?.event || checkoutResult?.tickets?.[0]?.event;

  const tickets = checkoutResult?.tickets || [];
  const reservationId = checkoutResult?.reservationId || 'PAS-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const totalAmount = checkoutResult?.totalAmount || 0;

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleDownloadAllPdfs = () => {
    tickets.forEach((t: any, i: number) => {
      setTimeout(() => {
        try {
          generateTicketPdf({
            ...t,
            event: event || t.event,
          });
        } catch (err) {
          console.error('Error generating PDF:', err);
        }
      }, i * 300);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Celebration Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pagamento Aprovado • Ingressos Emitidos
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pedido Confirmado com Sucesso!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Seu pedido <strong className="text-slate-800 font-mono">#{reservationId.slice(0, 8)}</strong> foi processado. Seus ingressos criptografados já estão ativos.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-3 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Comprar mais ingressos</span>
            </button>

            {tickets.length > 0 && (
              <button
                onClick={handleDownloadAllPdfs}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#2b55f5]" />
                <span>Imprimir / Baixar Todos em PDF</span>
              </button>
            )}

            <button
              onClick={() => navigate('/my-tickets')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#2b55f5]" />
              <span>Ver na Carteira Digital</span>
            </button>
          </div>
        </div>

        {/* Event Summary Card */}
        {event && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Evento Selecionado
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {event.title}
                </h3>
              </div>

              {event.category && (
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-[#2b55f5] border border-blue-200">
                  {event.category === 'MOVIE' ? 'Cinema' : event.category === 'CONCERT' ? 'Show' : 'Teatro'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <Calendar className="w-4 h-4 text-[#2b55f5] shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
          </div>
        )}

        {/* Issued Tickets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-slate-900">
              Seus Ingressos Emitidos ({tickets.length})
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total Pago: R$ {Number(totalAmount).toFixed(2)}
            </span>
          </div>

          <div className="space-y-3.5">
            {tickets.map((ticket: any, index: number) => {
              const isStudent = ticket.ticketType === 'MEIA_ESTUDANTE' || ticket.ticketType === 'ESTUDANTE';

              return (
                <div
                  key={ticket.id || index}
                  className="relative border-2 border-dashed border-slate-300 rounded-3xl bg-white p-5 sm:p-6 space-y-4 shadow-xs overflow-hidden"
                >
                  {/* Left & Right Notch Cutouts for Realistic Ticket Stub Look */}
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border-r border-slate-300" />
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border-l border-slate-300" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#2b55f5] tracking-wider uppercase">
                          {ticket.seat?.label ? `Poltrona ${ticket.seat.label}` : `Ingresso #${index + 1}`}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          • {ticket.ticketCode}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">
                        {event?.title || 'Ingresso Passfy'}
                      </h4>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black border ${
                        isStudent
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-[#2b55f5] border-blue-200'
                      }`}
                    >
                      {isStudent ? 'Estudante' : 'Inteira'}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block font-semibold">Titular do Ingresso</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {ticket.holderName || 'Titular da Conta'}
                      </span>
                    </div>

                    {isStudent && ticket.studentId && (
                      <div>
                        <span className="text-purple-600 text-[11px] block font-semibold">Carteira de Estudante</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {ticket.studentId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer with Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ativo para validação</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => generateTicketPdf({ ...ticket, event: event || ticket.event })}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#2b55f5]" />
                        <span>Imprimir em PDF</span>
                      </button>

                      {ticket.shareToken && (
                        <Link
                          to={`/ticket/${ticket.shareToken}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2b55f5] text-xs font-bold transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Link Público</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Back to Catalog Action */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-sm font-bold shadow-xs transition"
          >
            <span>Comprar mais ingressos no catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
