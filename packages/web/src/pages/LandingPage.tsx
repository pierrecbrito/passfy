import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  QrCode,
  ShieldCheck,
  BarChart3,
  Zap,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Lock,
  Smartphone,
  ScanLine,
  Music,
  Film,
  Drama,
  Users,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Utility: useInView hook for scroll animations
// ─────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─────────────────────────────────────────────
// AnimatedSection wrapper
// ─────────────────────────────────────────────
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const { ref, inView } = useInView();

  const transforms: Record<string, string> = {
    up: 'translateY(40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    fade: 'scale(0.96)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : transforms[direction],
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// Floating ticket card used in Hero
// ─────────────────────────────────────────────
const FloatingTicket: React.FC<{
  title: string;
  venue: string;
  date: string;
  price: string;
  color: string;
  className?: string;
}> = ({ title, venue, date, price, color, className = '' }) => (
  <div
    className={`absolute bg-white rounded-2xl border border-slate-200 shadow-lg p-4 w-52 select-none ${className}`}
  >
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
      <Ticket className="w-4 h-4 text-white" />
    </div>
    <p className="text-xs font-black text-slate-900 leading-tight truncate">{title}</p>
    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{venue}</p>
    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dashed border-slate-200">
      <span className="text-[10px] text-slate-500 font-medium">{date}</span>
      <span className="text-xs font-black text-[#2b55f5]">{price}</span>
    </div>
    <div className="mt-2 flex items-center gap-1">
      <div className="w-full h-1 rounded-full bg-slate-100">
        <div className={`h-1 rounded-full ${color} w-3/4`} />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: QrCode,
      color: 'bg-blue-600',
      title: 'QR Code Criptográfico',
      desc: 'Cada ingresso possui um token HMAC-SHA256 único — impossível de duplicar, forjar ou revender.',
    },
    {
      icon: ScanLine,
      color: 'bg-emerald-600',
      title: 'Validação em Tempo Real',
      desc: 'Portaria inteligente com câmera ou digitação manual. Feedback visual e sonoro instantâneo.',
    },
    {
      icon: Layers,
      color: 'bg-violet-600',
      title: 'Mapa de Assentos Interativo',
      desc: 'Escolha sua poltrona em um mapa visual preciso. Assento bloqueado em segundos após seleção.',
    },
    {
      icon: Globe2,
      color: 'bg-amber-600',
      title: 'Catálogo Ticketmaster',
      desc: 'Importação direta da API oficial Ticketmaster Discovery v2. Preencha eventos com 1 clique.',
    },
    {
      icon: BarChart3,
      color: 'bg-rose-600',
      title: 'Dashboard do Organizador',
      desc: 'Métricas de vendas, taxa de ocupação e controle de acesso em painel dedicado e intuitivo.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-teal-600',
      title: 'Segurança de Nível Bancário',
      desc: 'Autenticação JWT, roles granulares (comprador, organizador, porteiro) e tokens renovados.',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime garantido', icon: TrendingUp },
    { value: '< 200ms', label: 'Validação de ingresso', icon: Zap },
    { value: 'SHA-256', label: 'Criptografia HMAC', icon: Lock },
    { value: '3 roles', label: 'Níveis de acesso', icon: Users },
  ];

  const categories = [
    { icon: Music, label: 'Shows & Festivais', count: 'Coldplay, Rock in Rio…' },
    { icon: Film, label: 'Cinema & Filmes', count: 'Pré-estreias exclusivas' },
    { icon: Drama, label: 'Teatro & Cultura', count: 'Espetáculos curados' },
  ];

  const steps = [
    {
      n: '01',
      title: 'Crie seu evento',
      desc: 'Configure datas, mapa de assentos e preços. Importe dados diretamente do catálogo Ticketmaster.',
    },
    {
      n: '02',
      title: 'Venda ingressos',
      desc: 'Compradores recebem QR Code criptografado por e-mail e na carteira digital da plataforma.',
    },
    {
      n: '03',
      title: 'Valide na portaria',
      desc: 'Escaneie com câmera ou digite o código. Acesso liberado em milissegundos, sem fraudes.',
    },
  ];

  const testimonials = [
    {
      name: 'Ana Carolina M.',
      role: 'Produtora de Shows',
      text: 'Migrei minha produção inteira para o Passfy. O mapa de assentos e a portaria digital são simplesmente impressionantes.',
      stars: 5,
    },
    {
      name: 'Rafael Torres',
      role: 'Gestor de Venue',
      text: 'Validamos mais de 3.000 ingressos em menos de 40 minutos na abertura. Zero filas, zero fraudes.',
      stars: 5,
    },
    {
      name: 'Juliana Farias',
      role: 'Fã e Compradora',
      text: 'Finalmente um app de ingressos que funciona de verdade. QR Code na hora, assento garantido, experiência premium.',
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-['Plus_Jakarta_Sans',Inter,sans-serif]">

      {/* ── NAVBAR (standalone, minimal) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 20 ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid #e2e8f0' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2b55f5] to-[#7c3aed] flex items-center justify-center shadow-sm">
              <Ticket className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">Passfy</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">Como Funciona</a>
            <a href="#categories" className="hover:text-slate-900 transition">Categorias</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-sm font-bold text-slate-700 hover:text-slate-900 transition px-3 py-1.5"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-sm font-bold shadow-sm transition active:scale-[0.98]"
            >
              <span>Começar grátis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50/40 pointer-events-none" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #2b55f5 0%, transparent 70%)' }}
        />

        {/* Floating ticket cards (decorative) */}
        <FloatingTicket
          title="Rock in Rio 2026"
          venue="Cidade do Rock, RJ"
          date="17 Set 2026"
          price="R$ 680"
          color="bg-violet-600"
          className="hidden lg:block top-28 left-[5%] animate-ticket-1"
        />
        <FloatingTicket
          title="Coldplay World Tour"
          venue="Allianz Parque, SP"
          date="12 Nov 2026"
          price="R$ 850"
          color="bg-blue-600"
          className="hidden lg:block bottom-36 left-[7%] animate-ticket-2"
        />
        <FloatingTicket
          title="Tomorrowland Brasil"
          venue="Parque Maeda, SP"
          date="05 Dez 2026"
          price="R$ 990"
          color="bg-emerald-600"
          className="hidden lg:block top-32 right-[5%] animate-ticket-3"
        />
        <FloatingTicket
          title="Taylor Swift — The Eras"
          venue="Nilton Santos, RJ"
          date="22 Mar 2027"
          price="R$ 750"
          color="bg-rose-500"
          className="hidden lg:block bottom-40 right-[6%] animate-ticket-1"
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <AnimatedSection direction="fade">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma completa de ingressos digitais</span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Ingressos digitais{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)' }}
              >
                sem fraudes.
              </span>
              <br />
              Portaria{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #059669 0%, #2b55f5 100%)' }}
              >
                inteligente.
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              O Passfy é a plataforma de ticketing end-to-end que conecta organizadores, compradores e porteiros
              em uma experiência moderna, segura e impossível de falsificar.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-base font-bold shadow-md transition hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Ticket className="w-5 h-5" />
                <span>Começar gratuitamente</span>
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-base font-bold shadow-xs transition hover:-translate-y-0.5"
              >
                <span>Ver eventos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedSection>

          {/* Social proof bar */}
          <AnimatedSection delay={450}>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sem taxa de cadastro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>HMAC-SHA256 anti-fraude</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>API Ticketmaster oficial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Validação em &lt;200ms</span>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-5 h-8 rounded-full border-2 border-slate-400 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="border-y border-slate-200 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <AnimatedSection key={label} delay={i * 80} direction="up" className="text-center space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
                  <Icon className="w-5 h-5 text-[#2b55f5]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-semibold">{label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Tudo que você precisa, integrado</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Tecnologia de ponta para cada etapa do evento
          </h2>
          <p className="text-slate-500 font-medium text-base leading-relaxed">
            Do cadastro do evento à liberação de acesso na portaria — uma plataforma só, do início ao fim.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }, i) => (
            <AnimatedSection key={title} delay={i * 80} direction="up">
              <div className="group bg-white border border-slate-200 rounded-3xl p-7 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-default h-full space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simples e rápido</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Como o Passfy funciona?
            </h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Três passos, zero complicação. Do evento criado ao acesso validado.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

            {steps.map(({ n, title, desc }, i) => (
              <AnimatedSection key={n} delay={i * 120} direction="up">
                <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-sm transition text-center space-y-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-base font-black text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}
                  >
                    {n}
                  </div>
                  <h3 className="text-base font-black text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Para todos os estilos</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Qualquer tipo de evento, uma plataforma só
          </h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-3 gap-6">
          {categories.map(({ icon: Icon, label, count }, i) => (
            <AnimatedSection key={label} delay={i * 100} direction="up">
              <div
                onClick={() => navigate('/home')}
                className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-[#2b55f5] hover:shadow-md transition-all cursor-pointer text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto group-hover:bg-blue-50 group-hover:border-blue-200 transition">
                  <Icon className="w-7 h-7 text-slate-600 group-hover:text-[#2b55f5] transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#2b55f5] transition-colors">{label}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{count}</p>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#2b55f5] opacity-0 group-hover:opacity-100 transition">
                  <span>Explorar eventos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHT — Digital Wallet ── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <AnimatedSection direction="left" className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Carteira digital inteligente</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Seu ingresso sempre à mão,{' '}
                <span className="text-[#2b55f5]">pronto para escanear.</span>
              </h2>
              <p className="text-slate-500 font-medium text-base leading-relaxed">
                Cada ingresso emitido possui um QR Code criptografado com HMAC-SHA256 — único, intransferível e
                verificável instantaneamente na portaria. Nada de printscreens funcionando, nada de revenda ilegal.
              </p>
              <ul className="space-y-3">
                {[
                  'QR Code renovado a cada leitura (one-time token)',
                  'Código alfanumérico de backup para digitação manual',
                  'Histórico completo de validações por evento',
                  'Compartilhável como link público verificado',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-sm font-bold shadow-sm transition"
              >
                <span>Criar minha conta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </AnimatedSection>

            {/* Right: Visual mockup */}
            <AnimatedSection direction="right" delay={150}>
              <div className="relative mx-auto max-w-sm">
                {/* Main ticket card */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
                  {/* Header banner */}
                  <div
                    className="h-36 relative"
                    style={{ background: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Music className="w-24 h-24 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-5">
                      <p className="text-white font-black text-lg">Rock in Rio 2026</p>
                      <p className="text-white/80 text-xs font-medium">Cidade do Rock — Rio de Janeiro</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Titular</p>
                        <p className="text-sm font-black text-slate-900">Pierre Brito</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Poltrona</p>
                        <p className="text-sm font-black text-[#2b55f5]">A-14</p>
                      </div>
                    </div>

                    {/* Dashed divider */}
                    <div className="relative border-t-2 border-dashed border-slate-200 my-2">
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-200" />
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-200" />
                    </div>

                    {/* QR Code simulation */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        <QrCode className="w-12 h-12 text-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Código</p>
                        <p className="font-mono text-sm font-black text-slate-900 tracking-wider">PAS-RR2026</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-700">Válido • HMAC-SHA256</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium text-center border-t border-slate-100 pt-3">
                      17 de Setembro de 2026 — 20:00h
                    </p>
                  </div>
                </div>

                {/* Decorative shadow card behind */}
                <div className="absolute -bottom-3 -right-3 -z-10 w-full h-full bg-slate-100 rounded-3xl border border-slate-200" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── GATEKEEPER HIGHLIGHT ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual states mockup */}
          <AnimatedSection direction="left" className="space-y-3">
            {[
              {
                status: 'VÁLIDO',
                name: 'Pedro Almeida',
                seat: 'B-07',
                bg: 'bg-emerald-50 border-emerald-300',
                badge: 'bg-emerald-600 text-white',
                dot: 'bg-emerald-500',
              },
              {
                status: 'JÁ UTILIZADO',
                name: 'Carla Mendes',
                seat: '—',
                bg: 'bg-amber-50 border-amber-300',
                badge: 'bg-amber-500 text-white',
                dot: 'bg-amber-500',
              },
              {
                status: 'INVÁLIDO',
                name: 'Código desconhecido',
                seat: '—',
                bg: 'bg-rose-50 border-rose-300',
                badge: 'bg-rose-600 text-white',
                dot: 'bg-rose-500',
              },
            ].map(({ status, name, seat, bg, badge, dot }, i) => (
              <AnimatedSection key={status} delay={i * 100} direction="left">
                <div className={`${bg} border rounded-2xl p-4 flex items-center gap-4`}>
                  <div className={`w-8 h-8 rounded-full ${badge} flex items-center justify-center shrink-0`}>
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className="text-xs font-black text-slate-900">{status}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {name} {seat !== '—' && <span className="text-[#2b55f5] font-bold">• {seat}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </AnimatedSection>

          {/* Right: Text */}
          <AnimatedSection direction="right" delay={100} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portaria inteligente</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Controle de acesso em{' '}
              <span className="text-emerald-600">milissegundos.</span>
            </h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              O porteiro escaneia com a câmera ou digita o código alfanumérico — e em menos de 200ms recebe o feedback
              visual e sonoro. Quatro estados claros: <strong className="text-slate-800">Válido</strong>,{' '}
              <strong className="text-slate-800">Já Utilizado</strong>,{' '}
              <strong className="text-slate-800">Outro Evento</strong> e{' '}
              <strong className="text-slate-800">Inválido</strong>.
            </p>
            <ul className="space-y-3">
              {[
                'Câmera do dispositivo ou tablet da equipe',
                'Digitação manual com autocompletar de formato',
                'Feedback sonoro configurável por turno',
                'Histórico em tempo real da sessão atual',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">O que dizem sobre o Passfy</h2>
            <p className="text-slate-500 font-medium text-sm">
              Organizadores, gestores e compradores que já viveram a experiência.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }, i) => (
              <AnimatedSection key={name} delay={i * 100} direction="up">
                <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:shadow-sm transition h-full flex flex-col justify-between space-y-4">
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed flex-1">"{text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2b55f5] to-[#7c3aed] flex items-center justify-center text-white text-xs font-black">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection className="max-w-3xl mx-auto space-y-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl shadow-lg mb-2 mx-auto"
            style={{ background: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)' }}
          >
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            Pronto para transformar a experiência dos seus eventos?
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">
            Cadastre-se em segundos, crie seu primeiro evento e venda ingressos com segurança criptográfica de nível bancário.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2b55f5] hover:bg-[#1f44d6] text-white text-base font-bold shadow-md transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Criar minha conta grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-base font-bold shadow-xs transition hover:-translate-y-0.5"
            >
              <span>Explorar eventos</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 font-semibold pt-1">
            Sem cartão de crédito • Sem taxa de adesão • Cancele quando quiser
          </p>
        </AnimatedSection>
      </section>

      {/* ── FOOTER MINIMAL ── */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2b55f5] to-[#7c3aed] flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">Passfy</span>
          </div>
          <p className="text-xs text-slate-400 font-medium text-center">
            Plataforma de ingressos digitais com HMAC-SHA256, Ticketmaster Discovery API v2 e portaria inteligente.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <button onClick={() => navigate('/login')} className="hover:text-slate-900 transition">Entrar</button>
            <button onClick={() => navigate('/home')} className="hover:text-slate-900 transition">Eventos</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
