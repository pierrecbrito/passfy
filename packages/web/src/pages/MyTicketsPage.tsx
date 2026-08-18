import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { Button } from '../components/ui/Button';
import { Ticket, Compass, Sparkles } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTickets() {
      try {
        const response = await api.get('/tickets/me');
        setTickets(response.data.tickets || []);
      } catch (err) {
        console.error('Failed to load my tickets:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyTickets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Meus Ingressos</h1>
          <p className="text-sm text-slate-400">
            Apresente o QR Code na entrada do evento ou compartilhe via link
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/')}
          leftIcon={<Compass className="w-4 h-4" />}
        >
          Explorar Mais Eventos
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Carregando seus ingressos...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-surface-100/40 rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto">
          <Ticket className="w-14 h-14 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Você ainda não possui ingressos</h3>
          <p className="text-sm text-slate-400">
            Escolha um filme ou festival em cartaz e garanta seu lugar em poucos cliques!
          </p>
          <Button variant="primary" onClick={() => navigate('/')} className="mt-2">
            Ver Eventos em Cartaz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};
