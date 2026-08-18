import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield, User, Camera, Calendar } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'ORGANIZER',
    label: 'Organizador',
    name: 'Carlos',
    email: 'organizador@passfy.com',
    icon: Calendar,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20',
    activeColor: 'bg-purple-600 text-white shadow-glow border-purple-400',
  },
  {
    role: 'CUSTOMER',
    label: 'Cliente 1',
    name: 'Ana',
    email: 'cliente1@passfy.com',
    icon: User,
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20',
    activeColor: 'bg-brand-600 text-white shadow-glow border-brand-400',
  },
  {
    role: 'CUSTOMER',
    label: 'Cliente 2',
    name: 'Bruno',
    email: 'cliente2@passfy.com',
    icon: User,
    color: 'text-sky-400 border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20',
    activeColor: 'bg-sky-600 text-white shadow-glow border-sky-400',
  },
  {
    role: 'GATEKEEPER',
    label: 'Portaria',
    name: 'Lucas',
    email: 'portaria@passfy.com',
    icon: Camera,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20',
    activeColor: 'bg-emerald-600 text-white shadow-glow-emerald border-emerald-400',
  },
];

export const RoleSwitcher: React.FC = () => {
  const { user, switchRoleDemo, isLoading } = useAuth();

  return (
    <div className="bg-surface-300 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Ambiente de Demonstração / Avaliação:</span>
          <span className="text-slate-300 font-semibold">Alternar Perfil em 1 Clique</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const isActive = user?.email === account.email;

            return (
              <button
                key={account.email}
                onClick={() => switchRoleDemo(account.email)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  isActive ? account.activeColor : account.color
                }`}
                title={`Alternar para ${account.name} (${account.email})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{account.label}</span>
                <span className="opacity-75">({account.name})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
