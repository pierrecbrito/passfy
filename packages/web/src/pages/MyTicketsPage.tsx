import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { Ticket, Compass } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  const handleTicketReturned = (updatedTicket: any) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    );
    setSuccessToast(
      'Ingresso devolvido ao estoque com sucesso! A poltrona/vaga foi liberada imediatamente.'
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meus Ingressos</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Apresente o QR Code na portaria do evento ou compartilhe via link digital
            </p>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#2b55f5]" />
            <span>Explorar Mais Eventos</span>
          </button>
        </div>

        {successToast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#2b55f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-medium">Carregando seus ingressos digitais...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 max-w-xl mx-auto">
            <Ticket className="w-14 h-14 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Você ainda não possui ingressos</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Escolha um show, festival ou filme em cartaz e garanta seu lugar em poucos segundos!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 rounded-lg bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-sm font-bold shadow-xs transition cursor-pointer"
            >
              Ver Eventos Disponíveis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onTicketReturned={handleTicketReturned}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
