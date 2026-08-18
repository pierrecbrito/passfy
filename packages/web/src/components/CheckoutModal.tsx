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
  ShieldCheck,
  Sparkles,
  Ticket,
  Lock,
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
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-in zoom-in-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">
              Pagamento Aprovado com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Seus {successData.tickets?.length} ingresso(s) foram emitidos com QR Code criptografado único e já estão disponíveis na sua carteira.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-200/80 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Evento:</span>
              <strong className="text-white">{event.title}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Pago:</span>
              <strong className="text-emerald-400 font-bold">
                R$ {Number(successData.totalAmount).toFixed(2)}
              </strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Método:</span>
              <strong className="text-slate-200 uppercase">{paymentMethod}</strong>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleFinish}
              leftIcon={<Ticket className="w-5 h-5" />}
            >
              Ver Meus Ingressos Digitais
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-surface-200/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{event.title}</h4>
                <p className="text-xs text-slate-400">{event.venue}</p>
              </div>
              <Badge variant="primary">
                {totalTickets} {totalTickets === 1 ? 'ingresso' : 'ingressos'}
              </Badge>
            </div>

            {isSeated && selectedSeats.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">Assentos:</span>
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-md bg-brand-600/30 text-brand-300 font-bold text-[11px] border border-brand-500/30"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
              <span className="text-slate-300 font-medium">Valor Total:</span>
              <span className="text-xl font-black text-white">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Forma de Pagamento Simulado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow'
                    : 'bg-surface-200 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-400" />
                <div className="text-left text-xs font-bold">Cartão de Crédito</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                  paymentMethod === 'PIX'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-glow-emerald'
                    : 'bg-surface-200 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <div className="text-left text-xs font-bold">Pix Instantâneo</div>
              </button>
            </div>
          </div>

          {/* Simulation Playground Controls */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-indigo-200">
                  Simulador de Cenários (Avaliação)
                </span>
              </div>
              <span className="text-[10px] text-indigo-300">Alternar Resposta do Gateway</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSimulateStatus('APPROVED')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  simulateStatus === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald'
                    : 'bg-surface-200 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ✅ Forçar Aprovação
              </button>

              <button
                type="button"
                onClick={() => setSimulateStatus('DECLINED')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  simulateStatus === 'DECLINED'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-glow-rose'
                    : 'bg-surface-200 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ❌ Simular Recusa
              </button>
            </div>

            {simulateStatus === 'DECLINED' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Motivo da Recusa:
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-200 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant={simulateStatus === 'APPROVED' ? 'success' : 'danger'}
              size="lg"
              className="flex-1"
              isLoading={isLoading}
              onClick={handleCheckout}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {simulateStatus === 'APPROVED'
                ? `Confirmar Pagamento • R$ ${totalAmount.toFixed(2)}`
                : 'Processar Recusa Simulada'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
