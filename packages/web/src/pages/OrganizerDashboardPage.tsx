import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Calendar,
  PlusCircle,
  DollarSign,
  Users,
  Eye,
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Painel do Organizador
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Acompanhe o desempenho em tempo real das suas vendas e lotação
            </p>
          </div>

          <button
            onClick={() => navigate('/organizer/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Novo Evento</span>
          </button>
        </div>

        {/* Metrics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2b55f5]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Total de Eventos
              </p>
              <p className="text-2xl font-black text-slate-900">{events.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Ingressos Vendidos
              </p>
              <p className="text-2xl font-black text-slate-900">{totalTicketsSold}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Receita Acumulada
              </p>
              <p className="text-2xl font-black text-slate-900">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Events Table / Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Eventos Publicados</h2>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500 font-medium">Carregando eventos...</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-slate-900">Nenhum evento publicado ainda.</p>
              <p className="text-xs text-slate-500 mt-1">
                Comece importando um show do Ticketmaster ou filme do TMDb!
              </p>
              <button
                className="mt-4 px-4 py-2 rounded-lg bg-[#2b55f5] text-white text-xs font-bold shadow-xs"
                onClick={() => navigate('/organizer/create')}
              >
                Criar Primeiro Evento
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((event) => {
                const occupancy = Math.round(
                  ((event.ticketsSold || 0) / (event.capacity || 1)) * 100
                );

                return (
                  <div
                    key={event.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          event.bannerUrl ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{event.title}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {event.type === 'SEATED' ? 'Assentos' : 'Pista'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {event.venue} • {new Date(event.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Occupancy and Sales stats */}
                    <div className="flex items-center gap-8 text-xs font-medium">
                      <div>
                        <p className="text-slate-500">Preço</p>
                        <p className="font-bold text-slate-900 text-sm">
                          R$ {Number(event.price).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Ocupação</p>
                        <p className="font-bold text-slate-900 text-sm">
                          {event.ticketsSold || 0} / {event.capacity} ({occupancy}%)
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
                      >
                        <span>Ver Página</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
