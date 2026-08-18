import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, User, Camera, Calendar } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'ORGANIZER',
    label: 'Organizador',
    name: 'Carlos',
    email: 'organizador@passfy.com',
    icon: Calendar,
    color: 'text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100',
    activeColor: 'bg-purple-600 text-white shadow-xs border-purple-600 font-bold',
  },
  {
    role: 'CUSTOMER',
    label: 'Cliente 1',
    name: 'Ana',
    email: 'cliente1@passfy.com',
    icon: User,
    color: 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100',
    activeColor: 'bg-[#2b55f5] text-white shadow-xs border-[#2b55f5] font-bold',
  },
  {
    role: 'CUSTOMER',
    label: 'Cliente 2',
    name: 'Bruno',
    email: 'cliente2@passfy.com',
    icon: User,
    color: 'text-sky-700 border-sky-200 bg-sky-50 hover:bg-sky-100',
    activeColor: 'bg-sky-600 text-white shadow-xs border-sky-600 font-bold',
  },
  {
    role: 'GATEKEEPER',
    label: 'Portaria',
    name: 'Lucas',
    email: 'portaria@passfy.com',
    icon: Camera,
    color: 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    activeColor: 'bg-emerald-600 text-white shadow-xs border-emerald-600 font-bold',
  },
];

export const RoleSwitcher: React.FC = () => {
  const { user, switchRoleDemo, isLoading } = useAuth();

  return (
    <div className="bg-slate-50 border-b border-slate-200/90 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">Ambiente de Avaliação:</span>
          <span className="text-slate-800 font-semibold">Alternar Perfil em 1 Clique</span>
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
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
