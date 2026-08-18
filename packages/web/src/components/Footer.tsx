import React from 'react';
import { Ticket, Github, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-surface-300 py-10 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">Passfy</p>
              <p className="text-xs text-slate-400">Plataforma de Ingressos & Eventos</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>QR Code Criptografado (HMAC-SHA256)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Concorrência Atômica com Row-Lock</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Desenvolvido para o <strong className="text-slate-200 font-semibold">Desafio Elite Dev (Verzel)</strong> por Pierre Brito.
          </p>
        </div>
      </div>
    </footer>
  );
};
