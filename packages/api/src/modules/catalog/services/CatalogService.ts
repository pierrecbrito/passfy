import { ICatalogProvider, CatalogItem } from '../providers/ICatalogProvider';
import { TmdbCatalogProvider } from '../providers/TmdbCatalogProvider';
import { TicketmasterCatalogProvider } from '../providers/TicketmasterCatalogProvider';

export class CatalogService {
  private readonly tmdbProvider: ICatalogProvider;
  private readonly ticketmasterProvider: ICatalogProvider;

  constructor(
    tmdbProvider: ICatalogProvider = new TmdbCatalogProvider(),
    ticketmasterProvider: ICatalogProvider = new TicketmasterCatalogProvider()
  ) {
    this.tmdbProvider = tmdbProvider;
    this.ticketmasterProvider = ticketmasterProvider;
  }

  async search(
    query: string,
    source: 'TICKETMASTER' | 'TMDB' | 'ALL' = 'TICKETMASTER'
  ): Promise<CatalogItem[]> {
    if (source === 'TMDB') {
      return !query || query.trim().length === 0
        ? this.tmdbProvider.getTrending()
        : this.tmdbProvider.search(query.trim());
    }

    if (source === 'TICKETMASTER') {
      return !query || query.trim().length === 0
        ? this.ticketmasterProvider.getTrending()
        : this.ticketmasterProvider.search(query.trim());
    }

    // ALL: search both providers in parallel
    const [tmItems, tmdbItems] = await Promise.all([
      !query || query.trim().length === 0
        ? this.ticketmasterProvider.getTrending()
        : this.ticketmasterProvider.search(query.trim()),
      !query || query.trim().length === 0
        ? this.tmdbProvider.getTrending()
        : this.tmdbProvider.search(query.trim()),
    ]);

    return [...tmItems, ...tmdbItems];
  }

  async getTrending(
    source: 'TICKETMASTER' | 'TMDB' | 'ALL' = 'TICKETMASTER'
  ): Promise<CatalogItem[]> {
    if (source === 'TMDB') return this.tmdbProvider.getTrending();
    if (source === 'TICKETMASTER') return this.ticketmasterProvider.getTrending();

    const [tmItems, tmdbItems] = await Promise.all([
      this.ticketmasterProvider.getTrending(),
      this.tmdbProvider.getTrending(),
    ]);
    return [...tmItems, ...tmdbItems];
  }

  async getById(
    id: string,
    source: 'TICKETMASTER' | 'TMDB' | 'ALL' = 'TICKETMASTER'
  ): Promise<CatalogItem | null> {
    if (source === 'TMDB') return this.tmdbProvider.getById(id);
    if (source === 'TICKETMASTER') return this.ticketmasterProvider.getById(id);

    const tmItem = await this.ticketmasterProvider.getById(id);
    if (tmItem) return tmItem;
    return this.tmdbProvider.getById(id);
  }
}
