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
    { id: 'MOVIE', label: 'Cinema & Filmes', icon: Film },
    { id: 'CONCERT', label: 'Shows & Festivais', icon: Music },
    { id: 'THEATER', label: 'Teatro & Cultura', icon: Drama },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-surface-300 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Experiência Premium de Ingressos Digitais</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Viva momentos inesquecíveis com <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">Passfy</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400">
              Escolha seus lugares favoritos no mapa de assentos interativo, realize pagamento simulado e receba ingressos com QR Code criptográfico anti-fraude.
            </p>

            {/* Search & Filter Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Busque por filme, show, festival ou local..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition shadow-2xl"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-glow border border-brand-400'
                        : 'bg-surface-100 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Eventos Disponíveis
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-surface-100/50 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-surface-100/40 rounded-3xl border border-slate-800">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Nenhum evento encontrado</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Tente buscar por outros termos ou explore todas as categorias disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isSeated = event.type === 'SEATED';
              const isSoldOut = event.availableCapacity <= 0;
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
                  className="glass-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  {/* Banner Header */}
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={
                        event.bannerUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-200 via-surface-200/20 to-transparent" />

                    {/* Category & Type Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="primary" size="sm">
                        {event.category === 'MOVIE'
                          ? 'Cinema'
                          : event.category === 'CONCERT'
                          ? 'Show'
                          : 'Teatro'}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {isSeated ? 'Assentos Marcados' : 'Pista'}
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isSoldOut ? (
                        <Badge variant="danger" size="sm">
                          Esgotado
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {event.availableCapacity} disponíveis
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="capitalize">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 py-4 bg-surface-300/60 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        A partir de
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        R$ {Number(event.price).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      variant={isSoldOut ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={isSoldOut}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {isSoldOut ? 'Esgotado' : 'Garantir'}
                    </Button>
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
