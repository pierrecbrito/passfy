import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  PlusCircle,
  Ticket,
  DollarSign,
  Users,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEvents() {
      try {
        const response = await api.get('/events/organizer/my-events');
        setEvents(response.data.events || []);
      } catch (err) {
        console.error('Failed to load organizer events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyEvents();
  }, []);

  const totalRevenue = events.reduce(
    (acc, ev) => acc + Number(ev.price) * (ev.ticketsSold || 0),
    0
  );
  const totalTicketsSold = events.reduce((acc, ev) => acc + (ev.ticketsSold || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Painel do Organizador
          </h1>
          <p className="text-sm text-slate-400">
            Acompanhe o desempenho das suas sessões e publicações
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/organizer/create')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Novo Evento
        </Button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total de Eventos
            </p>
            <p className="text-2xl font-extrabold text-white">{events.length}</p>
          </div>
        </div>

        <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Ingressos Vendidos
            </p>
            <p className="text-2xl font-extrabold text-white">{totalTicketsSold}</p>
          </div>
        </div>

        <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Receita Simulada
            </p>
            <p className="text-2xl font-extrabold text-white">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Events Table / Cards */}
      <div className="bg-surface-100 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Eventos Publicados</h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-white">Nenhum evento publicado ainda.</p>
            <p className="text-xs text-slate-400 mt-1">
              Comece importando um filme do TMDb ou crie um evento de show!
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/organizer/create')}
            >
              Criar Primeiro Evento
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {events.map((event) => {
              const occupancy = Math.round(
                ((event.ticketsSold || 0) / (event.capacity || 1)) * 100
              );

              return (
                <div
                  key={event.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-200/40 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        event.bannerUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={event.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{event.title}</h3>
                        <Badge variant="neutral" size="sm">
                          {event.type === 'SEATED' ? 'Assentos' : 'Pista'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {event.venue} • {new Date(event.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Occupancy and Sales stats */}
                  <div className="flex items-center gap-8 text-xs">
                    <div>
                      <p className="text-slate-400">Preço</p>
                      <p className="font-bold text-white text-sm">
                        R$ {Number(event.price).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Ocupação</p>
                      <p className="font-bold text-white text-sm">
                        {event.ticketsSold || 0} / {event.capacity} ({occupancy}%)
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/event/${event.id}`)}
                      rightIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Ver Página
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
