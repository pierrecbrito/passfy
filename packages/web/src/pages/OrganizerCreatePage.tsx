import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
  Film,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Eye,
  Ticket,
  Music,
  Radio,
} from 'lucide-react';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  category: 'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER';
  source: 'TICKETMASTER' | 'TMDB' | 'MANUAL';
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

  // Catalog Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSource, setCatalogSource] = useState<'TICKETMASTER' | 'TMDB' | 'ALL'>('TICKETMASTER');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search catalog
  useEffect(() => {
    if (!isCatalogModalOpen) return;

    async function fetchCatalog() {
      setIsCatalogLoading(true);
      try {
        const response = await api.get('/catalog/search', {
          params: {
            query: catalogQuery.trim() || undefined,
            source: catalogSource,
          },
        });
        setCatalogItems(response.data.items || []);
      } catch (err) {
        console.error('Failed to search catalog:', err);
      } finally {
        setIsCatalogLoading(false);
      }
    }

    const timer = setTimeout(fetchCatalog, 250);
    return () => clearTimeout(timer);
  }, [catalogQuery, catalogSource, isCatalogModalOpen]);

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setBannerUrl(item.backdropUrl || item.posterUrl || '');
    setExternalId(item.id);
    setExternalSource(item.source);
    setCategory(item.category || (item.source === 'TICKETMASTER' ? 'CONCERT' : 'MOVIE'));

    if (item.venue) {
      setVenue(item.venue);
    }

    if (item.releaseDate) {
      // Set to 20:00 on event date
      try {
        const eventDate = new Date(`${item.releaseDate}T20:00:00`);
        if (!isNaN(eventDate.getTime())) {
          setDate(eventDate.toISOString().slice(0, 16));
        }
      } catch (e) {
        // keep existing
      }
    }

    if (item.source === 'TICKETMASTER') {
      setType('GENERAL_ADMISSION');
      setPrice('220.00');
    } else {
      setType('SEATED');
      setPrice('45.00');
    }

    setIsCatalogModalOpen(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Publicar Novo Evento</h1>
          <p className="text-sm text-slate-400">
            Importe dados ao vivo via <strong className="text-cyan-400">Ticketmaster Discovery</strong> / <strong className="text-indigo-400">TMDb</strong> ou preencha manualmente
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsCatalogModalOpen(true)}
          leftIcon={<Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />}
        >
          Importar do Catálogo Oficial
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-sm text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details Card */}
        <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand-400" />
              Informações do Evento
            </h2>
            {externalSource && (
              <Badge variant="primary" size="sm">
                Origem: {externalSource === 'TICKETMASTER' ? 'Ticketmaster Discovery' : 'TMDb Filmes'}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título do Evento *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Coldplay — Music of the Spheres World Tour"
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sinopse / Descrição *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da apresentação, festival ou sessão..."
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="CONCERT">Show / Festival / Concerto</option>
                  <option value="MOVIE">Cinema / Filme</option>
                  <option value="THEATER">Teatro / Espetáculo</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL do Banner / Poster
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {bannerUrl && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-2">Pré-visualização do Banner:</p>
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-700 max-w-lg">
                  <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Venue, Date & Pricing */}
        <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Local, Data e Preço
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Local / Estádio / Sala *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Ex: Allianz Parque, São Paulo - SP"
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Data e Horário *
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preço Unitário do Ingresso (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Lotação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('SEATED')}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border transition ${
                    type === 'SEATED'
                      ? 'bg-brand-600 text-white border-brand-400 shadow-glow'
                      : 'bg-surface-200 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  🪑 Assentos Marcados
                </button>
                <button
                  type="button"
                  onClick={() => setType('GENERAL_ADMISSION')}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border transition ${
                    type === 'GENERAL_ADMISSION'
                      ? 'bg-brand-600 text-white border-brand-400 shadow-glow'
                      : 'bg-surface-200 text-slate-400 border-slate-700 hover:bg-slate-700'
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
          <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Configuração da Grade de Assentos
                </h2>
                <p className="text-xs text-slate-400">
                  Total de {calculatedCapacity} assentos que serão gerados automaticamente no banco
                </p>
              </div>
              <Badge variant="primary" size="md">
                {rowsCount} Fileiras × {seatsPerRow} Assentos
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Número de Fileiras (Letras A até {String.fromCharCode(64 + rowsCount)})
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={rowsCount}
                  onChange={(e) => setRowsCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assentos por Fileira
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={seatsPerRow}
                  onChange={(e) => setSeatsPerRow(Math.min(16, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Seat Map Visual Mini Preview */}
            <div className="p-6 rounded-2xl bg-surface-200/50 border border-slate-800 text-center space-y-4">
              <div className="w-3/4 mx-auto py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
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
                            className="w-5 h-5 rounded-md bg-slate-700 border border-slate-600 flex items-center justify-center text-[9px] text-slate-300"
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
          <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" />
              Capacidade Total da Pista / Acesso Geral
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Capacidade Máxima de Ingressos
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Ex: 500"
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-xs"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<PlusCircle className="w-5 h-5" />}
          >
            Publicar Evento Agora
          </Button>
        </div>
      </form>

      {/* Ticketmaster & TMDb Multi-Source Catalog Modal */}
      <Modal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        title="Catálogo Oficial de Eventos & Atrações"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Source Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setCatalogSource('TICKETMASTER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                catalogSource === 'TICKETMASTER'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-surface-200 border border-slate-800'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ticketmaster Discovery</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogSource('TMDB')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                catalogSource === 'TMDB'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-surface-200 border border-slate-800'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>TMDb Filmes</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogSource('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                catalogSource === 'ALL'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-surface-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Todos</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={catalogQuery}
              onChange={(e) => setCatalogQuery(e.target.value)}
              placeholder={
                catalogSource === 'TICKETMASTER'
                  ? 'Buscar shows, turnês ou festivais no Ticketmaster (ex: Coldplay, Taylor Swift, Rock in Rio)...'
                  : 'Buscar filmes no TMDb (ex: Duna, Deadpool, Divertida Mente)...'
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-200 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {isCatalogLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Carregando eventos via {catalogSource === 'TICKETMASTER' ? 'Ticketmaster Discovery API v2' : 'TMDb'}...
              </div>
            ) : catalogItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum evento encontrado para "{catalogQuery}".
              </div>
            ) : (
              catalogItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectCatalogItem(item)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-surface-200/60 hover:bg-slate-800/80 border border-slate-800 hover:border-brand-500/40 transition cursor-pointer group"
                >
                  <img
                    src={
                      item.posterUrl ||
                      item.backdropUrl ||
                      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          item.source === 'TICKETMASTER'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {item.source === 'TICKETMASTER' ? 'Ticketmaster' : 'TMDb'}
                      </span>
                      {item.category && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.category === 'CONCERT' ? '🎵 Show / Concerto' : '🎬 Filme'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                      {item.venue && (
                        <span className="flex items-center gap-1 text-slate-400 truncate">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          {item.venue}
                        </span>
                      )}
                      {item.releaseDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {item.releaseDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary">
                    Importar
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
