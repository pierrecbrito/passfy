import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  ArrowRight,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  selectedSeats: any[];
  quantity: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedSeats,
  quantity,
}) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('CREDIT_CARD');
  const [simulateStatus, setSimulateStatus] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [declineReason, setDeclineReason] = useState('INSUFFICIENT_FUNDS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!event) return null;

  const isSeated = event.type === 'SEATED';
  const totalTickets = isSeated ? selectedSeats.length : quantity;
  const unitPrice = Number(event.price);
  const totalAmount = unitPrice * totalTickets;

  const handleCheckout = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        eventId: event.id,
        seatIds: isSeated ? selectedSeats.map((s) => s.id) : [],
        quantity: isSeated ? undefined : quantity,
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
              Seus {successData.tickets?.length} ingresso(s) foram emitidos com QR Code criptografado único e já estão disponíveis na sua carteira digital.
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

          <div className="flex gap-3 pt-2">
            <button
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition flex items-center justify-center gap-2"
              onClick={handleFinish}
            >
              <Ticket className="w-5 h-5" />
              <span>Ver Meus Ingressos Digitais</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="text-slate-600 font-semibold">Valor Total:</span>
              <span className="text-xl font-black text-slate-900">
                R$ {totalAmount.toFixed(2)}
              </span>
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

          <div className="flex items-center justify-between gap-3 pt-2">
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
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-2 ${
                simulateStatus === 'APPROVED'
                  ? 'bg-[#2b55f5] hover:bg-[#1f44d6]'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <span>
                {simulateStatus === 'APPROVED'
                  ? `Confirmar Pagamento • R$ ${totalAmount.toFixed(2)}`
                  : 'Processar Recusa Simulada'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
