import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Modal } from './ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  ArrowRight,
  User,
  GraduationCap,
  FileBadge,
  Info,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  selectedSeats: any[];
  quantity: number;
}

interface AttendeeFormData {
  seatId?: string;
  seatLabel?: string;
  name: string;
  ticketType: 'INTEIRA' | 'MEIA_ESTUDANTE';
  studentIdNumber: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedSeats,
  quantity,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('CREDIT_CARD');
  const [simulateStatus, setSimulateStatus] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [declineReason, setDeclineReason] = useState('INSUFFICIENT_FUNDS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const [attendees, setAttendees] = useState<AttendeeFormData[]>([]);

  const isSeated = event?.type === 'SEATED';
  const totalTickets = isSeated ? selectedSeats.length : quantity;
  const isCinema = event?.category === 'MOVIE';

  // Initialize or synchronize attendee forms when seats or quantity change
  useEffect(() => {
    if (!isOpen || !event) return;

    if (isSeated) {
      setAttendees(
        selectedSeats.map((seat, index) => ({
          seatId: seat.id,
          seatLabel: seat.label,
          name: index === 0 && user?.name ? user.name : '',
          ticketType: 'INTEIRA',
          studentIdNumber: '',
        }))
      );
    } else {
      setAttendees(
        Array.from({ length: quantity }).map((_, index) => ({
          name: index === 0 && user?.name ? user.name : '',
          ticketType: 'INTEIRA',
          studentIdNumber: '',
        }))
      );
    }
  }, [isOpen, selectedSeats, quantity, isSeated, event, user]);

  if (!event) return null;

  const unitPrice = Number(event.price);

  // Compute total dynamically based on Inteira vs Meia-Entrada
  const totalAmount = attendees.reduce((acc, curr) => {
    const itemPrice = curr.ticketType === 'MEIA_ESTUDANTE' ? unitPrice * 0.5 : unitPrice;
    return acc + itemPrice;
  }, 0);

  const handleUpdateAttendee = (index: number, field: keyof AttendeeFormData, value: string) => {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCheckout = async () => {
    setError(null);

    // Validate student ID for half-price tickets
    if (isCinema || attendees.some((a) => a.ticketType === 'MEIA_ESTUDANTE')) {
      for (let i = 0; i < attendees.length; i++) {
        const att = attendees[i];
        const label = att.seatLabel ? `Poltrona ${att.seatLabel}` : `Ingresso ${i + 1}`;

        if (!att.name.trim()) {
          setError(`Por favor, informe o nome do titular do ${label}.`);
          return;
        }

        if (att.ticketType === 'MEIA_ESTUDANTE' && !att.studentIdNumber.trim()) {
          setError(`Informe o número da carteirinha de estudante para o ${label}.`);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        eventId: event.id,
        seatIds: isSeated ? selectedSeats.map((s) => s.id) : [],
        quantity: isSeated ? undefined : quantity,
        attendees: attendees.map((a) => ({
          seatId: a.seatId,
          name: a.name.trim(),
          ticketType: a.ticketType,
          studentIdNumber: a.ticketType === 'MEIA_ESTUDANTE' ? a.studentIdNumber.trim() : undefined,
        })),
        paymentMethod,
        simulateStatus,
        declineReason: simulateStatus === 'DECLINED' ? declineReason : undefined,
      };

      const response = await api.post('/checkout/simulate', payload);

      if (response.data.status === 'APPROVED') {
        setSuccessData(response.data);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Construct Google Calendar Scheduling Link & Open in a New Tab
        try {
          const startDate = new Date(event.date);
          const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
          const formatUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
          const calendarParams = new URLSearchParams({
            action: 'TEMPLATE',
            text: `Ingresso Passfy: ${event.title}`,
            dates: `${formatUTC(startDate)}/${formatUTC(endDate)}`,
            details: `Seu ingresso para o evento "${event.title}" está confirmado!\nLocal: ${event.venue}\n\nAcesse sua carteira digital Passfy para visualizar o QR Code criptografado.`,
            location: event.venue,
          });
          const googleCalendarUrl = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;
          window.open(googleCalendarUrl, '_blank');
        } catch (calErr) {
          console.warn('Could not auto-open Google Calendar:', calErr);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Ocorreu uma falha no processamento da transação simulada.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGoogleCalendar = () => {
    if (!event) return;
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    const formatUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const calendarParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Ingresso Passfy: ${event.title}`,
      dates: `${formatUTC(startDate)}/${formatUTC(endDate)}`,
      details: `Seu ingresso para o evento "${event.title}" está confirmado!\nLocal: ${event.venue}\n\nAcesse sua carteira digital Passfy para visualizar o QR Code criptografado.`,
      location: event.venue,
    });
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const handleFinish = () => {
    onClose();
    navigate('/my-tickets');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={successData ? 'Compra Confirmada!' : 'Finalizar Pedido Simulado'}
      maxWidth="lg"
    >
      {successData ? (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in-50 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">
              Pagamento Aprovado com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Seus {successData.tickets?.length} ingresso(s) foram emitidos nominalmente com QR Code criptografado único e já estão disponíveis na sua carteira digital.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Evento:</span>
              <strong className="text-slate-900 font-bold">{event.title}</strong>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Total Pago:</span>
              <strong className="text-emerald-700 font-black text-sm">
                R$ {Number(successData.totalAmount).toFixed(2)}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Método:</span>
              <strong className="text-slate-800 font-bold uppercase">{paymentMethod}</strong>
            </div>
          </div>

          {/* Google Calendar Notification Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Agendado no Google Agenda</p>
                <p className="text-[11px] text-slate-500 font-medium">Uma nova aba foi aberta para você salvar o evento</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenGoogleCalendar}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-[#2b55f5] text-xs font-bold hover:bg-blue-50 transition shrink-0 shadow-xs flex items-center gap-1"
            >
              <span>Reabrir</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.98]"
              onClick={handleFinish}
            >
              <Ticket className="w-5 h-5" />
              <span>Ver Meus Ingressos Digitais</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary Header */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{event.venue}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#2b55f5] border border-blue-200">
                {totalTickets} {totalTickets === 1 ? 'ingresso' : 'ingressos'}
              </span>
            </div>

            {isSeated && selectedSeats.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Assentos:</span>
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-md bg-white text-slate-800 font-bold text-[11px] border border-slate-300 shadow-xs"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ATTENDEE & CINEMA STUDENT IDENTIFICATION SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#2b55f5]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isCinema ? 'Identificação dos Espectadores & Meia-Entrada' : 'Titulares dos Ingressos'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {isCinema ? 'Meia-Entrada 50% Estudante' : 'Ingressos Nominais'}
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {attendees.map((attendee, index) => {
                const label = attendee.seatLabel ? `Poltrona ${attendee.seatLabel}` : `Ingresso ${index + 1}`;
                const isStudent = attendee.ticketType === 'MEIA_ESTUDANTE';

                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-[#2b55f5]" />
                        <span>{label}</span>
                      </span>

                      {/* Modalidade Selector */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleUpdateAttendee(index, 'ticketType', 'INTEIRA')}
                          className={`px-2.5 py-1 rounded-lg transition ${
                            !isStudent
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Inteira (R$ {unitPrice.toFixed(2)})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateAttendee(index, 'ticketType', 'MEIA_ESTUDANTE')}
                          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                            isStudent
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <GraduationCap className="w-3 h-3" />
                          <span>Meia Estudante (R$ {(unitPrice * 0.5).toFixed(2)})</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nome Completo do Titular *
                        </label>
                        <input
                          type="text"
                          required
                          value={attendee.name}
                          onChange={(e) => handleUpdateAttendee(index, 'name', e.target.value)}
                          placeholder="Nome de quem vai usar o ingresso"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                      </div>

                      {isStudent && (
                        <div className="animate-in fade-in">
                          <label className="block text-[11px] font-bold text-purple-900 mb-1 flex items-center gap-1">
                            <FileBadge className="w-3.5 h-3.5 text-purple-700" />
                            <span>Nº Carteirinha de Estudante (CIE/DNE) *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={attendee.studentIdNumber}
                            onChange={(e) => handleUpdateAttendee(index, 'studentIdNumber', e.target.value)}
                            placeholder="Ex: CIE-98421039"
                            className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-purple-50/50 text-xs font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                          />
                        </div>
                      )}
                    </div>

                    {isStudent && (
                      <p className="text-[10px] text-purple-700 font-medium flex items-center gap-1 pt-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Apresentação da carteirinha estudantil oficial obrigatória na portaria.</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Forma de Pagamento Simulado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition shadow-xs ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-blue-50 border-blue-400 text-slate-900 ring-2 ring-blue-100'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#2b55f5]" />
                <div className="text-left text-xs font-bold">Cartão de Crédito</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition shadow-xs ${
                  paymentMethod === 'PIX'
                    ? 'bg-emerald-50 border-emerald-400 text-slate-900 ring-2 ring-emerald-100'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <div className="text-left text-xs font-bold">Pix Instantâneo</div>
              </button>
            </div>
          </div>

          {/* Simulation Playground Controls */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900">
                  Simulador de Cenários (Avaliação)
                </span>
              </div>
              <span className="text-[10px] text-blue-700 font-semibold">Alternar Resposta do Gateway</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSimulateStatus('APPROVED')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  simulateStatus === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ✅ Forçar Aprovação
              </button>

              <button
                type="button"
                onClick={() => setSimulateStatus('DECLINED')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  simulateStatus === 'DECLINED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ❌ Simular Recusa
              </button>
            </div>

            {simulateStatus === 'DECLINED' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Motivo da Recusa:
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs font-medium"
                >
                  <option value="INSUFFICIENT_FUNDS">Saldo ou Limite Insuficiente</option>
                  <option value="CARD_BLOCKED">Cartão Bloqueado pelo Banco</option>
                  <option value="EXPIRED_CARD">Cartão Expirado</option>
                  <option value="FRAUD_SUSPICION">Suspeita de Fraude</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Total & Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total a Pagar:</span>
              <span className="text-2xl font-black text-slate-900">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                Cancelar
              </button>
              <button
                disabled={isLoading}
                onClick={handleCheckout}
                className={`py-3 px-5 rounded-xl text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-2 ${
                  simulateStatus === 'APPROVED'
                    ? 'bg-[#2b55f5] hover:bg-[#1f44d6]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <span>
                  {simulateStatus === 'APPROVED'
                    ? `Pagar R$ ${totalAmount.toFixed(2)}`
                    : 'Processar Recusa Simulada'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
