import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  RotateCcw,
  CreditCard,
  ScanLine,
  BarChart3,
  Bot,
  Globe2,
  Lock,
  Compass,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Animated Section Hook
// ─────────────────────────────────────────────
function useInView(threshold = 0.1) {
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

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'fade';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'none'
          : direction === 'up'
          ? 'translateY(28px)'
          : 'scale(0.98)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#2b55f5] selection:text-white">
      {/* ── HEADER / NAVBAR ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 20 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrollY > 20 ? '1px solid #e2e8f0' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#092b28] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
              Pass<span className="text-[#2b55f5]">fy</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Vantagens
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Planos
            </button>
            <button
              onClick={() => scrollToSection('integrations')}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Integrações
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 transition cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 rounded-full text-xs font-black bg-[#092b28] text-white hover:bg-[#0c3935] shadow-sm hover:shadow transition active:scale-[0.98] cursor-pointer"
            >
              Explorar Eventos
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section
        id="hero"
        className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <AnimatedSection direction="fade">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                O Futuro da Emissão de Ingressos com{' '}
                <span className="text-[#092b28] underline decoration-emerald-400 decoration-4 underline-offset-8">
                  Tecnologia em Tempo Real
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                A plataforma completa para organizadores, compradores e portarias. Sincronização de
                assentos via WebSocket, curadoria com IA e segurança anti-fraude HMAC.
              </p>
            </AnimatedSection>

            {/* Dual CTAs */}
            <AnimatedSection delay={200}>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/home')}
                  className="px-7 py-3.5 rounded-full bg-[#092b28] hover:bg-[#0c3935] text-white text-sm font-bold shadow-md transition hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => scrollToSection('services')}
                  className="px-7 py-3.5 rounded-full bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-sm font-bold shadow-2xs transition hover:-translate-y-0.5 cursor-pointer"
                >
                  Ver Recursos
                </button>
              </div>
            </AnimatedSection>

            {/* Rating Stars Badge */}
            <AnimatedSection delay={300}>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 pt-1">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-black text-slate-900">5.0</span>
                <span className="text-slate-400">•</span>
                <span>Mais de 20.000 ingressos emitidos</span>
              </div>
            </AnimatedSection>
          </div>

          {/* ── HERO BENTO GRID (Row of 5 Cards as in Reference) ── */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            {/* Card 1: Tall Image Card */}
            <AnimatedSection delay={100} className="h-full">
              <div className="relative rounded-3xl overflow-hidden h-64 sm:h-72 lg:h-80 shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
                  alt="Experiência em Eventos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                    Experiência Ao Vivo
                  </span>
                  <p className="text-sm font-bold text-white leading-tight">
                    Shows, Festivais e Peças Inesquecíveis
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Card 2: Dark Stat Card */}
            <AnimatedSection delay={200} className="h-full">
              <div className="bg-[#092b28] text-white p-6 rounded-3xl flex flex-col justify-between h-64 sm:h-72 lg:h-80 shadow-md">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                    100k+
                  </p>
                  <p className="text-xs font-semibold text-emerald-200/80 mt-1">
                    Ingressos Emitidos e Clientes Conectados
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Card 3: Floating White UI Widget Card */}
            <AnimatedSection delay={300} className="h-full">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between h-64 sm:h-72 lg:h-80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Vendido
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    +24%
                  </span>
                </div>

                <div className="my-auto">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">1.951+</p>
                  <p className="text-[11px] text-slate-400 font-medium">Reservas confirmadas</p>
                </div>

                {/* Mini Bar Chart Mockup */}
                <div className="flex items-end gap-1.5 h-16 pt-2 border-t border-slate-100">
                  <div className="flex-1 bg-slate-100 rounded-t h-[40%]" />
                  <div className="flex-1 bg-slate-200 rounded-t h-[60%]" />
                  <div className="flex-1 bg-[#2b55f5]/60 rounded-t h-[75%]" />
                  <div className="flex-1 bg-[#092b28] rounded-t h-[100%]" />
                  <div className="flex-1 bg-emerald-400 rounded-t h-[85%]" />
                </div>
              </div>
            </AnimatedSection>

            {/* Card 4: Light Accent Stat Card */}
            <AnimatedSection delay={400} className="h-full">
              <div className="bg-emerald-50/80 border border-emerald-200/80 p-6 rounded-3xl flex flex-col justify-between h-64 sm:h-72 lg:h-80 shadow-md text-emerald-950">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-4xl lg:text-5xl font-black text-emerald-900 tracking-tight">
                    99.9%
                  </p>
                  <p className="text-xs font-bold text-emerald-800/80 mt-1">
                    Uptime & Sincronização de Assentos em Tempo Real
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Card 5: Dark Forest Feature Card */}
            <AnimatedSection delay={500} className="h-full">
              <div className="bg-[#0b332f] text-white p-6 rounded-3xl flex flex-col justify-between h-64 sm:h-72 lg:h-80 shadow-md">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Portaria Segura
                  </p>
                  <p className="text-sm font-bold text-white leading-snug">
                    Validação em &lt;200ms com Criptografia HMAC Anti-Fraude
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DARK SERVICES GRID (3x2 with Arrows like reference) ── */}
      <section id="services" className="py-24 bg-[#081d1c] text-white relative overflow-hidden">
        {/* Subtle radial glow in background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Serviços e Soluções Integradas para Seus Eventos
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/70 font-medium">
              Tecnologia completa para transformar a experiência de venda, gestão e acesso.
            </p>
          </div>

          {/* 3x2 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Sincronização em Tempo Real',
                desc: 'WebSockets com reserva e ocupação atômica de assentos instantânea para todos os usuários conectados.',
              },
              {
                icon: Layers,
                title: 'Setores & Ingressos Multi-Tier',
                desc: 'Pista, Camarote e Lotes flexíveis com preços dinâmicos, capacidade controlada e meia-entrada estudante.',
              },
              {
                icon: ScanLine,
                title: 'Controle de Portaria & Scanner',
                desc: 'Validação instantânea na câmera do celular com assinatura criptográfica HMAC e histórico da sessão.',
              },
              {
                icon: CreditCard,
                title: 'Gateway Stripe & PIX',
                desc: 'Pagamentos seguros com PIX Instantâneo e Cartão de Crédito integrado ao Stripe Oficial com Radar anti-fraude.',
              },
              {
                icon: RotateCcw,
                title: 'Devolução ao Estoque',
                desc: 'Autonomia para o cliente devolver ingressos com liberação atômica e imediata da vaga de volta à venda.',
              },
              {
                icon: Bot,
                title: 'Curadoria com Inteligência Artificial',
                desc: 'Assistente Google Gemini integrado que compreende o momento e recomenda a programação ideal em tempo real.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={index * 80}>
                  <div className="bg-[#0b2826]/80 hover:bg-[#0e3331] border border-emerald-900/40 hover:border-emerald-500/40 p-8 rounded-3xl transition-all duration-300 group flex flex-col justify-between h-full min-h-[230px] shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <div className="pt-6 space-y-2">
                      <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-emerald-100/70 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: KEY BENEFITS / SPLIT FEATURE SECTION ── */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Mockup Card */}
            <AnimatedSection direction="fade">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Métricas em Tempo Real
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      Arena Central SP • Lote 1
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Ao Vivo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Poltronas Ocupadas</span>
                    <span className="text-slate-900 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#092b28] h-2 rounded-full w-[92%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold pt-2">
                    <span className="text-slate-600">Validados na Portaria</span>
                    <span className="text-slate-900 font-bold">1.420 / 1.500</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[94%]" />
                  </div>
                </div>

                {/* Floating mini stat box inside card */}
                <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Zero Fraudes Registradas</p>
                      <p className="text-[10px] text-slate-400">Token HMAC Criptografado</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">100% Seguro</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Content */}
            <div className="space-y-6">
              <AnimatedSection>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  Principais Vantagens do Passfy para a Eficiência do Seu Evento
                </h2>
                <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed mt-3">
                  Nossa arquitetura foi desenhada para eliminar gargalos de venda, acabar com fraudes
                  de ingressos falsos e fornecer autonomia máxima a organizadores e compradores.
                </p>
              </AnimatedSection>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Segurança Criptográfica & Anti-Fraude com HMAC',
                    desc: 'Cada QR Code é assinado com chave secreta e hash único. Ingressos impressos ou duplicados não passam na portaria.',
                  },
                  {
                    title: 'Disponibilidade e Concorrência ACID em Assentos',
                    desc: 'Garantia transacional de que nenhuma cadeira será vendida para duas pessoas simultaneamente no mapa.',
                  },
                  {
                    title: 'Curadoria Inteligente Orientada por IA',
                    desc: 'Algoritmos generativos conectados ao Google Gemini entendem o estilo e sugerem eventos perfeitos.',
                  },
                ].map((benefit, i) => (
                  <AnimatedSection key={benefit.title} delay={i * 100}>
                    <div className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{benefit.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TAILORED PLANS (Dark Section like reference) ── */}
      <section id="pricing" className="py-24 bg-[#081d1c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Planos Sob Medida para Qualquer Escala de Evento
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/70 font-medium">
              Taxas transparentes e justas, do produtor independente a grandes festivais.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* 2 Top Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Starter */}
              <AnimatedSection delay={100} className="h-full">
                <div className="bg-[#0b2826] border border-emerald-900/40 p-8 rounded-3xl flex flex-col justify-between h-full space-y-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Produtor Starter
                    </span>
                    <p className="text-xs text-emerald-100/70 font-medium mt-1">
                      Ideal para eventos locais, cinema independente e apresentações.
                    </p>
                    <div className="mt-6">
                      <span className="text-4xl font-black text-white">R$ 0</span>
                      <span className="text-xs text-emerald-100/60 font-medium ml-1">
                        / 5% por ingresso vendido
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Começar Gratuitamente
                  </button>

                  <ul className="space-y-2.5 text-xs text-emerald-100/80 font-medium border-t border-emerald-900/40 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Até 1.000 ingressos por evento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Scanner com câmera na portaria</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>PIX & Cartão Stripe integrados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Mapa de assentos padrão</span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              {/* Enterprise */}
              <AnimatedSection delay={200} className="h-full">
                <div className="bg-[#0b2826] border border-emerald-900/40 p-8 rounded-3xl flex flex-col justify-between h-full space-y-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Grandes Arenas & Festivais
                    </span>
                    <p className="text-xs text-emerald-100/70 font-medium mt-1">
                      Para eventos de grande escala com milhares de acessos simultâneos.
                    </p>
                    <div className="mt-6">
                      <span className="text-4xl font-black text-white">Customizado</span>
                      <span className="text-xs text-emerald-100/60 font-medium ml-1">
                        / taxas regressivas
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#092b28] text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    Falar com Especialista
                  </button>

                  <ul className="space-y-2.5 text-xs text-emerald-100/80 font-medium border-t border-emerald-900/40 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ingressos e portarias ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Sincronização WebSocket de alta prioridade</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Gerente de contas dedicado 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Integração física com catracas</span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* Bottom Wide Card: Professional */}
            <AnimatedSection delay={300}>
              <div className="bg-[#0e3331] border border-emerald-500/30 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Plano Profissional
                  </span>
                  <h4 className="text-base font-bold text-white">
                    Produtores Frequentes com Multi-Lotes e Curadoria de IA
                  </h4>
                  <p className="text-xs text-emerald-100/70 font-medium">
                    Acesso completo ao dashboard analítico, relatórios em tempo real e suporte
                    prioritário.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#092b28] text-xs font-black shrink-0 transition shadow-xs cursor-pointer"
                >
                  Conhecer Plano Pro
                </button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INTEGRATIONS & RADAR (Concentric Diagram like reference) ── */}
      <section id="integrations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <AnimatedSection className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Integrado ao Ecossistema das Melhores Tecnologias
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                Conecte seu evento instantaneamente ao Stripe para cartões e PIX, ao Google Calendar
                para lembretes de agenda, ao catálogo oficial do Ticketmaster e ao Google Gemini para
                recomendações inteligentes.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-3 rounded-full bg-[#092b28] text-white hover:bg-[#0c3935] text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <span>Ver Demonstração</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </AnimatedSection>

            {/* Right Concentric Radar Map */}
            <AnimatedSection direction="fade" delay={150}>
              <div className="relative bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 h-80 flex items-center justify-center overflow-hidden shadow-inner">
                {/* Concentric Circles */}
                <div className="absolute w-64 h-64 rounded-full border border-emerald-200/60 animate-ping opacity-20" />
                <div className="absolute w-56 h-56 rounded-full border border-emerald-300/40" />
                <div className="absolute w-40 h-40 rounded-full border border-emerald-300/60" />
                <div className="absolute w-24 h-24 rounded-full border border-emerald-400/80" />

                {/* Central Passfy Node */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#092b28] text-white flex items-center justify-center shadow-lg">
                  <Ticket className="w-7 h-7 text-emerald-400" />
                </div>

                {/* Orbiting Partner Nodes */}
                <div className="absolute top-10 left-16 p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
                  <span>Stripe</span>
                </div>

                <div className="absolute bottom-10 left-14 p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Calendar</span>
                </div>

                <div className="absolute top-8 right-16 p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ticketmaster</span>
                </div>

                <div className="absolute bottom-12 right-14 p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gemini AI</span>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>WebSocket</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CTA BANNER (From Idea to Event like reference) ── */}
      <section className="py-20 bg-[#081d1c] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Da Ideia ao Evento Lotado em Poucos Minutos
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/70 max-w-xl mx-auto font-medium">
              Crie seu evento agora, configure setores e mapa de assentos e comece a vender com a
              menor taxa e a melhor tecnologia.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#092b28] text-sm font-black shadow-md transition hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              Publicar Meu Evento
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER (matches screenshot layout) ── */}
      <footer className="bg-[#040e0e] text-slate-400 py-16 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-emerald-950/60">
            {/* Brand Col */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-[#092b28]">
                  <Ticket className="w-4 h-4 font-black" />
                </div>
                <span className="text-lg font-black text-white">Passfy</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
                A tecnologia definitiva para emissão, gestão de estoque e validação segura de
                ingressos em tempo real.
              </p>
            </div>

            {/* Links Col 1: Empresa */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Empresa</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection('hero')} className="hover:text-white transition">
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/home')} className="hover:text-white transition">
                    Eventos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition">
                    Soluções
                  </button>
                </li>
              </ul>
            </div>

            {/* Links Col 2: Produtos */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Produtos</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition">
                    Mapa de Assentos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/gatekeeper')} className="hover:text-white transition">
                    Scanner Portaria
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition">
                    Planos & Taxas
                  </button>
                </li>
              </ul>
            </div>

            {/* Links Col 3: Contato */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Contato</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-slate-300 font-semibold">suporte@passfy.com</span>
                </li>
                <li>
                  <span>São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© 2026 Passfy Inc. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Termos de Uso</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacidade</span>
              <span className="hover:text-slate-400 cursor-pointer">Segurança</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
