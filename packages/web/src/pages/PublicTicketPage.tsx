import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-[85vh] py-12 px-4 flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ingresso Compartilhado Verificado</span>
        </div>
        <h1 className="text-2xl font-black text-white">Visualização de Ingresso</h1>
        {ticket?.user?.name && (
          <p className="text-xs text-slate-400">
            Ingresso emitido para <strong className="text-slate-200">{ticket.user.name}</strong>
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Carregando ingresso compartilhado...</p>
        </div>
      ) : error || !ticket ? (
        <div className="text-center py-16 bg-surface-100/40 rounded-3xl border border-slate-800 p-8 max-w-md space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Ingresso Indisponível</h2>
          <p className="text-xs text-slate-400">{error || 'Não foi possível encontrar o ingresso solicitado.'}</p>
          <Link to="/">
            <Button variant="primary" size="sm">
              Ir para Página Inicial
            </Button>
          </Link>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <TicketCard ticket={ticket} isPublicView={true} />
        </div>
      )}

      <div className="text-center pt-4">
        <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Conhecer a plataforma Passfy</span>
        </Link>
      </div>
    </div>
  );
};
