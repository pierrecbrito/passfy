import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  AlertCircle,
  PlusCircle,
  Ticket,
  Loader2,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  Award,
} from 'lucide-react';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  category: 'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER';
  source: 'TICKETMASTER' | 'MANUAL';
  venue?: string;
  city?: string;
}

interface TicketTierItem {
  id: string;
  name: string;
  price: string;
  capacity: string;
  description: string;
}

export const OrganizerCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER'>('CONCERT');
  const [type, setType] = useState<'SEATED' | 'GENERAL_ADMISSION'>('GENERAL_ADMISSION');
  const [venue, setVenue] = useState('Allianz Parque, São Paulo - SP');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(21, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [price, setPrice] = useState('120.00');
  const [capacity, setCapacity] = useState('500');
  const [bannerUrl, setBannerUrl] = useState('');
  const [externalId, setExternalId] = useState<string | null>(null);
  const [externalSource, setExternalSource] = useState<string | null>(null);
  const [rowsCount, setRowsCount] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(10);

  // Default Ticket Tiers: Pista e Camarote como padrão
  const [ticketTiers, setTicketTiers] = useState<TicketTierItem[]>([
    {
      id: 'pista',
      name: 'Pista',
      price: '120.00',
      capacity: '400',
      description: 'Acesso à pista geral e visão frontal do palco',
    },
    {
      id: 'camarote',
      name: 'Camarote',
      price: '250.00',
      capacity: '100',
      description: 'Visão panorâmica elevada, entrada exclusiva e bar privativo',
    },
  ]);

  // Inline Ticketmaster Live Autocomplete State for Title Input
  const titleDropdownRef = useRef<HTMLDivElement>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<CatalogItem[]>([]);
  const [isSearchingTitle, setIsSearchingTitle] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [isManuallyOverridden, setIsManuallyOverridden] = useState(false);

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target as Node)) {
        setShowTitleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live query Ticketmaster as user types in the title input field
  useEffect(() => {
    const trimmed = title.trim();

    if (trimmed.length < 2 || isManuallyOverridden) {
      setTitleSuggestions([]);
      setShowTitleDropdown(false);
      setIsSearchingTitle(false);
      return;
    }

    let isMounted = true;
    setIsSearchingTitle(true);

    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/catalog/search', {
          params: {
            query: trimmed,
            source: 'TICKETMASTER',
          },
        });

        if (isMounted) {
          const items: CatalogItem[] = response.data.items || [];
          setTitleSuggestions(items);
          setShowTitleDropdown(items.length > 0);
        }
      } catch (err) {
        console.warn('Live title search error:', err);
      } finally {
        if (isMounted) {
          if (isMounted) {
            setIsSearchingTitle(false);
          }
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [title, isManuallyOverridden]);

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setTitle(item.title);
    setShowTitleDropdown(false);
    setIsManuallyOverridden(true);
    setDescription(item.description);
    setBannerUrl(item.backdropUrl || item.posterUrl || '');
    setExternalId(item.id);
    setExternalSource(item.source);
    setCategory(item.category || 'CONCERT');

    if (item.venue) {
      setVenue(item.venue);
    }

    if (item.releaseDate) {
      try {
        const eventDate = new Date(`${item.releaseDate}T20:00:00`);
        if (!isNaN(eventDate.getTime())) {
          setDate(eventDate.toISOString().slice(0, 16));
        }
      } catch (e) {
        // keep existing
      }
    }

    setType('GENERAL_ADMISSION');
  };

  // Ticket Tiers Helpers
  const handleAddTier = () => {
    const nextIndex = ticketTiers.length + 1;
    const newTier: TicketTierItem = {
      id: `tier-${Date.now()}`,
      name: nextIndex === 3 ? 'Área VIP' : `Setor ${nextIndex}`,
      price: '180.00',
      capacity: '100',
      description: 'Acesso diferenciado com benefícios exclusivos',
    };
    setTicketTiers((prev) => [...prev, newTier]);
  };

  const handleUpdateTier = (index: number, field: keyof TicketTierItem, value: string) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedGeneralCapacity = ticketTiers.reduce(
    (acc, curr) => acc + (parseInt(curr.capacity) || 0),
    0
  );

  const calculatedMinPrice =
    ticketTiers.length > 0
      ? Math.min(...ticketTiers.map((t) => parseFloat(t.price) || 0))
      : parseFloat(price) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formattedTiers =
        type === 'GENERAL_ADMISSION'
          ? ticketTiers.map((t) => ({
              id: t.id,
              name: t.name.trim(),
              price: parseFloat(t.price) || 0,
              capacity: parseInt(t.capacity) || 0,
              description: t.description.trim(),
            }))
          : undefined;

      const finalPrice =
        type === 'GENERAL_ADMISSION' && formattedTiers && formattedTiers.length > 0
          ? calculatedMinPrice
          : parseFloat(price);

      const finalCapacity =
        type === 'SEATED'
          ? rowsCount * seatsPerRow
          : formattedTiers && formattedTiers.length > 0
          ? calculatedGeneralCapacity
          : parseInt(capacity) || 500;

      const response = await api.post('/events', {
        title,
        description,
        category,
        type,
        venue,
        date: new Date(date).toISOString(),
        price: finalPrice,
        capacity: finalCapacity,
        ticketTiers: formattedTiers,
        bannerUrl: bannerUrl || null,
        externalId,
        externalSource,
        rowsCount: type === 'SEATED' ? rowsCount : undefined,
        seatsPerRow: type === 'SEATED' ? seatsPerRow : undefined,
      });

      navigate(`/event/${response.data.event.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao criar evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedCapacity =
    type === 'SEATED' ? rowsCount * seatsPerRow : calculatedGeneralCapacity;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Publicar Novo Evento</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Configure seu evento com diferentes tipos de ingressos (como <strong className="text-[#2b55f5]">Pista</strong> e <strong className="text-purple-600">Camarote</strong>) ou assentos marcados.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-sm text-rose-700 font-medium shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#2b55f5]" />
                <span>Informações do Evento</span>
              </h2>
              {externalSource === 'TICKETMASTER' && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#2b55f5] border border-blue-200">
                  Origem: Ticketmaster Discovery
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Title Input with Live Ticketmaster Suggestions */}
              <div className="relative" ref={titleDropdownRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Título do Evento *
                  </label>
                  {externalSource === 'TICKETMASTER' && (
                    <button
                      type="button"
                      onClick={() => {
                        setExternalId(null);
                        setExternalSource(null);
                        setIsManuallyOverridden(true);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                    >
                      Remover Vínculo Ticketmaster
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsManuallyOverridden(false);
                    }}
                    placeholder="Ex: Rock in Rio 2026, Guns N' Roses World Tour..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                  {isSearchingTitle && (
                    <div className="absolute right-3 top-3.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2b55f5]" />
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showTitleDropdown && titleSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Sugestões da API Ticketmaster</span>
                      <span>Selecione para preencher</span>
                    </div>
                    {titleSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCatalogItem(item)}
                        className="w-full p-3 text-left hover:bg-blue-50/60 border-b border-slate-100 last:border-0 flex items-center gap-3 transition"
                      >
                        <img
                          src={item.posterUrl || item.backdropUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{item.venue || item.city || 'Show Oficial'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Descrição Completa *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes sobre atrações, classificação indicativa e infraestrutura..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  >
                    <option value="CONCERT">Show / Festival / Concerto</option>
                    <option value="MOVIE">Cinema / Filme</option>
                    <option value="THEATER">Teatro / Espetáculo</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    URL do Banner / Poster
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                </div>
              </div>

              {/* Preview Visual do Banner / Poster */}
              {bannerUrl ? (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>🖼️ Preview do Banner do Evento</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Imagem carregada
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Remover imagem
                    </button>
                  </div>
                  <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner group">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-sm font-black truncate">{title || 'Título do Evento'}</p>
                      <p className="text-xs text-slate-300 font-medium truncate">{venue}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100">
                  <div className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#2b55f5]" />
                    <p className="text-xs font-medium text-slate-500 text-center px-4">
                      Digite o nome de um artista/evento oficial no título ou cole uma URL acima para ver o preview do banner.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Venue, Date & Modality */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Local, Data e Modalidade</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Local / Estádio / Sala *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ex: Allianz Parque, São Paulo - SP"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Data e Horário *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Lotação do Evento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('GENERAL_ADMISSION')}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition shadow-xs text-left flex items-center justify-between ${
                      type === 'GENERAL_ADMISSION'
                        ? 'bg-blue-50/60 text-[#2b55f5] border-[#2b55f5]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">🎟️ Setores & Tipos de Ingressos</p>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Pista, Camarote, VIP, etc.
                      </p>
                    </div>
                    {type === 'GENERAL_ADMISSION' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2b55f5]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('SEATED')}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition shadow-xs text-left flex items-center justify-between ${
                      type === 'SEATED'
                        ? 'bg-blue-50/60 text-[#2b55f5] border-[#2b55f5]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">🪑 Assentos Numerados</p>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Mapa interativo por poltronas
                      </p>
                    </div>
                    {type === 'SEATED' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2b55f5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTORS & TICKET TIERS CONFIGURATION (Pista e Camarote como padrão) ── */}
          {type === 'GENERAL_ADMISSION' ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#2b55f5]" />
                    <span>Tipos de Ingressos & Setores</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure os setores disponíveis para compra (Pista, Camarote, etc).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTier}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2b55f5] text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Tipo de Ingresso</span>
                </button>
              </div>

              {/* Tiers List */}
              <div className="space-y-4">
                {ticketTiers.map((tier, index) => (
                  <div
                    key={tier.id || index}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5 shadow-2xs relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#2b55f5] text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700">Setor #{index + 1}</span>
                      </div>

                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(index)}
                          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition p-1"
                          title="Remover setor"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remover</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nome do Tipo / Setor *
                        </label>
                        <input
                          type="text"
                          required
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(index, 'name', e.target.value)}
                          placeholder="Ex: Pista, Camarote, Área VIP"
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Preço Unitário (R$) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            step="0.50"
                            min="1"
                            required
                            value={tier.price}
                            onChange={(e) => handleUpdateTier(index, 'price', e.target.value)}
                            placeholder="120.00"
                            className="w-full pl-8 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Quantidade / Capacidade *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            min="1"
                            required
                            value={tier.capacity}
                            onChange={(e) => handleUpdateTier(index, 'capacity', e.target.value)}
                            placeholder="400"
                            className="w-full pl-8 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Benefícios / Descrição do Setor
                        </label>
                        <input
                          type="text"
                          value={tier.description}
                          onChange={(e) => handleUpdateTier(index, 'description', e.target.value)}
                          placeholder="Ex: Visão panorâmica elevada, entrada exclusiva e bar privativo"
                          className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2b55f5]" />
                  <span className="font-semibold text-slate-700">
                    Capacidade Total Somada: <strong className="text-slate-900 font-bold">{calculatedGeneralCapacity} ingressos</strong>
                  </span>
                </div>
                <div className="font-semibold text-slate-700">
                  Ingressos a partir de: <strong className="text-[#2b55f5] font-black text-sm">R$ {calculatedMinPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ) : (
            /* Seat Layout Configurator (For SEATED type) */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <span>Configuração da Grade de Assentos</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Total de {calculatedCapacity} assentos gerados automaticamente
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {rowsCount} Fileiras × {seatsPerRow} Assentos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preço Unitário da Poltrona (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Número de Fileiras (Letras A até {String.fromCharCode(64 + rowsCount)})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={rowsCount}
                    onChange={(e) => setRowsCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-3 px-5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando Evento...' : 'Publicar Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
