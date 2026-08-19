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

export const OrganizerCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER'>('CONCERT');
  const [type, setType] = useState<'SEATED' | 'GENERAL_ADMISSION'>('SEATED');
  const [venue, setVenue] = useState('Allianz Parque, São Paulo - SP');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(21, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [price, setPrice] = useState('180.00');
  const [capacity, setCapacity] = useState('500');
  const [bannerUrl, setBannerUrl] = useState('');
  const [externalId, setExternalId] = useState<string | null>(null);
  const [externalSource, setExternalSource] = useState<string | null>(null);
  const [rowsCount, setRowsCount] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(10);

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
          setIsSearchingTitle(false);
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
    setPrice('220.00');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/events', {
        title,
        description,
        category,
        type,
        venue,
        date: new Date(date).toISOString(),
        price: parseFloat(price),
        capacity: type === 'SEATED' ? rowsCount * seatsPerRow : parseInt(capacity),
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

  const calculatedCapacity = type === 'SEATED' ? rowsCount * seatsPerRow : parseInt(capacity) || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Publicar Novo Evento</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Digite o nome da turnê no título para autocompletar via <strong className="text-[#2b55f5]">Ticketmaster Discovery</strong> ou preencha todos os campos manualmente.
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
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Vinculado ao Ticketmaster</span>
                      <button
                        type="button"
                        onClick={() => {
                          setExternalId(null);
                          setExternalSource(null);
                          setIsManuallyOverridden(true);
                        }}
                        className="ml-1 text-slate-400 hover:text-slate-700 font-bold"
                        title="Desvincular e editar manualmente"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
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
                      if (e.target.value.trim().length >= 2) {
                        setShowTitleDropdown(true);
                      }
                    }}
                    onFocus={() => {
                      if (titleSuggestions.length > 0 && !isManuallyOverridden) {
                        setShowTitleDropdown(true);
                      }
                    }}
                    placeholder="Digite o título ou nome da turnê (ex: Chitãozinho, Coldplay, Rock in Rio...)"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />

                  {isSearchingTitle ? (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#2b55f5]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : title ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setTitleSuggestions([]);
                        setShowTitleDropdown(false);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

                {/* Suggestions Dropdown Popover */}
                {showTitleDropdown && titleSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Sugestões Disponíveis no Ticketmaster ({titleSuggestions.length}):</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Selecione para preencher tudo</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {titleSuggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectCatalogItem(item)}
                          className="p-3 flex items-center gap-3.5 hover:bg-blue-50/70 transition cursor-pointer group"
                        >
                          <img
                            src={
                              item.posterUrl ||
                              item.backdropUrl ||
                              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={item.title}
                            className="w-12 h-14 object-cover rounded-lg shrink-0 border border-slate-200 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                                Ticketmaster
                              </span>
                              {item.category && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {item.category === 'CONCERT' ? '🎵 Show' : '🎬 Filme'}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#2b55f5] transition truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-medium">
                              {item.venue && (
                                <span className="flex items-center gap-1 truncate text-slate-600">
                                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate">{item.venue}</span>
                                </span>
                              )}
                              {item.releaseDate && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{item.releaseDate}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-white group-hover:bg-[#2b55f5] text-slate-700 group-hover:text-white border border-slate-300 group-hover:border-[#2b55f5] text-xs font-bold transition shadow-xs shrink-0"
                          >
                            Selecionar
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Manual override action bar */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTitleDropdown(false);
                          setIsManuallyOverridden(true);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1"
                      >
                        <span>✍️ Continuar com "{title}" manualmente</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTitleDropdown(false)}
                        className="text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sinopse / Descrição *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os detalhes da apresentação, festival ou sessão..."
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

              {bannerUrl && (
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                      <span>📸 Pré-visualização da Capa / Banner:</span>
                      <span className="text-[11px] text-slate-400 font-normal">(Visão dos Compradores)</span>
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">Proporção 16:9 Panorâmica</span>
                  </div>

                  <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 group">
                    <img
                      src={bannerUrl}
                      alt="Prévia da Capa do Evento"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none flex items-end justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-bold text-white mb-2">
                          {category === 'MOVIE' ? '🎬 Cinema' : category === 'CONCERT' ? '🎵 Show' : '🎭 Teatro'}
                        </span>
                        <h4 className="text-lg sm:text-2xl font-black drop-shadow-md line-clamp-1">
                          {title || 'Título do seu Evento'}
                        </h4>
                        <p className="text-xs text-slate-200 drop-shadow-sm mt-0.5 line-clamp-1">
                          {venue || 'Local do Evento'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Venue, Date & Pricing */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Local, Data e Preço</span>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preço Unitário do Ingresso (R$) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Lotação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('SEATED')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition shadow-xs ${
                      type === 'SEATED'
                        ? 'bg-[#2b55f5] text-white border-[#2b55f5]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    🪑 Assentos Marcados
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('GENERAL_ADMISSION')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition shadow-xs ${
                      type === 'GENERAL_ADMISSION'
                        ? 'bg-[#2b55f5] text-white border-[#2b55f5]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    🎟️ Pista / Geral
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Layout Configurator (For SEATED type) */}
          {type === 'SEATED' ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <span>Configuração da Grade de Assentos</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Total de {calculatedCapacity} assentos que serão gerados automaticamente
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {rowsCount} Fileiras × {seatsPerRow} Assentos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assentos por Fileira
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(Math.min(16, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs"
                  />
                </div>
              </div>

              {/* Seat Map Visual Mini Preview */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-3/4 mx-auto py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-[#2b55f5] uppercase tracking-widest font-bold">
                  Palco / Tela de Projeção
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pt-2">
                  {Array.from({ length: rowsCount }).map((_, r) => {
                    const rowLetter = String.fromCharCode(65 + r);
                    return (
                      <div key={rowLetter} className="flex items-center justify-center gap-1.5">
                        <span className="w-4 text-xs font-bold text-slate-500">{rowLetter}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: seatsPerRow }).map((_, num) => (
                            <div
                              key={num}
                              className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center text-[9px] text-slate-700 font-bold shadow-xs"
                            >
                              {num + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#2b55f5]" />
                <span>Capacidade Total da Pista / Acesso Geral</span>
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Capacidade Máxima de Ingressos
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2b55f5] shadow-xs max-w-xs"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-3 px-5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-bold bg-[#2b55f5] hover:bg-[#1f44d6] text-white shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Evento Agora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
