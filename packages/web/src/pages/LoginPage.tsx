import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Ticket,
  Film,
  Music,
  Shield,
  Layers,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'REGISTER' : 'LOGIN';

  const { login, register, switchRoleDemo } = useAuth();

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
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-surface-100/90 border border-slate-800/90 rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-4 gap-4 backdrop-blur-xl">
        
        {/* Left Column: Visual Fluid Aurora Banner */}
        <div className="lg:col-span-6 relative rounded-[1.75rem] overflow-hidden min-h-[460px] lg:min-h-[620px] flex flex-col justify-between p-8 sm:p-10 select-none bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-950">
          
          {/* Animated Background Mesh & Light Blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-indigo-400/35 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-black/20 pointer-events-none" />

          {/* Top Brand Tagline */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Passfy Experience</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-cyan-200 uppercase tracking-wider">
                Tudo em um único lugar
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                Speed up your experience with our Web App
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/80 pt-2 leading-relaxed max-w-sm">
                Reserve assentos em tempo real, emita ingressos protegidos com QR Code criptográfico e faça check-in instantâneo na portaria.
              </p>
            </div>
          </div>

          {/* Bottom Partners / Tech Stack Badges */}
          <div className="relative z-10 pt-8 border-t border-white/15">
            <p className="text-[11px] font-semibold text-blue-200/70 uppercase tracking-wider mb-3">
              Tecnologias & Integrações
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90 text-xs font-semibold">
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <Film className="w-4 h-4 text-cyan-300" />
                <span>TMDb API</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <Shield className="w-4 h-4 text-emerald-300" />
                <span>HMAC-SHA256</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <Layers className="w-4 h-4 text-indigo-300" />
                <span>PostgreSQL</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <Ticket className="w-4 h-4 text-purple-300" />
                <span>Apple Wallet Style</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mode === 'LOGIN' ? 'Get Started Now' : 'Create Your Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {mode === 'LOGIN'
                ? 'Please log in to your account to continue.'
                : 'Fill in your details to start booking and managing events.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="workmail@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() =>
                      alert('Dica de demonstração: Utilize a senha "password123" para todas as contas de teste!')
                    }
                    className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Perfil da Conta</label>
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
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                        role === p.id
                          ? 'bg-brand-600 text-white border-brand-400 shadow-glow'
                          : 'bg-surface-200 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-surface-200 text-brand-600 focus:ring-brand-500 focus:ring-offset-background"
              />
              <label htmlFor="agree" className="text-xs text-slate-400 cursor-pointer select-none">
                I agree to the <span className="text-slate-200 font-semibold underline">Terms & Privacy</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white font-bold py-3.5 shadow-glow"
              isLoading={isLoading}
            >
              {mode === 'LOGIN' ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-slate-400">
            {mode === 'LOGIN' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('REGISTER');
                  }}
                  className="text-brand-400 hover:text-brand-300 font-bold transition"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="text-brand-400 hover:text-brand-300 font-bold transition"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-surface-100 px-3 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
              Or
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickFill('cliente1@passfy.com')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700/80 bg-surface-200/70 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition"
              title="Preencher com Cliente 1"
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
              <span>Login with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('organizador@passfy.com')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700/80 bg-surface-200/70 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition"
              title="Preencher com Organizador"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.97.04-2.14.65-2.83 1.45-.6.69-1.13 1.83-.99 2.94 1.08.08 2.18-.47 2.83-1.29z" />
              </svg>
              <span>Login with Apple</span>
            </button>
          </div>

          {/* Quick Demo Pre-fill Pill Helpers */}
          <div className="pt-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold text-center mb-2">
              Preenchimento Rápido para Avaliação:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('organizador@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-medium hover:bg-purple-500/20 transition"
              >
                🎪 Organizador
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente1@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-medium hover:bg-brand-500/20 transition"
              >
                👤 Cliente 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente2@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] font-medium hover:bg-sky-500/20 transition"
              >
                👤 Cliente 2
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('portaria@passfy.com')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium hover:bg-emerald-500/20 transition"
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
