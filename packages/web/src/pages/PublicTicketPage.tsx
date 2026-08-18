import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { Ticket, ArrowLeft, Shield } from 'lucide-react';

export const PublicTicketPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [ticket, setTicket] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedTicket() {
      setIsLoading(true);
      try {
        const response = await api.get(`/tickets/share/${shareToken}`);
        setTicket(response.data.ticket);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ingresso não encontrado ou link expirado.');
      } finally {
        setIsLoading(false);
      }
    }

    if (shareToken) loadSharedTicket();
  }, [shareToken]);

  return (
    <div className="min-h-[85vh] bg-white py-12 px-4 flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold shadow-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ingresso Compartilhado Verificado</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Visualização de Ingresso Digital</h1>
        {ticket?.user?.name && (
          <p className="text-xs text-slate-500 font-medium">
            Ingresso emitido para <strong className="text-slate-800">{ticket.user.name}</strong>
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-[#2b55f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Carregando ingresso compartilhado...</p>
        </div>
      ) : error || !ticket ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 max-w-md space-y-4 shadow-xs">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ingresso Indisponível</h2>
          <p className="text-xs text-slate-500">{error || 'Não foi possível encontrar o ingresso solicitado.'}</p>
          <Link to="/">
            <button className="px-4 py-2 rounded-lg bg-[#2b55f5] text-white text-xs font-bold shadow-xs">
              Ir para Página Inicial
            </button>
          </Link>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <TicketCard ticket={ticket} isPublicView={true} />
        </div>
      )}

      <div className="text-center pt-4">
        <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Conhecer a plataforma Passfy</span>
        </Link>
      </div>
    </div>
  );
};
