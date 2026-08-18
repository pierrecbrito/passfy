import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { SeatMap, SeatItem } from '../components/SeatMap';
import { CheckoutModal } from '../components/CheckoutModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  MapPin,
  Ticket,
  Film,
  Music,
  Drama,
  Users,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [selectedSeats, setSelectedSeats] = useState<SeatItem[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadEventDetails() {
      setIsLoading(true);
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.event);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Evento não encontrado.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) loadEventDetails();
  }, [id]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (!seat.isAvailable) return;

    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((s) => s.id === seat.id);
      if (isAlreadySelected) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 6) {
          alert('Você pode selecionar no máximo 6 assentos por compra.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Carregando detalhes da sessão...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Evento não encontrado</h2>
        <p className="text-sm text-slate-400">{error || 'O evento que você procura não existe.'}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Voltar para Início
        </Button>
      </div>
    );
  }

  const isSeated = event.type === 'SEATED';
  const totalSelectedTickets = isSeated ? selectedSeats.length : quantity;
  const subtotal = Number(event.price) * totalSelectedTickets;
  const isSoldOut = event.availableCapacity <= 0;

  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen pb-32">
      {/* Event Banner Hero */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-950">
        <img
          src={
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="self-start bg-slate-900/60 backdrop-blur-md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar aos Eventos
          </Button>

          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">
                {event.category === 'MOVIE'
                  ? 'Cinema'
                  : event.category === 'CONCERT'
                  ? 'Show'
                  : 'Teatro'}
              </Badge>
              <Badge variant="neutral">
                {isSeated ? 'Mapa de Assentos Numerados' : 'Pista Geral'}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Details & Seat Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & Seat Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info Card */}
            <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-white">Sobre o Evento</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Data e Horário</p>
                    <p className="text-slate-200 font-medium capitalize">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Local</p>
                    <p className="text-slate-200 font-medium">{event.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Area: Seat Map or General Admission Stepper */}
            {isSeated ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Selecione suas Poltronas
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedSeats.length} de 6 assentos selecionados
                  </p>
                </div>

                <SeatMap
                  seats={event.seats || []}
                  selectedSeatIds={selectedSeats.map((s) => s.id)}
                  onToggleSeat={handleToggleSeat}
                  maxSelection={6}
                />
              </div>
            ) : (
              <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Quantidade de Ingressos de Pista
                </h2>
                <p className="text-sm text-slate-400">
                  Ingressos com acesso à área de pista geral do evento.
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-surface-200 border border-slate-700 rounded-2xl p-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-lg text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 10 || quantity >= event.availableCapacity}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Preço por ingresso</p>
                    <p className="text-lg font-bold text-white">
                      R$ {Number(event.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Sticky Card */}
          <div className="space-y-6">
            <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sticky top-24 space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Resumo da Reserva
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Preço Unitário:</span>
                  <span className="text-white font-semibold">
                    R$ {Number(event.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Ingressos:</span>
                  <span className="text-white font-semibold">{totalSelectedTickets}</span>
                </div>

                {isSeated && selectedSeats.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-slate-400 mb-2">Poltronas Selecionadas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[11px] font-bold"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Total a Pagar:</span>
                <span className="text-2xl font-black text-white">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>

              <Button
                variant={isSoldOut || totalSelectedTickets === 0 ? 'secondary' : 'primary'}
                size="lg"
                className="w-full"
                disabled={isSoldOut || totalSelectedTickets === 0}
                onClick={handleProceedToCheckout}
              >
                {isSoldOut
                  ? 'Evento Esgotado'
                  : totalSelectedTickets === 0
                  ? isSeated
                    ? 'Selecione um Assento'
                    : 'Selecione a Quantidade'
                  : `Comprar (${totalSelectedTickets})`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Simulação 100% segura e instantânea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        event={event}
        selectedSeats={selectedSeats}
        quantity={quantity}
      />
    </div>
  );
};
