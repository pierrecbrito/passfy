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
  Shield,
  ArrowLeft,
  Plus,
  Minus,
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
      <div className="max-w-5xl mx-auto px-4 py-20 text-center bg-white">
        <div className="w-10 h-10 border-3 border-[#2b55f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Carregando detalhes do evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-slate-900">Evento não encontrado</h2>
        <p className="text-sm text-slate-500">{error || 'O evento que você procura não existe.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-[#2b55f5] text-white text-sm font-bold"
        >
          Voltar para Início
        </button>
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
    <div className="min-h-screen bg-white pb-32">
      {/* Event Banner Hero */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
        <img
          src={
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6 relative z-10">
          <button
            onClick={() => navigate('/')}
            className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-xs hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Eventos</span>
          </button>

          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#2b55f5] text-white shadow-xs">
                {event.category === 'MOVIE'
                  ? 'Cinema'
                  : event.category === 'CONCERT'
                  ? 'Show / Concerto'
                  : 'Teatro'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 text-slate-900 backdrop-blur-md">
                {isSeated ? 'Mapa de Assentos Marcados' : 'Pista Geral'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Sobre o Evento</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2b55f5] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Data e Horário</p>
                    <p className="text-slate-900 font-semibold capitalize">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Local</p>
                    <p className="text-slate-900 font-semibold">{event.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Area: Seat Map or General Admission Stepper */}
            {isSeated ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Selecione suas Poltronas
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
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
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Quantidade de Ingressos de Pista
                </h2>
                <p className="text-sm text-slate-500">
                  Ingressos oficiais com acesso à área de pista geral do evento.
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 border border-slate-300 flex items-center justify-center transition shadow-xs"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-lg text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 10 || quantity >= event.availableCapacity}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 border border-slate-300 flex items-center justify-center transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Preço unitário</p>
                    <p className="text-lg font-black text-slate-900">
                      R$ {Number(event.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Sticky Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-24 space-y-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                Resumo da Reserva
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Preço Unitário:</span>
                  <span className="text-slate-900 font-bold">
                    R$ {Number(event.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Ingressos:</span>
                  <span className="text-slate-900 font-bold">{totalSelectedTickets}</span>
                </div>

                {isSeated && selectedSeats.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-slate-500 font-semibold mb-2">Poltronas Selecionadas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-[#2b55f5] border border-blue-200 text-[11px] font-bold"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Total:</span>
                <span className="text-2xl font-black text-slate-900">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>

              <button
                disabled={isSoldOut || totalSelectedTickets === 0}
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-xs transition active:scale-[0.99]"
              >
                {isSoldOut
                  ? 'Evento Esgotado'
                  : totalSelectedTickets === 0
                  ? isSeated
                    ? 'Selecione um Assento'
                    : 'Selecione a Quantidade'
                  : `Garantir Ingresso (${totalSelectedTickets})`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
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
