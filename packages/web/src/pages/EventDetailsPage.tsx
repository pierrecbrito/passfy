import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { SeatMap, SeatItem } from '../components/SeatMap';
import { SpotifyShowCard } from '../components/SpotifyShowCard';
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
  CreditCard,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  Share2,
  Award,
  Layers,
  Radio,
} from 'lucide-react';

interface AttendeeState {
  seatId?: string;
  seatLabel?: string;
  tierId?: string;
  tierName?: string;
  name: string;
  ticketType: 'INTEIRA' | 'MEIA_ESTUDANTE';
  studentIdNumber: string;
}

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
  const [selectedTierId, setSelectedTierId] = useState<string>('pista');

  // In-Card 3-Phase Flow State: 1 = Resumo, 2 = Titulares/Ingressos Pontilhados, 3 = Pagamento
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [attendees, setAttendees] = useState<AttendeeState[]>([]);
  const [savedStudentId, setSavedStudentId] = useState<string>('');

  // WebSocket Live Sync State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [realtimeWarning, setRealtimeWarning] = useState<string | null>(null);

  // Payment Phase State (Stripe Test Integration)
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Cliente Teste Stripe');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [simulateStatus, setSimulateStatus] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [declineReason, setDeclineReason] = useState('INSUFFICIENT_FUNDS');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // In-Place Auth State
  const [isAuthCardActive, setIsAuthCardActive] = useState(false);
  const [authMode, setAuthMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Load Saved Student ID from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('passfy_saved_student_id');
    if (saved) {
      setSavedStudentId(saved);
    }
  }, []);

  // Fetch Event Details
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

  // ── WebSocket Real-Time Seat Synchronization ──
  useEffect(() => {
    if (!id) return;

    const socket = getSocket();

    const onConnect = () => setIsLiveConnected(true);
    const onDisconnect = () => setIsLiveConnected(false);

    if (socket.connected) {
      setIsLiveConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join room for this event
    socket.emit('join_event', id);

    // Receive live updates when seats are purchased by ANY user
    const onSeatsUpdated = (data: {
      eventId: string;
      seats: Array<{ id: string; label?: string; isAvailable: boolean }>;
      timestamp: number;
    }) => {
      if (data.eventId !== id) return;

      // 1. Instantly update seat availability in the local state
      setEvent((prevEvent: any) => {
        if (!prevEvent || !prevEvent.seats) return prevEvent;
        const availabilityMap = new Map(data.seats.map((s) => [s.id, s.isAvailable]));
        const updatedSeats = prevEvent.seats.map((seat: any) => {
          if (availabilityMap.has(seat.id)) {
            return { ...seat, isAvailable: availabilityMap.get(seat.id) };
          }
          return seat;
        });
        return { ...prevEvent, seats: updatedSeats };
      });

      // 2. Check if the current user had selected one of these purchased seats
      const newlyOccupiedIds = data.seats.filter((s) => !s.isAvailable).map((s) => s.id);
      if (newlyOccupiedIds.length > 0) {
        setSelectedSeats((prevSelected) => {
          const conflictingSeats = prevSelected.filter((s) => newlyOccupiedIds.includes(s.id));
          if (conflictingSeats.length > 0) {
            const conflictLabels = conflictingSeats.map((s) => `Poltrona ${s.label}`).join(', ');
            setRealtimeWarning(
              `⚠️ A ${conflictLabels} acabou de ser comprada por outro cliente e foi desmarcada automaticamente. Por favor, escolha outro assento.`
            );
            // Invalidate checkout progress and return to Phase 1 so user cannot complete with an occupied seat
            setCurrentPhase(1);
            return prevSelected.filter((s) => !newlyOccupiedIds.includes(s.id));
          }
          return prevSelected;
        });
      }
    };

    socket.on('seats_updated', onSeatsUpdated);

    return () => {
      socket.emit('leave_event', id);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('seats_updated', onSeatsUpdated);
    };
  }, [id]);

  const isSeated = event?.type === 'SEATED';
  const isSoldOut = event?.availableCapacity <= 0;
  const isMusicEvent =
    event?.category === 'CONCERT' ||
    event?.title?.toLowerCase().includes('rock') ||
    event?.title?.toLowerCase().includes('coldplay') ||
    event?.title?.toLowerCase().includes('tour');

  // Available Ticket Tiers (Pista, Camarote, etc.)
  const availableTiers = useMemo(() => {
    if (!event) return [];
    if (event.ticketTiers && Array.isArray(event.ticketTiers) && event.ticketTiers.length > 0) {
      return event.ticketTiers;
    }
    if (event.type === 'GENERAL_ADMISSION') {
      const base = Number(event.price) || 120;
      return [
        {
          id: 'pista',
          name: 'Pista',
          price: base,
          description: 'Acesso à pista geral e visão frontal do palco',
        },
        {
          id: 'camarote',
          name: 'Camarote',
          price: base * 1.8,
          description: 'Visão panorâmica elevada, entrada exclusiva e bar privativo',
        },
      ];
    }
    return [];
  }, [event]);

  // Set default selected tier when availableTiers load
  useEffect(() => {
    if (availableTiers.length > 0 && !availableTiers.some((t: any) => t.id === selectedTierId)) {
      setSelectedTierId(availableTiers[0].id);
    }
  }, [availableTiers, selectedTierId]);

  const currentTier =
    availableTiers.find((t: any) => t.id === selectedTierId) || availableTiers[0];

  const unitPrice = currentTier
    ? Number(currentTier.price)
    : event
    ? Number(event.price)
    : 0;

  const totalSelectedTickets = isSeated ? selectedSeats.length : quantity;

  // Clear any previous error when seats, tier or quantity change
  useEffect(() => {
    setPaymentError(null);
  }, [selectedSeats, quantity, selectedTierId, currentPhase]);

  // Synchronize Attendees List when seats, tier or quantity change
  useEffect(() => {
    const defaultStudentId = localStorage.getItem('passfy_saved_student_id') || '';
    const tierName = currentTier?.name || 'Pista Geral';

    if (isSeated) {
      setAttendees((prev) => {
        return selectedSeats.map((seat, idx) => {
          const existing = prev.find((a) => a.seatId === seat.id);
          if (existing) return existing;
          return {
            seatId: seat.id,
            seatLabel: seat.label,
            tierName: `Poltrona ${seat.label}`,
            name: idx === 0 && user?.name ? user.name : '',
            ticketType: 'INTEIRA',
            studentIdNumber: defaultStudentId,
          };
        });
      });
    } else {
      setAttendees((prev) => {
        const newAttendees: AttendeeState[] = [];
        for (let i = 0; i < quantity; i++) {
          if (prev[i]) {
            newAttendees.push({
              ...prev[i],
              tierId: selectedTierId,
              tierName,
            });
          } else {
            newAttendees.push({
              tierId: selectedTierId,
              tierName,
              name: i === 0 && user?.name ? user.name : '',
              ticketType: 'INTEIRA',
              studentIdNumber: defaultStudentId,
            });
          }
        }
        return newAttendees;
      });
    }
  }, [selectedSeats, quantity, isSeated, selectedTierId, currentTier, user]);

  // Dynamic Total Calculation: Inteira = 100%, Estudante = 50%
  const subtotal = useMemo(() => {
    if (attendees.length === 0) return 0;
    return attendees.reduce((acc, curr) => {
      const price = curr.ticketType === 'MEIA_ESTUDANTE' ? unitPrice * 0.5 : unitPrice;
      return acc + price;
    }, 0);
  }, [attendees, unitPrice]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (!seat.isAvailable) return;
    setPaymentError(null);
    setRealtimeWarning(null);

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

  const handleUpdateAttendee = (index: number, field: keyof AttendeeState, value: string) => {
    setPaymentError(null);
    setAttendees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (field === 'studentIdNumber' && value.trim()) {
      localStorage.setItem('passfy_saved_student_id', value.trim());
      setSavedStudentId(value.trim());
    }
  };

  // Phase Transition Handlers
  const handleProceedFromPhase1 = () => {
    setPaymentError(null);
    if (totalSelectedTickets === 0) return;
    if (!user) {
      setIsAuthCardActive(true);
      return;
    }
    setCurrentPhase(2);
  };

  const handleProceedFromPhase2 = () => {
    setPaymentError(null);

    // Validate all holders and student IDs
    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i];
      const label = att.seatLabel
        ? `Poltrona ${att.seatLabel}`
        : `${att.tierName || 'Ingresso'} #${i + 1}`;

      if (!att.name.trim()) {
        setPaymentError(`Por favor, informe o nome do titular do ${label}.`);
        return;
      }

      if (att.ticketType === 'MEIA_ESTUDANTE' && !att.studentIdNumber.trim()) {
        setPaymentError(`Informe a carteira de estudante para o ${label}.`);
        return;
      }
    }

    setCurrentPhase(3);
  };

  // Process Final Payment
  const handleExecutePayment = async () => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      const payload = {
        eventId: event.id,
        seatIds: isSeated ? selectedSeats.map((s) => s.id) : [],
        quantity: isSeated ? undefined : quantity,
        attendees: attendees.map((a) => ({
          seatId: a.seatId,
          tierId: a.tierId,
          tierName: a.tierName,
          name: a.name.trim(),
          ticketType: a.ticketType,
          studentIdNumber: a.ticketType === 'MEIA_ESTUDANTE' ? a.studentIdNumber.trim() : undefined,
        })),
        paymentMethod,
        cardDetails:
          paymentMethod === 'CREDIT_CARD'
            ? {
                holderName: cardHolder.trim() || 'Titular de Teste',
                cardNumber: cardNumber.replace(/\s+/g, ''),
                expiryDate: cardExpiry.trim(),
                cvv: cardCvv.trim(),
              }
            : undefined,
        simulateStatus,
        declineReason: simulateStatus === 'DECLINED' ? declineReason : undefined,
      };

      // Aguarda no mínimo 2 segundos com o overlay de carregamento visível
      const [response] = await Promise.all([
        api.post('/checkout/simulate', payload),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      if (response.data.status === 'APPROVED') {
        navigate('/order-success', {
          state: {
            result: response.data,
            event,
          },
        });
      } else {
        setPaymentError(response.data.message || 'Pagamento recusado pela operadora.');
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Erro ao processar o pagamento.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // In-Place Auth Form Submit
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
      } else {
        await login(authEmail.trim(), authPassword);
      }

      setIsAuthCardActive(false);
      setCurrentPhase(2);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Falha ao autenticar. Verifique seus dados.');
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
          className="px-5 py-2.5 rounded-xl bg-[#2b55f5] text-white text-sm font-bold shadow-xs hover:bg-[#1f44d6] transition cursor-pointer"
        >
          Voltar para Eventos
        </button>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const pixPayloadMock = `00020126580014br.gov.bcb.pix0136${event.id.replace(
    /-/g,
    ''
  )}520400005303986540${subtotal.toFixed(2)}5802BR5907PASSFY6009SAO PAULO62070503***6304`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para todos os eventos</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LADO ESQUERDO: Banner & Detalhes do Evento & Mapa de Assentos ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Banner Principal */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900">
                <img
                  src={
                    event.bannerUrl ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Badges Flutuantes */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-white text-slate-900 shadow-sm">
                    {event.category === 'MOVIE'
                      ? 'Cinema'
                      : event.category === 'CONCERT'
                      ? 'Show'
                      : 'Teatro'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-900/80 text-white backdrop-blur-md">
                    {isSeated ? 'Poltronas Numeradas' : 'Pista & Camarote'}
                  </span>
                </div>
              </div>

              {/* Título & Infos Principais */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {event.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium mt-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Grid de Data e Local com Atalho para Google Agenda e Google Maps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  {/* Google Calendar Link */}
                  <div
                    onClick={() => {
                      const startDate = new Date(event.date);
                      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
                      const formatUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
                      const params = new URLSearchParams({
                        action: 'TEMPLATE',
                        text: event.title,
                        dates: `${formatUTC(startDate)}/${formatUTC(endDate)}`,
                        details: `${event.description || ''}`,
                        location: event.venue,
                      });
                      window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-200 transition group cursor-pointer"
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
                        <span className="text-[10px] font-bold text-[#2b55f5] bg-blue-50 px-1.5 py-0.5 rounded group-hover:underline">
                          Google Agenda ↗
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold text-xs sm:text-sm capitalize group-hover:text-[#2b55f5] transition-colors truncate">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 transition group cursor-pointer"
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
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Ver no Maps ↗
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold text-xs sm:text-sm group-hover:text-emerald-700 transition-colors truncate">
                        {event.venue}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Mapa de Assentos Interativo (quando for evento com assento marcado) */}
            {isSeated && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Selecione suas Poltronas
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedSeats.length} de 6 assentos selecionados
                  </p>
                </div>

                {/* Real-time occupied warning banner above seat map */}
                {realtimeWarning && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-300 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{realtimeWarning}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealtimeWarning(null)}
                      className="text-amber-700 hover:text-amber-900 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Entendi
                    </button>
                  </div>
                )}

                <SeatMap
                  seats={event.seats || []}
                  selectedSeatIds={selectedSeats.map((s) => s.id)}
                  onToggleSeat={handleToggleSeat}
                  maxSelection={6}
                  isLiveConnected={isLiveConnected}
                />
              </div>
            )}

            {/* Card do Spotify */}
            {isMusicEvent && (
              <div className="space-y-3">
                <SpotifyShowCard event={event} />
              </div>
            )}
          </div>

          {/* ── LADO DIREITO: Painel de Reserva / Finalização / Pagamento (3 Fases no mesmo Card) ── */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 self-start space-y-4">
            <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all duration-300">
              
              {/* Overlay de Carregamento com Spinner durante processamento de pagamento */}
              {isProcessingPayment && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center space-y-3 rounded-3xl animate-in fade-in duration-200">
                  <div className="w-10 h-10 border-3 border-[#2b55f5] border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-0.5">
                    <p className="text-sm font-black text-slate-900">Processando Pagamento...</p>
                    <p className="text-xs text-slate-500 font-medium">Validando transação com segurança bancária</p>
                  </div>
                </div>
              )}

              {/* Top Bar: Title on Left, 3 Dots Step Indicator on Right */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {currentPhase === 1
                      ? 'Resumo da Reserva'
                      : currentPhase === 2
                      ? 'Finalização do Pedido'
                      : 'Pagamento'}
                  </h3>
                </div>

                {/* 3 Dots Phase Indicator */}
                {!isAuthCardActive && (
                  <div className="flex items-center gap-1.5" title={`Fase ${currentPhase} de 3`}>
                    {[1, 2, 3].map((step) => {
                      const isCurrent = currentPhase === step;
                      const isCompleted = currentPhase > step;

                      return (
                        <div
                          key={step}
                          className={`transition-all duration-300 ${
                            isCurrent
                              ? 'w-6 h-2 rounded-full bg-[#2b55f5] shadow-xs'
                              : isCompleted
                              ? 'w-2 h-2 rounded-full bg-emerald-500'
                              : 'w-2 h-2 rounded-full bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real-time Invalidation Warning inside the checkout card */}
              {realtimeWarning && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{realtimeWarning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRealtimeWarning(null)}
                    className="text-amber-700 hover:text-amber-900 font-bold text-[11px] shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── STATE 0: In-Place Authentication / Pre-Cadastro Form ── */}
              {isAuthCardActive && !user ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#2b55f5] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          {authMode === 'REGISTER' ? 'Pré-Cadastro Rápido' : 'Entrar na Conta'}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Conclua em segundos para finalizar a compra
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAuthCardActive(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>

                  <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('REGISTER');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
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
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
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
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleInPlaceAuthSubmit} className="space-y-2.5 pt-1">
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
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5]"
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
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5]"
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
                          className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5]"
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
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                    >
                      <span>
                        {isAuthenticating
                          ? 'Processando...'
                          : authMode === 'REGISTER'
                          ? 'Cadastrar & Continuar'
                          : 'Entrar & Continuar'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={handleQuickDemoFill}
                        className="text-[11px] font-bold text-[#2b55f5] hover:underline cursor-pointer"
                      >
                        ⚡ Usar conta demo (1-clique)
                      </button>
                    </div>
                  </form>
                </div>
              ) : currentPhase === 1 ? (
                /* ── FASE 1: Resumo da Reserva (com seleção de Setor Pista / Camarote e Estudante) ── */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Seletor de Setor / Tipo de Ingresso (Pista vs Camarote) para eventos sem assento marcado */}
                  {!isSeated && availableTiers.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Escolha o Setor do Ingresso:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableTiers.map((tier: any) => {
                          const isSelected = selectedTierId === tier.id;
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setSelectedTierId(tier.id)}
                              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer shadow-2xs ${
                                isSelected
                                  ? 'bg-blue-50/70 border-[#2b55f5] text-[#2b55f5] ring-2 ring-blue-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900">{tier.name}</span>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-[#2b55f5]" />}
                              </div>
                              <p className="text-xs font-extrabold text-[#2b55f5]">
                                R$ {Number(tier.price).toFixed(2)}
                              </p>
                              {tier.description && (
                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                  {tier.description}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preço Base Atual */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Preço Unitário ({currentTier?.name || 'Ingresso'}):</span>
                    <span className="text-slate-900 font-bold text-sm">
                      R$ {unitPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Controle de Quantidade (Pista / Camarote) */}
                  {!isSeated && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Quantidade de Ingressos</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {currentTier?.name || 'Geral'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                          <button
                            type="button"
                            disabled={quantity <= 1}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-800 flex items-center justify-center transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-black text-sm text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= 10}
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-800 flex items-center justify-center transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900">
                          {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Poltronas Marcadas Selecionadas */}
                  {isSeated && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Poltronas Selecionadas:</span>
                        <span className="text-slate-900 font-bold">{selectedSeats.length} de 6</span>
                      </div>

                      {selectedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSeats.map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2b55f5] border border-blue-200 text-xs font-black shadow-xs"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                          Escolha suas poltronas no mapa de assentos ao lado.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Opção de Estudante / Inteira por Ingresso já no Resumo da Reserva */}
                  {totalSelectedTickets > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Tipo de Ingresso por Unidade:
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {attendees.map((att, idx) => {
                          const ticketLabel = att.seatLabel
                            ? `Poltrona ${att.seatLabel}`
                            : `${att.tierName || 'Ingresso'} #${idx + 1}`;
                          const isStudent = att.ticketType === 'MEIA_ESTUDANTE';

                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {ticketLabel}
                                </p>
                                <p className="text-[11px] font-extrabold text-[#2b55f5]">
                                  R$ {isStudent ? (unitPrice * 0.5).toFixed(2) : unitPrice.toFixed(2)}
                                </p>
                              </div>

                              {/* Toggle Inteira / Estudante */}
                              <div className="flex p-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendee(idx, 'ticketType', 'INTEIRA')}
                                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                    !isStudent
                                      ? 'bg-[#2b55f5] text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  Inteira
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAttendee(idx, 'ticketType', 'MEIA_ESTUDANTE')
                                  }
                                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                    isStudent
                                      ? 'bg-purple-600 text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  Estudante
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Totalizador */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Total Previsto:</span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Botão de Avançar */}
                  <button
                    disabled={isSoldOut || totalSelectedTickets === 0}
                    onClick={handleProceedFromPhase1}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSoldOut ? (
                      'Evento Esgotado'
                    ) : totalSelectedTickets === 0 ? (
                      isSeated ? (
                        'Selecione um Assento'
                      ) : (
                        'Selecione a Quantidade'
                      )
                    ) : (
                      <>
                        <span>Avançar para Titulares ({totalSelectedTickets})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reserva criptografada e segura</span>
                  </div>
                </div>
              ) : currentPhase === 2 ? (
                /* ── FASE 2: Finalização do Pedido (Cards no Formato de Ingresso com Borda Pontilhada) ── */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentError(null);
                        setCurrentPhase(1);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar ao Resumo</span>
                    </button>

                    <span className="text-[11px] font-semibold text-slate-500">
                      {attendees.length} {attendees.length === 1 ? 'ingresso' : 'ingressos'}
                    </span>
                  </div>

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Lista de Ingressos em Formato de Ticket com Borda Pontilhada */}
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {attendees.map((att, index) => {
                      const isStudent = att.ticketType === 'MEIA_ESTUDANTE';
                      const ticketLabel = att.seatLabel
                        ? `Poltrona ${att.seatLabel}`
                        : `${att.tierName || 'Ingresso'} #${index + 1}`;

                      return (
                        <div
                          key={index}
                          className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/90 p-4 space-y-3 shadow-2xs overflow-hidden"
                        >
                          {/* Left & Right Notch Cutouts for Realistic Ticket Stub Look */}
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r border-slate-300" />
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-slate-300" />

                          {/* Ticket Header: Event Name & Badges */}
                          <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-200 pb-2.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <Ticket className="w-3.5 h-3.5 text-[#2b55f5]" />
                                <span>{ticketLabel}</span>
                              </div>
                              <h5 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                                {event.title}
                              </h5>
                            </div>

                            {/* Ticket Type Badge with Instant Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateAttendee(
                                  index,
                                  'ticketType',
                                  isStudent ? 'INTEIRA' : 'MEIA_ESTUDANTE'
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition shrink-0 cursor-pointer ${
                                isStudent
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                  : 'bg-blue-50 text-[#2b55f5] border-blue-200 hover:bg-blue-100'
                              }`}
                              title="Clique para alternar entre Inteira e Estudante"
                            >
                              {isStudent ? 'Estudante' : 'Inteira'}
                            </button>
                          </div>

                          {/* Ticket Form: Nome do Titular */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Nome do Titular do Ingresso
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  type="text"
                                  required
                                  value={att.name}
                                  onChange={(e) =>
                                    handleUpdateAttendee(index, 'name', e.target.value)
                                  }
                                  placeholder="Nome completo do titular"
                                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5] shadow-2xs"
                                />
                              </div>
                            </div>

                            {/* Carteira de Estudante (Obrigatória para Estudante) */}
                            {isStudent && (
                              <div className="space-y-1 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[11px] font-bold text-purple-800">
                                    Carteira de Estudante / Matrícula
                                  </label>
                                  {savedStudentId && !att.studentIdNumber && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateAttendee(
                                          index,
                                          'studentIdNumber',
                                          savedStudentId
                                        )
                                      }
                                      className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                                    >
                                      Preencher salva ({savedStudentId})
                                    </button>
                                  )}
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    required
                                    value={att.studentIdNumber}
                                    onChange={(e) =>
                                      handleUpdateAttendee(
                                        index,
                                        'studentIdNumber',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Nº DNE / CIE / Matrícula Estudantil"
                                    className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-2xs"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  A carteira de estudante fica salva para suas próximas compras.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtotal da Fase 2 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total do Pedido:</span>
                    <span className="text-xl font-black text-slate-900">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Botão de Avançar para Pagamento */}
                  <button
                    type="button"
                    onClick={handleProceedFromPhase2}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Avançar para o Pagamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* ── FASE 3: Pagamento & Simulação ── */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentError(null);
                        setCurrentPhase(2);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar aos Titulares</span>
                    </button>

                    <span className="text-xs font-black text-slate-900">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Seletor de Método de Pagamento */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PIX')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        paymentMethod === 'PIX'
                          ? 'bg-blue-50/60 border-[#2b55f5] text-[#2b55f5] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <QrCode className="w-5 h-5 text-[#2b55f5]" />
                        {paymentMethod === 'PIX' && (
                          <span className="w-2 h-2 rounded-full bg-[#2b55f5]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black">PIX Instantâneo</p>
                        <p className="text-[10px] text-slate-500 font-medium">Aprovação em 2s</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CREDIT_CARD')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        paymentMethod === 'CREDIT_CARD'
                          ? 'bg-blue-50/60 border-[#2b55f5] text-[#2b55f5] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-5 h-5 text-[#2b55f5]" />
                        {paymentMethod === 'CREDIT_CARD' && (
                          <span className="w-2 h-2 rounded-full bg-[#2b55f5]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black">Cartão de Crédito</p>
                        <p className="text-[10px] text-slate-500 font-medium">Até 6x sem juros</p>
                      </div>
                    </button>
                  </div>

                  {/* Conteúdo de Pagamento: PIX */}
                  {paymentMethod === 'PIX' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <div className="w-28 h-28 bg-white border border-slate-300 rounded-xl p-2 mx-auto flex items-center justify-center shadow-xs">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            pixPayloadMock
                          )}`}
                          alt="QR Code PIX"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">Escaneie o QR Code com seu app</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Ou use o código Copia e Cola abaixo
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                        <input
                          type="text"
                          readOnly
                          value={pixPayloadMock}
                          className="w-full bg-transparent text-[10px] text-slate-600 font-mono focus:outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pixPayloadMock);
                            setCopiedPix(true);
                            setTimeout(() => setCopiedPix(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2b55f5] text-[11px] font-bold shrink-0 hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo de Pagamento: Cartão de Crédito com Stripe Test Gateway */}
                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      {/* Header Badge Stripe */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#635BFF]" />
                          <span className="text-xs font-black text-slate-900 tracking-tight">
                            Stripe Gateway
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
                          Modo de Testes Oficial
                        </span>
                      </div>

                      {/* Quick 1-Click Stripe Test Cards Matrix */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Cartões de Teste Oficiais Stripe (1-Clique):
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4242 4242 4242 4242');
                              setCardExpiry('12/28');
                              setCardCvv('123');
                              setSimulateStatus('APPROVED');
                            }}
                            className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                              cardNumber.includes('4242')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🟢 Aprovação</span>
                            <span className="text-[9px] text-slate-400 font-mono">4242</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4000 0000 0000 0069');
                              setCardExpiry('12/28');
                              setCardCvv('123');
                              setSimulateStatus('DECLINED');
                              setDeclineReason('INSUFFICIENT_FUNDS');
                            }}
                            className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                              cardNumber.includes('0069')
                                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🟡 Sem Saldo</span>
                            <span className="text-[9px] text-slate-400 font-mono">0069</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4000 0000 0000 0002');
                              setCardExpiry('12/28');
                              setCardCvv('123');
                              setSimulateStatus('DECLINED');
                              setDeclineReason('CARD_BLOCKED');
                            }}
                            className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                              cardNumber.includes('0002')
                                ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-200 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🔴 Recusado</span>
                            <span className="text-[9px] text-slate-400 font-mono">0002</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4000 0000 0000 0127');
                              setCardExpiry('01/20');
                              setCardCvv('123');
                              setSimulateStatus('DECLINED');
                              setDeclineReason('EXPIRED_CARD');
                            }}
                            className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                              cardNumber.includes('0127')
                                ? 'bg-slate-200 text-slate-900 border-slate-400 ring-1 ring-slate-300 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>⚪ Expirado</span>
                            <span className="text-[9px] text-slate-400 font-mono">0127</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4000 0000 0000 0082');
                              setCardExpiry('12/28');
                              setCardCvv('123');
                              setSimulateStatus('DECLINED');
                              setDeclineReason('FRAUD_SUSPICION');
                            }}
                            className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer col-span-2 ${
                              cardNumber.includes('0082')
                                ? 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-200 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🛡️ Suspeita de Fraude (Radar)</span>
                            <span className="text-[9px] text-slate-400 font-mono">0082</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Inputs Form */}
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            Número do Cartão
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            Nome no Cartão
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Como impresso no cartão"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] shadow-2xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Validade
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              CVC / CVV
                            </label>
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botão de Finalizar Pagamento */}
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleExecutePayment}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#2b55f5] hover:bg-[#1f44d6] disabled:opacity-50 text-white shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Pagar R$ {subtotal.toFixed(2)}</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
