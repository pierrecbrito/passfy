import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { SeatMap, SeatItem } from '../components/SeatMap';
import { CheckoutModal } from '../components/CheckoutModal';
import { SpotifyShowCard } from '../components/SpotifyShowCard';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  MapPin,
  Ticket,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [selectedSeats, setSelectedSeats] = useState<SeatItem[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // In-Place Auth / Pre-Registration State
  const [isAuthCardActive, setIsAuthCardActive] = useState(false);
  const [authMode, setAuthMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessToast, setAuthSuccessToast] = useState<string | null>(null);

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
      // In-place flip to Pre-Registration / Login form inside the card
      setIsAuthCardActive(true);
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleInPlaceAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      if (authMode === 'REGISTER') {
        if (!authName.trim()) {
          setAuthError('Por favor, informe seu nome completo.');
          setIsAuthenticating(false);
          return;
        }
        await register(authName.trim(), authEmail.trim(), authPassword, 'CUSTOMER');
        setAuthSuccessToast('Pré-cadastro realizado com sucesso!');
      } else {
        await login(authEmail.trim(), authPassword);
        setAuthSuccessToast('Login realizado com sucesso!');
      }

      setIsAuthCardActive(false);

      // Auto-open checkout modal after quick in-place login/register
      setTimeout(() => {
        setAuthSuccessToast(null);
        setIsCheckoutModalOpen(true);
      }, 700);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Falha ao autenticar. Verifique os dados.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickDemoFill = () => {
    setAuthEmail('cliente1@passfy.com');
    setAuthPassword('password123');
    setAuthName('Pedro Comprador');
    setAuthMode('LOGIN');
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
          onClick={() => navigate('/home')}
          className="px-4 py-2 rounded-xl bg-[#2b55f5] text-white text-sm font-bold shadow-xs hover:bg-[#1f44d6] transition"
        >
          Voltar para Eventos
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
      {/* Toast de Sucesso da Autenticação */}
      {authSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-bold">{authSuccessToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Eventos</span>
          </button>
        </div>

        {/* Main Event Title Header Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-[#2b55f5] text-white shadow-xs">
              {event.category === 'MOVIE'
                ? 'Cinema'
                : event.category === 'CONCERT'
                ? 'Show / Concerto'
                : 'Teatro & Cultura'}
            </span>

            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {isSeated ? 'Mapa de Assentos Marcados' : 'Pista Geral'}
            </span>

            {isSoldOut ? (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700">
                Esgotado
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                {event.availableCapacity} ingressos disponíveis
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {event.title}
          </h1>
        </div>

        {/* Event Banner Image Card */}
        <div className="relative h-72 sm:h-96 md:h-[420px] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
          <img
            src={
              event.bannerUrl ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* Content Grid: Details, SeatMap & Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
          {/* Left Column: Info & Seat Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">Sobre o Evento</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                {/* Google Calendar Link */}
                <a
                  href={(() => {
                    const startDate = new Date(event.date);
                    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
                    const formatUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
                    const params = new URLSearchParams({
                      action: 'TEMPLATE',
                      text: event.title,
                      dates: `${formatUTC(startDate)}/${formatUTC(endDate)}`,
                      details: `${event.description || ''}\n\nIngresso e confirmação: ${window.location.href}`,
                      location: event.venue,
                    });
                    return `https://calendar.google.com/calendar/render?${params.toString()}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 -m-3 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition group cursor-pointer"
                  title="Clique para adicionar este evento à sua agenda Google"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2b55f5] shrink-0 group-hover:scale-105 group-hover:bg-[#2b55f5] group-hover:text-white transition-all shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        Data e Horário
                      </p>
                      <span className="text-[10px] font-bold text-[#2b55f5] bg-blue-50 px-1.5 py-0.2 rounded group-hover:underline">
                        + Google Agenda ↗
                      </span>
                    </div>
                    <p className="text-slate-900 font-bold text-sm capitalize group-hover:text-[#2b55f5] transition-colors truncate">
                      {formattedDate}
                    </p>
                  </div>
                </a>

                {/* Google Maps Link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 -m-3 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition group cursor-pointer"
                  title="Clique para abrir a localização no Google Maps"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        Local do Evento
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded group-hover:underline">
                        Ver no Maps ↗
                      </span>
                    </div>
                    <p className="text-slate-900 font-bold text-sm group-hover:text-emerald-700 transition-colors truncate">
                      {event.venue}
                    </p>
                  </div>
                </a>
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

          {/* Right Column: Order Summary & Checkout Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all duration-300">
              {/* STATE 1: In-Place Authentication / Pre-Cadastro Form */}
              {isAuthCardActive && !user ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#2b55f5] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          {authMode === 'REGISTER' ? 'Pré-Cadastro Rápido' : 'Entrar na Conta'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Conclua em segundos para finalizar a compra
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAuthCardActive(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      Voltar
                    </button>
                  </div>

                  {/* Tabs: Criar Conta vs Entrar */}
                  <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('REGISTER');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                        authMode === 'REGISTER'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#2b55f5]" />
                      <span>Pré-Cadastro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('LOGIN');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                        authMode === 'LOGIN'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#2b55f5]" />
                      <span>Já Tenho Conta</span>
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleInPlaceAuthSubmit} className="space-y-3 pt-1">
                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nome Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <span>
                        {isAuthenticating
                          ? 'Processando...'
                          : authMode === 'REGISTER'
                          ? 'Finalizar Pré-Cadastro & Continuar'
                          : 'Entrar & Continuar Compra'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Preenchimento Rápido de Teste */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleQuickDemoFill}
                        className="text-[11px] font-bold text-[#2b55f5] hover:underline"
                      >
                        ⚡ Usar conta demo (1-clique)
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* STATE 2: Normal Order Summary Card */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900">
                      Resumo da Reserva
                    </h3>
                    {user && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[110px]">{user.name.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>

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
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isSoldOut ? (
                      'Evento Esgotado'
                    ) : totalSelectedTickets === 0 ? (
                      isSeated ? (
                        'Selecione um Assento'
                      ) : (
                        'Selecione a Quantidade'
                      )
                    ) : !user ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Garantir Ingresso ({totalSelectedTickets})</span>
                      </>
                    ) : (
                      `Garantir Ingresso (${totalSelectedTickets})`
                    )}
                  </button>

                  {!user && (
                    <p className="text-[11px] text-center text-slate-500 font-medium -mt-2">
                      Pré-cadastro rápido de 10 segundos sem sair da página
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reserva criptografada e instantânea</span>
                  </div>
                </div>
              )}
            </div>

            {/* Integration: Spotify Tour Setlist & Music Player */}
            {(event.category === 'CONCERT' ||
              event.title.toLowerCase().includes('show') ||
              event.title.toLowerCase().includes('rock') ||
              event.title.toLowerCase().includes('tour') ||
              event.title.toLowerCase().includes('festival') ||
              event.title.toLowerCase().includes('coldplay') ||
              event.title.toLowerCase().includes('tomorrowland') ||
              event.title.toLowerCase().includes('taylor') ||
              event.title.toLowerCase().includes('billie')) && (
              <SpotifyShowCard event={event} />
            )}
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
