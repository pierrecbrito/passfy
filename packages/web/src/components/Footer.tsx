import React from 'react';
import { Ticket, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 mt-20 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2b55f5] flex items-center justify-center text-white shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 tracking-tight">Passfy</p>
              <p className="text-xs text-slate-500">Plataforma de Ingressos & Eventos Digitais</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>QR Code Criptografado (HMAC-SHA256)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Sparkles className="w-4 h-4 text-[#2b55f5]" />
              <span>Concorrência Atômica com Row-Lock</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Ticket className="w-4 h-4 text-cyan-600" />
              <span>Ticketmaster Discovery API v2</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Desenvolvido com excelência para o <strong className="text-slate-800 font-semibold">Desafio Elite Dev (Verzel)</strong> por Pierre Brito.
          </p>
        </div>
      </div>
    </footer>
  );
};
