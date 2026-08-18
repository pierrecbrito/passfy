import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
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
  Building2,
  MapPin,
  Calendar,
  ChevronLeft,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  BadgeCheck,
  Cpu,
  Headphones,
} from 'lucide-react';

// ─────────────────────────────────────────────
// useInView hook
// ─────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
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
    up: 'translateY(36px)',
    left: 'translateX(-36px)',
    right: 'translateX(36px)',
    fade: 'scale(0.97)',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : transforms[direction],
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

// ─────────────────────────────────────────────
// EventItem interface
// ─────────────────────────────────────────────
interface EventItem {
  id: string;
  title: string;
  category: string;
  bannerUrl: string | null;
  venue: string;
  date: string;
  price: number;
  availableCapacity: number;
}

// ─────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Hero image path (generated asset)
  const HERO_IMG = '/hero_person_ticket.jpg';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load featured events for carousel
  useEffect(() => {
    api.get('/events', { params: { limit: 10 } })
      .then(r => setEvents((r.data.events || []).slice(0, 10)))
      .catch(() => setEvents(MOCK_EVENTS));
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' });
  };

  const partners = [
    'Ticketmaster', 'Spotify', 'Google Maps', 'Google Calendar',
    'HMAC-SHA256', 'JWT Auth', 'Node.js', 'React',
    'Ticketmaster', 'Spotify', 'Google Maps', 'Google Calendar',
  ];

  const features = [
    { icon: QrCode, color: '#2b55f5', bg: 'bg-blue-50', title: 'QR Code Criptográfico', desc: 'Token HMAC-SHA256 único por ingresso — impossível de duplicar, forjar ou revender. Renovado a cada leitura.' },
    { icon: ScanLine, color: '#059669', bg: 'bg-emerald-50', title: 'Portaria em <200ms', desc: 'Escaneie com a câmera ou digite manualmente. Feedback visual e sonoro instantâneo. Quatro estados distintos.' },
    { icon: Layers, color: '#7c3aed', bg: 'bg-violet-50', title: 'Mapa de Assentos', desc: 'Seleção visual precisa de poltrona. Assento bloqueado em tempo real após seleção para evitar conflitos.' },
    { icon: Globe2, color: '#d97706', bg: 'bg-amber-50', title: 'API Ticketmaster', desc: 'Importe eventos diretamente do catálogo oficial Ticketmaster Discovery v2. Preencha tudo em 1 clique.' },
    { icon: BarChart3, color: '#dc2626', bg: 'bg-rose-50', title: 'Dashboard do Organizador', desc: 'Métricas de vendas, ocupação e controle de acesso em painel dedicado. Exporte relatórios em CSV.' },
    { icon: Headphones, color: '#0891b2', bg: 'bg-cyan-50', title: 'Player Spotify', desc: 'Card com playlist do artista embutida diretamente na página do evento. Experiência imersiva antes do show.' },
  ];

  const personas = [
    {
      icon: Building2,
      color: 'from-[#2b55f5] to-[#7c3aed]',
      title: 'Organizadores',
      subtitle: 'Crie e venda com confiança',
      items: [
        'Crie eventos com mapa de assentos visual',
        'Importe dados do Ticketmaster em 1 clique',
        'Dashboard de vendas e ocupação em tempo real',
        'Portaria digital configurada em minutos',
      ],
      cta: 'Criar meu evento',
    },
    {
      icon: Ticket,
      color: 'from-[#059669] to-[#2b55f5]',
      title: 'Compradores',
      subtitle: 'Compre e vá sem estresse',
      items: [
        'Escolha seu assento no mapa interativo',
        'Ingresso digital anti-fraude no bolso',
        'QR Code renovado a cada uso — inalcançável',
        'Link público compartilhável com amigos',
      ],
      cta: 'Explorar eventos',
    },
    {
      icon: ScanLine,
      color: 'from-[#7c3aed] to-[#dc2626]',
      title: 'Porteiros',
      subtitle: 'Valide rápido, sem filas',
      items: [
        'Câmera do celular como scanner profissional',
        'Feedback instantâneo: válido / já usado / inválido',
        'Histórico completo da sessão em tempo real',
        'Funciona offline com sincronização posterior',
      ],
      cta: 'Ver demonstração',
    },
  ];

  const steps = [
    { n: '01', title: 'Crie seu evento', desc: 'Configure datas, mapa de assentos e preços. Importe dados diretamente do catálogo Ticketmaster em segundos.', color: '#2b55f5' },
    { n: '02', title: 'Venda ingressos', desc: 'Compradores recebem QR Code criptografado no e-mail e na carteira digital da plataforma. Sem impressão, sem fraude.', color: '#7c3aed' },
    { n: '03', title: 'Valide na portaria', desc: 'Escaneie com câmera ou digite o código. Acesso liberado em milissegundos. Histórico completo disponível.', color: '#059669' },
  ];

  const testimonials = [
    { name: 'Ana Carolina M.', role: 'Produtora de Shows', company: 'AM Produções', text: 'Migrei minha produção inteira para o Passfy. O mapa de assentos e a portaria digital são simplesmente impressionantes. Reduzi fraudes a zero.', stars: 5, initials: 'AC', grad: 'from-[#2b55f5] to-[#7c3aed]' },
    { name: 'Rafael Torres', role: 'Gestor de Venue', company: 'Arena Central SP', text: 'Validamos mais de 3.000 ingressos em menos de 40 minutos na abertura. Zero filas, zero fraudes. O sistema de portaria é impecável.', stars: 5, initials: 'RT', grad: 'from-[#059669] to-[#2b55f5]' },
    { name: 'Juliana Farias', role: 'Fã e Compradora', company: 'Cliente desde 2025', text: 'Finalmente um app de ingressos que funciona de verdade. QR Code na hora, assento garantido, experiência premium. Não uso mais outra plataforma.', stars: 5, initials: 'JF', grad: 'from-[#7c3aed] to-[#dc2626]' },
  ];

  const stats = [
    { value: 99.9, suffix: '%', label: 'Uptime garantido', icon: TrendingUp },
    { value: 200, suffix: 'ms', label: 'Validação de ingresso', icon: Zap, prefix: '<' },
    { value: 256, suffix: '-bit', label: 'Criptografia HMAC', icon: Lock },
    { value: 3, suffix: ' roles', label: 'Níveis de acesso', icon: Users },
  ];

  const categoryIcon: Record<string, React.FC<{ className?: string }>> = {
    CONCERT: Music, MOVIE: Film, THEATER: Drama,
  };

  const categoryLabel: Record<string, string> = {
    CONCERT: 'Show', MOVIE: 'Cinema', THEATER: 'Teatro', OTHER: 'Evento',
  };

  const categoryColor: Record<string, string> = {
    CONCERT: 'bg-violet-100 text-violet-700',
    MOVIE: 'bg-blue-100 text-blue-700',
    THEATER: 'bg-amber-100 text-amber-700',
    OTHER: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 20 ? 'rgba(255,255,255,0.96)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(14px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid #e2e8f0' : '1px solid transparent',
          boxShadow: scrollY > 20 ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}>
              <Ticket className="text-white" style={{ width: '1.05rem', height: '1.05rem' }} />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">Passfy</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition">Funcionalidades</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 transition">Como Funciona</button>
            <button onClick={() => scrollToSection('events')} className="hover:text-slate-900 transition">Eventos</button>
            <button onClick={() => scrollToSection('personas')} className="hover:text-slate-900 transition">Para Quem</button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-bold text-slate-700 hover:text-slate-900 transition px-3 py-1.5">
              Entrar
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}
            >
              <span>Começar grátis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO — SPLIT LAYOUT ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* BG mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 50%, #f5f0ff 100%)' }} />
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none" style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(43,85,245,0.04) 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Text */}
            <div className="space-y-7 order-2 lg:order-1">
              <AnimatedSection direction="fade">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold shadow-xs" style={{ background: 'rgba(43,85,245,0.06)', borderColor: 'rgba(43,85,245,0.2)', color: '#2b55f5' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plataforma completa de ingressos digitais</span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={80}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
                  O jeito moderno de{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)' }}>
                    vender
                  </span>{' '}
                  e validar{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #059669 0%, #2b55f5 100%)' }}>
                    ingressos.
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={160}>
                <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
                  O Passfy é a plataforma end-to-end que conecta organizadores, compradores e porteiros em uma experiência moderna, segura e impossível de falsificar.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={240}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white text-base font-bold shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)', boxShadow: '0 4px 24px rgba(43,85,245,0.35)' }}
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

              {/* Trust badges */}
              <AnimatedSection delay={320}>
                <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-semibold text-slate-500">
                  {[
                    { icon: CheckCircle2, label: 'Sem taxa de cadastro' },
                    { icon: Lock, label: 'HMAC-SHA256 anti-fraude' },
                    { icon: Globe2, label: 'API Ticketmaster oficial' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Right: Hero image + floating cards */}
            <AnimatedSection direction="right" delay={200} className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Main hero image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 32px 80px rgba(43,85,245,0.2)' }}>
                  <img
                    src={HERO_IMG}
                    alt="Pessoa usando o Passfy num festival"
                    className="w-full object-cover"
                    style={{ aspectRatio: '3/4', maxHeight: '520px', objectPosition: 'center top' }}
                    onError={(e) => {
                      // Fallback gradient if image not found
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Gradient overlay bottom */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(43,85,245,0.12) 0%, transparent 50%)' }} />
                </div>

                {/* Floating stat: validated tickets */}
                <div className="absolute -left-8 top-12 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 flex items-center gap-3 animate-ticket-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Ingressos validados</p>
                    <p className="text-lg font-black text-slate-900">12.847</p>
                  </div>
                </div>

                {/* Floating stat: zero fraud */}
                <div className="absolute -right-6 bottom-20 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 flex items-center gap-3 animate-ticket-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Taxa de fraude</p>
                    <p className="text-lg font-black text-emerald-600">0.00%</p>
                  </div>
                </div>

                {/* Floating badge: < 200ms */}
                <div className="absolute -right-4 top-16 bg-slate-900 rounded-xl px-3 py-2 shadow-lg animate-ticket-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-black text-white">&lt;200ms</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">validação</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40 hidden lg:flex flex-col items-center gap-1">
          <div className="w-5 h-8 rounded-full border-2 border-slate-400 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </section>

      {/* ── PARTNERS MARQUEE ── */}
      <div className="border-y border-slate-200 bg-slate-50 py-5 overflow-hidden">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Integrado com</p>
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-black text-slate-400 shrink-0">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── DARK STATS BAND ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #2b55f5 0%, transparent 50%), radial-gradient(circle at 75% 50%, #7c3aed 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
            {stats.map(({ value, suffix, label, icon: Icon, prefix }, i) => (
              <StatCard key={label} value={value} suffix={suffix} label={label} icon={Icon} prefix={prefix} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS CAROUSEL ── */}
      <section id="events" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <AnimatedSection className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Em destaque agora</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Eventos em destaque</h2>
            <p className="text-slate-500 font-medium text-base">Os shows, filmes e peças mais aguardados da temporada.</p>
          </AnimatedSection>

          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scrollCarousel('left')} className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition flex items-center justify-center text-slate-600 hover:text-slate-900">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scrollCarousel('right')} className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition flex items-center justify-center text-slate-600 hover:text-slate-900">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable carousel */}
        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(events.length > 0 ? events : MOCK_EVENTS).map((ev, i) => {
            const CatIcon = categoryIcon[ev.category] || Layers;
            const pct = ev.availableCapacity > 0
              ? Math.max(0, Math.min(100, Math.round(((100 - ev.availableCapacity) / 100) * 100)))
              : 80;
            return (
              <div
                key={ev.id || i}
                onClick={() => navigate(`/events/${ev.id}`)}
                className="group relative shrink-0 w-72 bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Banner */}
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  {ev.bannerUrl ? (
                    <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${EVENT_COLORS[i % EVENT_COLORS.length].from}, ${EVENT_COLORS[i % EVENT_COLORS.length].to})` }}>
                      <CatIcon className="w-12 h-12 text-white opacity-40" />
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${categoryColor[ev.category] || 'bg-slate-100 text-slate-700'}`}>
                      <CatIcon className="w-3 h-3" />
                      {categoryLabel[ev.category] || 'Evento'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-[#2b55f5] transition-colors">{ev.title}</h3>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Availability bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Ocupação</span>
                      <span className="text-[10px] font-black text-slate-600">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#059669' }}
                      />
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">A partir de</p>
                      <p className="text-base font-black text-slate-900">
                        {ev.price === 0 ? 'Gratuito' : `R$ ${Number(ev.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#2b55f5] opacity-0 group-hover:opacity-100 transition">
                      <span>Comprar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 hover:border-[#2b55f5] text-slate-700 hover:text-[#2b55f5] text-sm font-bold transition"
          >
            <span>Ver todos os eventos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Tecnologia de ponta</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Tudo que você precisa, integrado
            </h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Do cadastro do evento à liberação de acesso na portaria — uma plataforma só, do início ao fim.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <AnimatedSection key={title} delay={i * 70} direction="up">
                <div className="group bg-white border border-slate-200 rounded-3xl p-7 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-default h-full space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${bg} border flex items-center justify-center shadow-xs group-hover:-translate-y-1 transition-transform`} style={{ borderColor: `${color}22` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simples e rápido</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Como o Passfy funciona?</h2>
          <p className="text-slate-500 font-medium text-base leading-relaxed">
            Três passos, zero complicação. Do evento criado ao acesso validado.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px" style={{ background: 'linear-gradient(90deg, #2b55f5, #7c3aed, #059669)' }} />
          {steps.map(({ n, title, desc, color }, i) => (
            <AnimatedSection key={n} delay={i * 120} direction="up">
              <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 text-center space-y-4 group hover:-translate-y-1">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-base font-black text-white shadow-lg group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 24px ${color}44` }}
                >
                  {n}
                </div>
                <h3 className="text-base font-black text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── PERSONAS ── */}
      <section id="personas" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #fff 50%, #f5f8ff 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Para quem é o Passfy</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Uma plataforma, três experiências</h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Cada perfil tem ferramentas e benefícios pensados especificamente para seu papel no evento.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {personas.map(({ icon: Icon, color, title, subtitle, items, cta }, i) => (
              <AnimatedSection key={title} delay={i * 100} direction="up">
                <div className="group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col space-y-6">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Heading */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-2.5 flex-1">
                    {items.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => navigate('/login')}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all group-hover:shadow-md bg-gradient-to-r ${color} text-white`}
                  >
                    <span>{cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIGITAL WALLET HIGHLIGHT ── */}
      <section className="py-24 border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                Cada ingresso possui um QR Code criptografado com HMAC-SHA256 — único, intransferível e verificável instantaneamente na portaria. Nada de prints funcionando, nada de revenda ilegal.
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}
              >
                <span>Criar minha conta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </AnimatedSection>

            {/* Right: ticket mockup */}
            <AnimatedSection direction="right" delay={150}>
              <div className="relative mx-auto max-w-sm">
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
                  <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #2b55f5 0%, #7c3aed 100%)' }}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <Music className="w-24 h-24 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-5">
                      <p className="text-white font-black text-lg">Rock in Rio 2026</p>
                      <p className="text-white/80 text-xs font-medium">Cidade do Rock — Rio de Janeiro</p>
                    </div>
                  </div>
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
                    <div className="relative border-t-2 border-dashed border-slate-200 my-2">
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-200" />
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-200" />
                    </div>
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
                <div className="absolute -bottom-3 -right-3 -z-10 w-full h-full bg-slate-100 rounded-3xl border border-slate-200" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── GATEKEEPER HIGHLIGHT ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="left" className="space-y-3">
            {[
              { status: 'VÁLIDO', name: 'Pedro Almeida', seat: 'B-07', bg: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500', dot: 'bg-emerald-500', time: '20:14:33' },
              { status: 'JÁ UTILIZADO', name: 'Carla Mendes', seat: '—', bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-500', dot: 'bg-amber-500', time: '20:13:05' },
              { status: 'INVÁLIDO', name: 'Código desconhecido', seat: '—', bg: 'bg-rose-50 border-rose-200', badge: 'bg-rose-500', dot: 'bg-rose-500', time: '20:11:47' },
            ].map(({ status, name, seat, bg, badge, dot, time }, i) => (
              <AnimatedSection key={status} delay={i * 100} direction="left">
                <div className={`${bg} border rounded-2xl p-4 flex items-center gap-4`}>
                  <div className={`w-9 h-9 rounded-full ${badge} flex items-center justify-center shrink-0`}>
                    <ScanLine className="w-4 h-4 text-white" />
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
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">{time}</span>
                </div>
              </AnimatedSection>
            ))}
          </AnimatedSection>

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
              O porteiro escaneia com a câmera ou digita o código alfanumérico — e em menos de 200ms recebe o feedback visual e sonoro. Quatro estados claros: <strong className="text-slate-800">Válido</strong>, <strong className="text-slate-800">Já Utilizado</strong>, <strong className="text-slate-800">Outro Evento</strong> e <strong className="text-slate-800">Inválido</strong>.
            </p>
            <ul className="space-y-3">
              {['Câmera do dispositivo ou tablet da equipe', 'Digitação manual com autocompletar de formato', 'Feedback sonoro configurável por turno', 'Histórico em tempo real da sessão atual'].map((item) => (
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
            <div className="flex justify-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">O que dizem sobre o Passfy</h2>
            <p className="text-slate-500 font-medium text-sm">Organizadores, gestores e compradores que já viveram a experiência.</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, company, text, stars, initials, grad }, i) => (
              <AnimatedSection key={name} delay={i * 100} direction="up">
                <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between space-y-5 group">
                  {/* Quote icon */}
                  <div className="space-y-4">
                    <div className="text-4xl font-black text-slate-200 leading-none select-none">"</div>
                    <div className="flex gap-0.5 -mt-3">
                      {Array.from({ length: stars }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed flex-1">"{text}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-black shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{role} · {company}</p>
                    </div>
                    <BadgeCheck className="w-4 h-4 text-blue-500 ml-auto shrink-0" />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2b55f5 0%, transparent 55%), radial-gradient(circle at 70% 50%, #7c3aed 0%, transparent 55%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <AnimatedSection className="space-y-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl shadow-2xl mx-auto" style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}>
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Pronto para transformar a experiência dos seus eventos?
            </h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl mx-auto">
              Cadastre-se em segundos, crie seu primeiro evento e venda ingressos com segurança criptográfica de nível bancário.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-base font-bold transition hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)', boxShadow: '0 4px 32px rgba(43,85,245,0.4)' }}
              >
                <span>Criar minha conta grátis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 text-white text-base font-bold transition hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <span>Explorar eventos</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Sem cartão de crédito · Sem taxa de adesão · Cancele quando quiser
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER CORPORATIVO ── */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #2b55f5, #7c3aed)' }}>
                  <Ticket className="text-white" style={{ width: '1.05rem', height: '1.05rem' }} />
                </div>
                <span className="text-base font-black text-white tracking-tight">Passfy</span>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Plataforma de ticketing digital com criptografia HMAC-SHA256 e portaria inteligente.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition cursor-pointer">
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Produto */}
            <div className="space-y-4">
              <p className="text-xs font-black text-white uppercase tracking-widest">Produto</p>
              <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
                {['Funcionalidades', 'Como Funciona', 'Para Organizadores', 'Para Compradores', 'Portaria Digital'].map(l => (
                  <li key={l}><button className="hover:text-white transition">{l}</button></li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div className="space-y-4">
              <p className="text-xs font-black text-white uppercase tracking-widest">Empresa</p>
              <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
                {['Sobre nós', 'Blog', 'Carreiras', 'Parceiros', 'Contato'].map(l => (
                  <li key={l}><button className="hover:text-white transition">{l}</button></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <p className="text-xs font-black text-white uppercase tracking-widest">Legal</p>
              <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
                {['Termos de Uso', 'Privacidade', 'Segurança', 'LGPD', 'Cookies'].map(l => (
                  <li key={l}><button className="hover:text-white transition">{l}</button></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Passfy. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL / TLS</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>HMAC-SHA256</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <BadgeCheck className="w-3.5 h-3.5 text-violet-500" />
                <span>LGPD Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────
// StatCard with animated counter
// ─────────────────────────────────────────────
const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  prefix?: string;
  delay: number;
}> = ({ value, suffix, label, icon: Icon, prefix, delay }) => {
  const { ref, inView } = useInView();
  const count = useCounter(value, 1800, inView);
  return (
    <div
      ref={ref}
      className="text-center space-y-2"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <p className="text-3xl sm:text-4xl font-black text-white">
        {prefix}{count}{suffix}
      </p>
      <p className="text-xs text-slate-400 font-semibold">{label}</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Mock events fallback
// ─────────────────────────────────────────────
const EVENT_COLORS = [
  { from: '#2b55f5', to: '#7c3aed' },
  { from: '#059669', to: '#2b55f5' },
  { from: '#7c3aed', to: '#dc2626' },
  { from: '#d97706', to: '#dc2626' },
  { from: '#0891b2', to: '#7c3aed' },
];

const MOCK_EVENTS: EventItem[] = [
  { id: '1', title: 'Rock in Rio 2026', category: 'CONCERT', bannerUrl: null, venue: 'Cidade do Rock, RJ', date: '2026-09-17T20:00:00Z', price: 680, availableCapacity: 15 },
  { id: '2', title: 'Coldplay World Tour', category: 'CONCERT', bannerUrl: null, venue: 'Allianz Parque, SP', date: '2026-11-12T21:00:00Z', price: 850, availableCapacity: 8 },
  { id: '3', title: 'O Rei Leão — Musical', category: 'THEATER', bannerUrl: null, venue: 'Teatro Alfa, SP', date: '2026-10-05T19:30:00Z', price: 220, availableCapacity: 42 },
  { id: '4', title: 'Tomorrowland Brasil 2026', category: 'CONCERT', bannerUrl: null, venue: 'Parque Maeda, SP', date: '2026-12-05T14:00:00Z', price: 990, availableCapacity: 30 },
  { id: '5', title: 'Avatar 3 — Pré-estreia', category: 'MOVIE', bannerUrl: null, venue: 'Cinemark Bourbon SP', date: '2026-10-15T21:00:00Z', price: 65, availableCapacity: 55 },
  { id: '6', title: 'Taylor Swift — The Eras Tour', category: 'CONCERT', bannerUrl: null, venue: 'Nilton Santos, RJ', date: '2027-03-22T20:00:00Z', price: 750, availableCapacity: 5 },
];
