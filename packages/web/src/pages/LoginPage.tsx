import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Ticket,
  Film,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

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
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="h-screen min-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-4 gap-4 sm:gap-6 shadow-none border-none relative overflow-hidden select-none selection:bg-indigo-600 selection:text-white">
      {/* Botão Superior para Retorno à Loja */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition shadow-sm"
        title="Voltar para o catálogo de eventos"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar ao Início</span>
      </Link>

      {/* Coluna Esquerda: Painel Visual Azul com Animação da Fila de Ingressos */}
      <div className="lg:col-span-6 h-full relative rounded-[2rem] overflow-hidden min-h-[440px] flex flex-col justify-between p-8 sm:p-10 lg:p-12 select-none bg-gradient-to-br from-[#204bee] via-[#2f5af6] to-[#0f2182]">
        
        {/* Luzes de fundo com blur fluido */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-300/35 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a165c]/80 via-transparent to-black/10 pointer-events-none" />

        {/* Cabeçalho da Marca & Frase de Impacto */}
        <div className="relative z-10 space-y-3 pt-10 lg:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Passfy Tickets</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-blue-100/90 tracking-wide">
              Experiência Inteligente de Ingressos
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-white leading-[1.18] tracking-tight drop-shadow-sm max-w-lg">
              Acelere suas vendas e garanta seu lugar nos melhores eventos
            </h2>
          </div>
        </div>

        {/* Fila / Stack Animada de Ingressos Translúcidos (Fade Up Escalonado) */}
        <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md relative space-y-[-24px]">
            
            {/* Card 3 (Último da Fila - Mais transparente e recuado) */}
            <div className="animate-ticket-3 w-full rounded-2xl p-3.5 bg-white/[0.07] backdrop-blur-sm border border-white/10 text-white/70 shadow-lg transform transition scale-[0.90] origin-bottom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/60">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/80">Coldplay — Music of the Spheres</p>
                    <p className="text-[9px] text-white/50">Setor Leste VIP • Fila C-12 • R$ 380,00</p>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-semibold">
                  #PAS-8921
                </span>
              </div>
            </div>

            {/* Card 2 (Meio da Fila - Semi-transparente) */}
            <div className="animate-ticket-2 w-full rounded-2xl p-4 bg-white/[0.14] backdrop-blur-md border border-white/20 text-white/90 shadow-xl transform transition scale-[0.95] origin-bottom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-cyan-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Rock World Festival 2026</p>
                    <p className="text-[10px] text-blue-100/70">Pista Premium • Portão 03 • R$ 220,00</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 font-semibold">
                  🟢 Confirmado
                </span>
              </div>
            </div>

            {/* Card 1 (Frente da Fila - Mais Nítido, Destaque com QR e Código de Barras) */}
            <div className="animate-ticket-1 w-full rounded-2xl p-4 sm:p-5 bg-white/[0.22] backdrop-blur-xl border border-white/35 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Entrada Liberada
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Duna: Parte 2 — Sessão IMAX VIP
                  </h4>
                  <p className="text-xs text-blue-100/80 mt-0.5">
                    Poltrona B-04 • Sala 01 • R$ 45,00
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md shadow-sm shrink-0">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Linha Divisória de Cupom */}
              <div className="border-t border-dashed border-white/25 my-2.5" />

              <div className="flex items-center justify-between text-[11px] text-white/90">
                <span className="font-mono tracking-wider font-bold">PAS-DEMO1</span>
                <span className="flex items-center gap-1 text-emerald-300 font-semibold text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Assinatura HMAC-SHA256
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé de Parceiros com TicketMaster Discovery e Logos Reais */}
        <div className="relative z-10 pt-4 border-t border-white/15">
          <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider mb-3">
            Parceiros & Integrações Oficiais
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90 text-xs font-bold">
            
            {/* Ticketmaster Discovery */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-white shadow-sm hover:bg-white/25 transition">
              <Ticket className="w-4 h-4 text-cyan-300" />
              <span>Ticketmaster Discovery</span>
            </div>

            {/* TMDb */}
            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <Film className="w-4 h-4 text-cyan-300" />
              <span>TMDb API</span>
            </div>

            {/* Apple Wallet Style */}
            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.97.04-2.14.65-2.83 1.45-.6.69-1.13 1.83-.99 2.94 1.08.08 2.18-.47 2.83-1.29z" />
              </svg>
              <span>Apple Wallet</span>
            </div>

            {/* HMAC-SHA256 */}
            <div className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>HMAC-SHA256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Formulário Limpo, Traduzido e Centralizado (max 500px) */}
      <div className="lg:col-span-6 h-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-6 bg-white overflow-y-auto">
        <div className="w-full max-w-[500px] space-y-5 mx-auto">
          {/* Cabeçalho */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Acesse sua Conta' : 'Crie sua Conta'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {mode === 'LOGIN'
                ? 'Entre com seus dados para gerenciar ingressos ou publicar eventos.'
                : 'Preencha suas informações para começar a comprar e criar eventos.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail corporativo ou pessoal</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Senha de Acesso</label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() =>
                      alert('Dica de demonstração: A senha padrão de todas as contas semeadas é "password123".')
                    }
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Perfil</label>
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
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        role === p.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checkbox de Termos */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs text-slate-600 cursor-pointer select-none">
                Li e concordo com os <span className="text-slate-900 font-bold underline">Termos & Privacidade</span>
              </label>
            </div>

            {/* Botão Principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2b55f5] hover:bg-[#1f44d6] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-none transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : mode === 'LOGIN' ? 'Entrar na Plataforma' : 'Criar Minha Conta'}
            </button>
          </form>

          {/* Alternar entre Login e Cadastro */}
          <div className="text-center text-xs text-slate-600">
            {mode === 'LOGIN' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('REGISTER');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition"
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
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition"
                >
                  Faça login aqui
                </button>
              </p>
            )}
          </div>

          {/* Divisor */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Ou acesse com
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Logins Sociais */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickFill('cliente1@passfy.com')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-none"
              title="Entrar como Cliente 1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('organizador@passfy.com')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-none"
              title="Entrar como Organizador"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.97.04-2.14.65-2.83 1.45-.6.69-1.13 1.83-.99 2.94 1.08.08 2.18-.47 2.83-1.29z" />
              </svg>
              <span>Continuar com Apple</span>
            </button>
          </div>

          {/* Pílulas de Preenchimento Rápido para o Avaliador */}
          <div className="pt-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center mb-1.5">
              Preenchimento Rápido para Avaliação:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('organizador@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 transition shadow-none"
              >
                🎪 Organizador
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente1@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition shadow-none"
              >
                👤 Cliente 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente2@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold hover:bg-sky-100 transition shadow-none"
              >
                👤 Cliente 2
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('portaria@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition shadow-none"
              >
                📷 Portaria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
