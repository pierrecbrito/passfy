import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
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
    <div className="min-h-screen h-screen w-full flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#f1f3f7] selection:bg-indigo-600 selection:text-white">
      {/* Outer Floating Split Card */}
      <div className="w-full max-w-6xl h-full lg:h-[92vh] max-h-[900px] bg-white rounded-[2.25rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-4 gap-4 border border-slate-200/80 relative">
        
        {/* Top Left Return to Store Button */}
        <Link
          to="/"
          className="absolute top-6 left-6 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition shadow-md"
          title="Voltar para a página inicial"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Início</span>
        </Link>

        {/* Left Column: Visual Fluid Aurora Banner */}
        <div className="lg:col-span-6 relative rounded-[1.85rem] overflow-hidden min-h-[380px] lg:h-full flex flex-col justify-between p-8 sm:p-12 select-none bg-gradient-to-br from-[#2b55f5] via-[#3b65f7] to-[#12289c] shadow-lg">
          
          {/* Animated Background Mesh & Fluid Light Blobs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-300/35 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1e79]/70 via-transparent to-black/15 pointer-events-none" />

          {/* Top Brand Tagline */}
          <div className="relative z-10 space-y-4 pt-12 lg:pt-8">
            <p className="text-xs sm:text-sm font-medium text-blue-100/90 tracking-wide">
              You can easily
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-[1.18] tracking-tight drop-shadow-sm">
              Speed up your work with our Web App
            </h2>
          </div>

          {/* Bottom Partners Section with Matching Icons */}
          <div className="relative z-10 pt-6">
            <p className="text-[11px] font-semibold text-blue-200/80 tracking-wider mb-4">
              Our partners
            </p>
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-white/80 text-xs font-bold">
              {/* Discord */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
                <span>Discord</span>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </div>

              {/* Spotify */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.092-.807-.16-.899-.562-.092-.403.16-.807.562-.899 4.568-1.044 8.502-.601 11.64 1.341.353.216.464.674.247 1.027zm1.466-3.26c-.271.44-.848.579-1.288.308-3.22-1.979-8.128-2.552-11.936-1.395-.497.151-1.027-.134-1.178-.631-.151-.497.134-1.027.631-1.178 4.357-1.322 9.776-.682 13.463 1.583.44.271.579.848.308 1.288zm.126-3.41c-3.861-2.293-10.231-2.505-13.918-1.385-.591.18-1.218-.158-1.398-.749-.18-.591.158-1.218.749-1.398 4.237-1.286 11.272-1.042 15.719 1.598.531.315.704 1.002.389 1.533-.315.531-1.002.704-1.541.401z" />
                </svg>
                <span>Spotify</span>
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </div>

              {/* TikTok */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                <span>TikTok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Form Panel */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-10 lg:px-12 py-6 space-y-5 bg-white text-slate-800 overflow-y-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Get Started Now' : 'Create Your Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {mode === 'LOGIN'
                ? 'Please log in to your account to continue.'
                : 'Please fill in your account details to continue.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="workmail@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() =>
                      alert('Dica de demonstração: Utilize a senha "password123" para todas as contas de teste!')
                    }
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Forgot Password?
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
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perfil da Conta</label>
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
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="agree" className="text-xs text-slate-600 cursor-pointer select-none">
                Agree to the <span className="text-slate-900 font-bold underline">Terms & Privacy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2b55f5] hover:bg-[#1f44d6] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : mode === 'LOGIN' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-slate-600">
            {mode === 'LOGIN' ? (
              <p>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('REGISTER');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition"
                >
                  Signup
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold">
              Or
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickFill('cliente1@passfy.com')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-sm"
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
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-sm"
              title="Preencher com Organizador"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.97.04-2.14.65-2.83 1.45-.6.69-1.13 1.83-.99 2.94 1.08.08 2.18-.47 2.83-1.29z" />
              </svg>
              <span>Login with Apple</span>
            </button>
          </div>

          {/* Quick Demo Pre-fill Pill Helpers */}
          <div className="pt-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center mb-1.5">
              Preenchimento Rápido para Avaliação:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('organizador@passfy.com')}
                className="px-2.5 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 transition"
              >
                🎪 Organizador
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente1@passfy.com')}
                className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition"
              >
                👤 Cliente 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cliente2@passfy.com')}
                className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold hover:bg-sky-100 transition"
              >
                👤 Cliente 2
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('portaria@passfy.com')}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition"
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
