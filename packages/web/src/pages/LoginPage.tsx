import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Ticket,
  Film,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  Music,
} from 'lucide-react';

interface AnimatedTicketItem {
  id: number;
  code: string;
  status: string;
  statusColor: string;
  title: string;
  subtitle: string;
  icon: 'film' | 'music' | 'zap' | 'ticket';
  price: string;
}

const TICKET_QUEUE: AnimatedTicketItem[] = [
  {
    id: 1,
    code: 'PAS-DEMO1',
    status: 'Entrada Liberada',
    statusColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    title: 'Duna: Parte 2 — IMAX VIP',
    subtitle: 'Poltrona B-04 • Sala 01 VIP',
    icon: 'film',
    price: 'R$ 45,00',
  },
  {
    id: 2,
    code: 'PAS-ROCK26',
    status: 'Confirmado',
    statusColor: 'text-blue-700 bg-blue-100 border-blue-300',
    title: 'Rock World Festival 2026',
    subtitle: 'Pista Premium • Portão 03',
    icon: 'zap',
    price: 'R$ 220,00',
  },
  {
    id: 3,
    code: 'PAS-COLD88',
    status: 'VIP Pass',
    statusColor: 'text-purple-700 bg-purple-100 border-purple-300',
    title: 'Coldplay: Music of the Spheres',
    subtitle: 'Setor Leste VIP • Fila C-12',
    icon: 'music',
    price: 'R$ 380,00',
  },
  {
    id: 4,
    code: 'PAS-ALN09',
    status: 'Pré-Estreia',
    statusColor: 'text-amber-700 bg-amber-100 border-amber-300',
    title: 'Alien: Romulus — Dolby Atmos 3D',
    subtitle: 'Poltrona F-08 • Sala 04',
    icon: 'film',
    price: 'R$ 52,00',
  },
  {
    id: 5,
    code: 'PAS-TML26',
    status: 'Acesso Total',
    statusColor: 'text-pink-700 bg-pink-100 border-pink-300',
    title: 'Tomorrowland Brasil — Mainstage',
    subtitle: 'Camarote Exclusivo • Entrada VIP',
    icon: 'ticket',
    price: 'R$ 750,00',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'REGISTER' : 'LOGIN';

  const { login, register } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('cliente1@passfy.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'CUSTOMER' | 'ORGANIZER' | 'GATEKEEPER'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado da Fila de Ingressos Subindo Continuamente
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQueueIndex((prev) => (prev + 1) % TICKET_QUEUE.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleLogin = () => {
    setToastMessage('A autenticação com Google ainda não foi implementada.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="h-screen min-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-4 gap-4 sm:gap-6 shadow-none border-none relative overflow-hidden select-none selection:bg-[#2b55f5] selection:text-white">
      
      {/* Coluna Esquerda: Painel Azul Sóbrio com Fila Contínua de Ingressos */}
      <div className="lg:col-span-6 h-full relative rounded-[2rem] overflow-hidden min-h-[440px] flex flex-col justify-between p-8 sm:p-12 lg:p-14 select-none bg-gradient-to-br from-[#1738b5] via-[#12288a] to-[#0a144a]">
        
        {/* Cabeçalho com espaçamento generoso do topo e tipografia de alto impacto */}
        <div className="relative z-10 space-y-3 pt-8 sm:pt-12 lg:pt-16">
          <p className="text-xs sm:text-sm font-medium text-blue-200 tracking-wide">
            Experiência Inteligente de Ingressos
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] xl:text-[52px] font-black text-white leading-[1.12] tracking-tight drop-shadow-sm max-w-xl">
            Acelere suas vendas e garanta seu lugar nos melhores eventos
          </h2>
        </div>

        {/* Fila Contínua de Ingressos Mais Brancos e Nítidos */}
        <div className="relative z-10 my-auto py-2 w-full max-w-md mx-auto">
          <div className="h-[250px] sm:h-[260px] relative flex items-center justify-center">
            {TICKET_QUEUE.map((ticket, index) => {
              const offset = (index - activeQueueIndex + TICKET_QUEUE.length) % TICKET_QUEUE.length;
              let styleClasses = 'opacity-0 scale-75 translate-y-36 pointer-events-none z-0';

              if (offset === 0) {
                styleClasses = 'opacity-100 scale-100 translate-y-0 z-30 bg-white/95 text-slate-900 shadow-2xl border-white/80 backdrop-blur-md';
              } else if (offset === 1) {
                styleClasses = 'opacity-75 scale-[0.93] translate-y-10 z-20 bg-white/70 text-slate-800 shadow-xl border-white/50 backdrop-blur-md';
              } else if (offset === 2) {
                styleClasses = 'opacity-45 scale-[0.86] translate-y-20 z-10 bg-white/45 text-slate-700 shadow-md border-white/30 backdrop-blur-sm';
              } else if (offset === TICKET_QUEUE.length - 1) {
                styleClasses = 'opacity-0 scale-[1.04] -translate-y-14 z-40 bg-white/95 text-slate-900 pointer-events-none';
              }

              return (
                <div
                  key={ticket.id}
                  className={`absolute w-full rounded-2xl p-4 sm:p-5 border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${styleClasses}`}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${ticket.statusColor}`}>
                          {ticket.status}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#2b55f5]">
                          {ticket.price}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 pt-1">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {ticket.subtitle}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shadow-sm shrink-0">
                      <QrCode className="w-6 h-6 text-slate-900" />
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-300 my-2" />

                  <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                    <span className="font-mono tracking-wider font-bold text-slate-900">{ticket.code}</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Assinatura HMAC-SHA256
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé de Parceiros */}
        <div className="relative z-10 pt-4 border-t border-white/15">
          <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider mb-2.5">
            Parceiros & Integrações Oficiais
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-white shadow-sm hover:bg-white/25 transition">
              <Ticket className="w-4 h-4 text-cyan-300" />
              <span>Ticketmaster Discovery</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <Film className="w-4 h-4 text-cyan-300" />
              <span>TMDb API</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.97.04-2.14.65-2.83 1.45-.6.69-1.13 1.83-.99 2.94 1.08.08 2.18-.47 2.83-1.29z" />
              </svg>
              <span>Apple Wallet</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>HMAC-SHA256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Formulário em Português com Tom Azul e Espaçamento Harmonioso */}
      <div className="lg:col-span-6 h-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[420px] mx-auto">
          
          {/* Badge / Brand Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2b55f5] to-[#12288a] flex items-center justify-center text-white shadow-sm">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Passfy Ingressos</span>
          </div>

          {/* Título & Subtítulo */}
          <div className="space-y-1.5 mb-7">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Acesse sua conta' : 'Criar conta'}
            </h1>
            <p className="text-sm text-slate-500 font-normal">
              {mode === 'LOGIN'
                ? 'Bem-vindo de volta! Por favor, insira seus dados.'
                : 'Seja bem-vindo! Preencha seus dados para continuar.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário com Espaçamento Harmonioso e Cor Azul */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome completo:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2b55f5] focus:ring-4 focus:ring-blue-100 transition shadow-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2b55f5] focus:ring-4 focus:ring-blue-100 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2b55f5] focus:ring-4 focus:ring-blue-100 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Perfil:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CUSTOMER', label: 'Cliente' },
                    { id: 'ORGANIZER', label: 'Organizador' },
                    { id: 'GATEKEEPER', label: 'Portaria' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRole(p.id as any)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                        role === p.id
                          ? 'bg-[#2b55f5] text-white border-[#2b55f5] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Linha de Lembrar por 30 dias & Esqueci a Senha */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2b55f5] focus:ring-[#2b55f5] cursor-pointer"
                />
                <span>Lembrar por 30 dias</span>
              </label>

              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() =>
                    alert('Dica de demonstração: A senha padrão de todas as contas semeadas é "password123".')
                  }
                  className="text-sm font-semibold text-[#2b55f5] hover:text-[#1f44d6] transition"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>

            {/* Botão de Ação Primário com a Cor Azul Original */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2b55f5] hover:bg-[#1f44d6] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Autenticando...' : mode === 'LOGIN' ? 'Entrar na Plataforma' : 'Criar Minha Conta'}
            </button>
          </form>

          {/* Botão Social Google com Toast Informativo */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-3 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition shadow-xs active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Entrar com Google</span>
          </button>

          {/* Alternar entre Login e Cadastro */}
          <div className="text-center text-sm text-slate-500 mt-6">
            {mode === 'LOGIN' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('REGISTER');
                  }}
                  className="text-[#2b55f5] hover:text-[#1f44d6] font-semibold transition"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="text-[#2b55f5] hover:text-[#1f44d6] font-semibold transition"
                >
                  Faça login aqui
                </button>
              </p>
            )}
          </div>

          {/* Preenchimento Rápido para Avaliação */}
          <div className="mt-7 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-center mb-2">
              Preenchimento Rápido para Avaliação:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('organizador@passfy.com')}
                className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 transition shadow-none"
              >
                🎪 Organizador
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente1@passfy.com')}
                className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition shadow-none"
              >
                👤 Cliente 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente2@passfy.com')}
                className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold hover:bg-sky-100 transition shadow-none"
              >
                👤 Cliente 2
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('portaria@passfy.com')}
                className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition shadow-none"
              >
                📷 Portaria
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-sm shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="font-medium text-slate-100">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold transition p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
