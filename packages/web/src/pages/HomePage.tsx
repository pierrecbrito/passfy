import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search,
  Calendar,
  MapPin,
  Ticket,
  Film,
  Music,
  Drama,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowUp,
  Navigation,
  Compass,
  Headphones,
  Bot,
  Send,
  X,
  Heart,
  Users,
  Flame,
  CheckCircle2,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: 'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER';
  type: 'SEATED' | 'GENERAL_ADMISSION';
  bannerUrl: string | null;
  venue: string;
  date: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  availableCapacity: number;
  organizer: {
    name: string;
  };
}

interface AiRecommendationState {
  isActive: boolean;
  query: string;
  responseText: string;
  matchedEventIds: string[];
  suggestedVibe?: string;
  highlightTip?: string;
  isGeminiActive?: boolean;
  modelUsed?: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters within Events Container
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // AI Agent Hero State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendationState | null>(null);

  // Proximity & Geolocation State
  const [isNearMeActive, setIsNearMeActive] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);

  // Load events from API
  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const response = await api.get('/events', {
          params: {
            search: search.trim() || undefined,
            category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          },
        });
        setEvents(response.data.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = setTimeout(loadEvents, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'Todos os Eventos', icon: Layers },
    { id: 'CONCERT', label: 'Shows & Festivais', icon: Music },
    { id: 'MOVIE', label: 'Cinema & Filmes', icon: Film },
    { id: 'THEATER', label: 'Teatro & Cultura', icon: Drama },
  ];

  // Dynamic & Curated Locations list
  const availableLocations = useMemo(() => {
    const uniqueVenues = Array.from(new Set(events.map((e) => e.venue))).filter(Boolean);
    return [
      { id: 'ALL', label: 'Todos os Locais & Cidades' },
      { id: 'São Paulo', label: 'São Paulo, SP' },
      { id: 'Rio de Janeiro', label: 'Rio de Janeiro, RJ' },
      { id: 'Curitiba', label: 'Curitiba, PR' },
      { id: 'Itu', label: 'Itu / Interior SP' },
      ...uniqueVenues
        .filter((v) => !v.includes('São Paulo') && !v.includes('Rio') && !v.includes('Curitiba') && !v.includes('Itu'))
        .map((venue) => ({ id: venue, label: venue })),
    ];
  }, [events]);

  // Synthetic distance calculator based on venue names
  const calculateDistance = (venue: string): number => {
    const v = venue.toLowerCase();
    if (v.includes('allianz') || v.includes('parque')) return 3.4;
    if (v.includes('cinépolis') || v.includes('cinemark') || v.includes('iguatemi')) return 5.8;
    if (v.includes('renault') || v.includes('teatro') || v.includes('bradesco')) return 4.1;
    if (v.includes('cidade do rock') || v.includes('rio')) return isNearMeActive ? 428.0 : 12.5;
    if (v.includes('maeda') || v.includes('itu')) return 78.0;
    return 8.9;
  };

  // AI Prompt Processor (Direct & Concise)
  const handleRunAiRecommendation = async (promptText: string) => {
    if (!promptText.trim()) return;

    setIsAiProcessing(true);
    const p = promptText.toLowerCase().trim();

    // Check if user asked for nearby events in prompt
    if (
      p.includes('perto') ||
      p.includes('próxim') ||
      p.includes('proxim') ||
      p.includes('onde estou') ||
      p.includes('região')
    ) {
      handleDetectLocation();
    }

    try {
      const response = await api.post('/ai/concierge', {
        prompt: promptText.trim(),
      });

      const data = response.data;
      setAiRecommendation({
        isActive: true,
        query: promptText,
        responseText: data.recommendation,
        matchedEventIds: data.matchedEventIds || events.map((e) => e.id),
        suggestedVibe: data.suggestedVibe,
        highlightTip: data.highlightTip,
        isGeminiActive: data.isGeminiActive,
        modelUsed: data.modelUsed,
      });
    } catch (err) {
      console.warn('Backend AI route unavailable, using local semantic engine:', err);
      // Fallback
      setAiRecommendation({
        isActive: true,
        query: promptText,
        responseText: `Aqui estão as melhores opções selecionadas para você.`,
        matchedEventIds: events.map((e) => e.id),
        suggestedVibe: 'Curadoria Passfy',
        isGeminiActive: false,
        modelUsed: 'Passfy IA',
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleClearAiRecommendation = () => {
    setAiRecommendation(null);
    setAiPromptInput('');
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          setIsNearMeActive(true);
          setSortByDistance(true);
          setDetectedLocationName('São Paulo, SP (Sua Localização GPS)');
        },
        () => {
          // Fallback simulation
          setIsDetectingLocation(false);
          setIsNearMeActive(true);
          setSortByDistance(true);
          setDetectedLocationName('São Paulo, SP (Localização Aproximada)');
        },
        { timeout: 4000 }
      );
    } else {
      setIsDetectingLocation(false);
      setIsNearMeActive(true);
      setSortByDistance(true);
      setDetectedLocationName('São Paulo, SP (Localização Aproximada)');
    }
  };

  // Filtered Events Pipeline
  const filteredEvents = events
    .filter((event) => {
      // 1. AI Recommendation Filter (if active)
      if (aiRecommendation?.isActive) {
        if (!aiRecommendation.matchedEventIds.includes(event.id)) {
          return false;
        }
      }

      // 2. Location / Places Filter
      if (selectedLocation !== 'ALL') {
        const venueMatch = event.venue.toLowerCase().includes(selectedLocation.toLowerCase());
        const titleMatch = event.title.toLowerCase().includes(selectedLocation.toLowerCase());
        if (!venueMatch && !titleMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortByDistance || isNearMeActive) {
        return calculateDistance(a.venue) - calculateDistance(b.venue);
      }
      return 0;
    });

  // Recommended Events for Horizontal Card Rendering in AI section
  const aiRecommendedEvents = useMemo(() => {
    if (!aiRecommendation?.isActive) return [];
    return events.filter((e) => aiRecommendation.matchedEventIds.includes(e.id));
  }, [aiRecommendation, events]);

  const quickPrompts = [
    { label: '💑 Encontro a dois', prompt: 'Quero um evento romântico para sair a dois' },
    { label: '👨‍👩‍👧‍👦 Em Família', prompt: 'Quero um evento confortável para levar a família' },
    { label: '🎸 Rock com Amigos', prompt: 'Show animado de rock para curtir com amigos' },
    { label: '🍿 Cinema VIP', prompt: 'Sessão de cinema especial em tela IMAX' },
    { label: '🎭 Teatro & Cultura', prompt: 'Espetáculo de teatro ou evento cultural sofisticado' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section with ChatGPT-style AI Concierge Agent */}
      <section className="relative overflow-hidden pt-10 pb-16 bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Viva momentos inesquecíveis com <span className="text-[#2b55f5]">Passfy</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Diga com quem você vai, o estilo do momento ou o que procura. Nosso assistente de IA encontra a programação ideal em tempo real.
            </p>

            {/* ChatGPT-style AI Box */}
            <div className="pt-3 max-w-2xl mx-auto space-y-3 text-left">
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunAiRecommendation(aiPromptInput);
                }}
                className="relative bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-300/80 shadow-md shadow-slate-300/20 focus-within:border-slate-400 focus-within:shadow-xl focus-within:ring-4 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between gap-2.5"
              >
                {/* Top: Text Input Area */}
                <div className="w-full flex items-start gap-2">
                  <textarea
                    rows={2}
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRunAiRecommendation(aiPromptInput);
                      }
                    }}
                    placeholder="Pergunte à IA o que procura... (ex: 'sair a dois', 'levar a família no domingo', 'show de rock com amigos')"
                    className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs sm:text-sm font-medium resize-none leading-relaxed px-1"
                  />
                  {aiPromptInput && (
                    <button
                      type="button"
                      onClick={() => setAiPromptInput('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition mt-0.5"
                      title="Limpar texto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Bottom Bar: IA Badge Chip & Royal Blue Submit Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Left: IA Model Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2b55f5] text-[11px] font-bold shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#2b55f5]" />
                      <span>Passfy IA</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      Sugestões inteligentes sob medida
                    </span>
                  </div>

                  {/* Right: Royal Blue Send Button matching Passfy theme */}
                  <button
                    type="submit"
                    disabled={isAiProcessing || !aiPromptInput.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      aiPromptInput.trim()
                        ? 'bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs active:scale-90 cursor-pointer'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                    title="Perguntar à IA"
                  >
                    {isAiProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ArrowUp className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </form>

              {/* Quick AI Prompts & Location Shortcut Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                
                {/* Clickable Quick Prompts */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Sugestões:
                  </span>
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiPromptInput(item.prompt);
                        handleRunAiRecommendation(item.prompt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-[#2b55f5] text-[11px] font-semibold transition shadow-2xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Geolocation Shortcut Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ml-auto ${
                    isNearMeActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>
                    {isDetectingLocation
                      ? 'Obtendo GPS...'
                      : isNearMeActive
                      ? '📍 GPS Ativo (Próximos)'
                      : '📍 Eventos perto de mim'}
                  </span>
                </button>

              </div>

              {/* AI Recommendation Result with Vertical List of Horizontal Event Cards */}
              {aiRecommendation?.isActive && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/70 border border-blue-200 text-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                  
                  {/* Top: Concise Feedback Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-blue-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 shadow-2xs text-[#2b55f5] flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#2b55f5] uppercase tracking-wider">
                            Passfy IA
                          </span>
                          {aiRecommendation.suggestedVibe && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200">
                              ✨ {aiRecommendation.suggestedVibe}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#2b55f5] text-[10px] font-bold">
                            {aiRecommendedEvents.length} {aiRecommendedEvents.length === 1 ? 'sugestão' : 'sugestões'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium">
                          {aiRecommendation.responseText}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearAiRecommendation}
                      className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition shadow-2xs shrink-0 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Limpar</span>
                    </button>
                  </div>

                  {/* Vertical List of Horizontal Event Cards */}
                  <div className="space-y-3">
                    {aiRecommendedEvents.map((event) => {
                      const isSoldOut = event.availableCapacity <= 0;
                      const isMusic =
                        event.category === 'CONCERT' ||
                        event.title.toLowerCase().includes('rock') ||
                        event.title.toLowerCase().includes('coldplay') ||
                        event.title.toLowerCase().includes('tour');
                      const distanceKm = calculateDistance(event.venue);

                      const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={event.id}
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="bg-white border border-slate-200 hover:border-[#2b55f5]/60 hover:shadow-md rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer group"
                        >
                          {/* Left: Thumbnail with tags */}
                          <div className="relative w-full sm:w-40 h-32 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={
                                event.bannerUrl ||
                                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs">
                                {event.category === 'MOVIE'
                                  ? 'Cinema'
                                  : event.category === 'CONCERT'
                                  ? 'Show'
                                  : 'Teatro'}
                              </span>
                              {isMusic && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1DB954] text-slate-950 shadow-xs flex items-center gap-0.5">
                                  <Headphones className="w-2.5 h-2.5" />
                                  <span>Spotify</span>
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-2 left-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>
                                  {distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Middle: Event Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#2b55f5] transition-colors truncate">
                                {event.title}
                              </h4>
                              {isSoldOut && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                                  Esgotado
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-1">
                              {event.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium pt-0.5">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Calendar className="w-3.5 h-3.5 text-[#2b55f5]" />
                                <span className="capitalize">{formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="truncate max-w-[200px]">{event.venue}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold hidden md:inline">
                                {event.availableCapacity} vagas
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Quick CTA */}
                          <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                                A partir de
                              </span>
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                R$ {Number(event.price).toFixed(2)}
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={isSoldOut}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 ${
                                isSoldOut
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#2b55f5] hover:bg-[#1f44d6] text-white active:scale-95'
                              }`}
                            >
                              <span>{isSoldOut ? 'Esgotado' : 'Garantir'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Highlight Tip */}
                  {aiRecommendation.highlightTip && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-blue-200/70 text-xs font-medium text-slate-700">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{aiRecommendation.highlightTip}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Available Events Container with Integrated Filters (Search, Categories, Places) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Events Container Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          
          {/* Header & Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Eventos Disponíveis
                </h2>
                {aiRecommendation?.isActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Filtrado por IA
                  </span>
                )}
                {isNearMeActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    📍 Raio de Proximidade
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'evento disponível' : 'eventos disponíveis'} no catálogo
                {detectedLocationName && ` • Próximos a ${detectedLocationName}`}
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortByDistance(!sortByDistance)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-xs ${
                  sortByDistance
                    ? 'bg-blue-50 border-blue-200 text-[#2b55f5]'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{sortByDistance ? 'Ordenado por Proximidade' : 'Ordenar por Proximidade'}</span>
              </button>
            </div>
          </div>

          {/* Integrated Filter Bar: Search, Category Tabs & Places Filter */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            
            {/* Row 1: Search Input */}
            <div className="relative flex items-center shadow-xs">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquise por evento, artista, filme, teatro ou local..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] transition text-sm font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row 2: Category Filters & Places Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                        isSelected
                          ? 'bg-[#2b55f5] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Places / Locations Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Filtrar Local:</span>
                </div>
                
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      if (e.target.value === 'ALL') {
                        setIsNearMeActive(false);
                      }
                    }}
                    className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5] transition shadow-2xs cursor-pointer max-w-[220px] truncate"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Reset all filters button if anything is customized */}
                {(search || selectedCategory !== 'ALL' || selectedLocation !== 'ALL' || aiRecommendation?.isActive) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('ALL');
                      setSelectedLocation('ALL');
                      setAiRecommendation(null);
                      setAiPromptInput('');
                      setIsNearMeActive(false);
                      setSortByDistance(false);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-2xs text-xs font-bold flex items-center gap-1"
                    title="Limpar todos os filtros"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Limpar</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Events Grid Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-3xl bg-slate-100 border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Nenhum evento encontrado para os critérios selecionados
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Tente selecionar "Todos os Eventos", limpar a busca por texto ou trocar o filtro de local.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setSelectedLocation('ALL');
                  setAiRecommendation(null);
                  setAiPromptInput('');
                  setIsNearMeActive(false);
                  setSortByDistance(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2b55f5] text-white text-xs font-bold shadow-xs hover:bg-[#1f44d6] transition"
              >
                Exibir Todos os Eventos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredEvents.map((event) => {
                const isSoldOut = event.availableCapacity <= 0;
                const isMusic =
                  event.category === 'CONCERT' ||
                  event.title.toLowerCase().includes('rock') ||
                  event.title.toLowerCase().includes('coldplay') ||
                  event.title.toLowerCase().includes('tour');
                const distanceKm = calculateDistance(event.venue);

                const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Banner Header */}
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img
                        src={
                          event.bannerUrl ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      {/* Category & Proximity Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-slate-900 shadow-xs">
                          {event.category === 'MOVIE'
                            ? 'Cinema'
                            : event.category === 'CONCERT'
                            ? 'Show'
                            : 'Teatro'}
                        </span>

                        {/* Distance Badge */}
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`}
                          </span>
                        </span>

                        {/* Spotify Indicator Badge */}
                        {isMusic && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1DB954] text-slate-950 shadow-xs flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            <span>Spotify</span>
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isSoldOut ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                            Esgotado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                            {event.availableCapacity} vagas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2b55f5] transition-colors line-clamp-1 mb-1.5">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
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
                            window.open(
                              `https://calendar.google.com/calendar/render?${params.toString()}`,
                              '_blank'
                            );
                          }}
                          className="flex items-center gap-2 hover:text-[#2b55f5] transition cursor-pointer w-fit"
                          title="Adicionar à agenda Google"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#2b55f5] shrink-0" />
                          <span className="capitalize hover:underline">{formattedDate}</span>
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`,
                              '_blank'
                            );
                          }}
                          className="flex items-center gap-2 hover:text-emerald-600 transition cursor-pointer w-fit"
                          title="Ver no Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate hover:underline">{event.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                          A partir de
                        </span>
                        <span className="text-base font-black text-slate-900">
                          R$ {Number(event.price).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                          isSoldOut
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-[#2b55f5] hover:bg-[#1f44d6] text-white active:scale-[0.98]'
                        }`}
                      >
                        <span>{isSoldOut ? 'Esgotado' : 'Garantir'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </div>
  );
};
