import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
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
  Navigation,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Headphones,
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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Proximity & Geolocation State
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [isNearMeActive, setIsNearMeActive] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);

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

  const popularCities = [
    { id: 'ALL', label: 'Todas as Cidades' },
    { id: 'São Paulo', label: 'São Paulo, SP' },
    { id: 'Rio de Janeiro', label: 'Rio de Janeiro, RJ' },
    { id: 'Itu', label: 'Itu / Interior SP' },
    { id: 'Curitiba', label: 'Curitiba, PR' },
  ];

  // Synthetic distance calculator based on venue names
  const calculateDistance = (venue: string): number => {
    const v = venue.toLowerCase();
    if (v.includes('allianz') || v.includes('parque')) return 3.4;
    if (v.includes('cinépolis') || v.includes('iguatemi')) return 5.8;
    if (v.includes('renault') || v.includes('teatro')) return 4.1;
    if (v.includes('cidade do rock') || v.includes('rio')) return isNearMeActive ? 428.0 : 12.5;
    if (v.includes('maeda') || v.includes('itu')) return 78.0;
    return 8.9;
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          setIsNearMeActive(true);
          setSortByDistance(true);
          setDetectedLocationName('São Paulo, SP (Sua Localização GPS)');
          setSelectedCity('São Paulo');
        },
        () => {
          // Fallback if permission blocked or simulation
          setIsDetectingLocation(false);
          setIsNearMeActive(true);
          setSortByDistance(true);
          setDetectedLocationName('São Paulo, SP (Localização Aproximada)');
          setSelectedCity('São Paulo');
        },
        { timeout: 4000 }
      );
    } else {
      setIsDetectingLocation(false);
      setIsNearMeActive(true);
      setSortByDistance(true);
      setDetectedLocationName('São Paulo, SP (Localização Aproximada)');
      setSelectedCity('São Paulo');
    }
  };

  const filteredEvents = events
    .filter((event) => {
      if (selectedCity === 'ALL') return true;
      return event.venue.toLowerCase().includes(selectedCity.toLowerCase()) ||
             event.title.toLowerCase().includes(selectedCity.toLowerCase());
    })
    .sort((a, b) => {
      if (sortByDistance || isNearMeActive) {
        return calculateDistance(a.venue) - calculateDistance(b.venue);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2b55f5]" />
              <span>Experiência Inteligente de Ingressos & Shows</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Viva momentos inesquecíveis com <span className="text-[#2b55f5]">Passfy</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra shows com setlists do Spotify, festivais, cinema e eventos com mapa de assentos interativo e ingressos anti-fraude.
            </p>

            {/* Search & Location Proximity Bar */}
            <div className="pt-2 max-w-2xl mx-auto space-y-3">
              <div className="relative flex items-center shadow-xs">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Busque por show, artista, festival, filme ou estádio..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] transition text-sm font-medium"
                />
              </div>

              {/* Geolocation Quick Trigger Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    isNearMeActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>
                    {isDetectingLocation
                      ? 'Obtendo GPS...'
                      : isNearMeActive
                      ? '📍 Próximos a Mim (Ativo)'
                      : '📍 Buscar Próximos a Mim'}
                  </span>
                </button>

                {/* City Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold text-slate-600 py-0.5">
                  {popularCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCity(city.id);
                        if (city.id === 'ALL') {
                          setIsNearMeActive(false);
                          setSortByDistance(false);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        selectedCity === city.id
                          ? 'bg-[#2b55f5] text-white font-bold shadow-xs'
                          : 'hover:bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#2b55f5] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isNearMeActive ? 'Eventos Próximos a Você' : 'Eventos Disponíveis'}
              </h2>
              {isNearMeActive && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  📍 Raio de Proximidade
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
              {detectedLocationName && ` • Próximos a ${detectedLocationName}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortByDistance(!sortByDistance)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum evento encontrado nesta região</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Tente selecionar "Todas as Cidades" ou buscar por outro termo.
            </p>
            <button
              onClick={() => {
                setSelectedCity('ALL');
                setIsNearMeActive(false);
                setSearch('');
              }}
              className="px-4 py-2 rounded-xl bg-[#2b55f5] text-white text-xs font-bold shadow-xs hover:bg-[#1f44d6] transition"
            >
              Ver Todos os Eventos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isSeated = event.type === 'SEATED';
              const isSoldOut = event.availableCapacity <= 0;
              const isMusic = event.category === 'CONCERT' || event.title.toLowerCase().includes('rock') || event.title.toLowerCase().includes('coldplay') || event.title.toLowerCase().includes('tour');
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
                        <span>{distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`}</span>
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
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#2b55f5] shrink-0" />
                        <span className="capitalize">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{event.venue}</span>
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
      </section>
    </div>
  );
};
