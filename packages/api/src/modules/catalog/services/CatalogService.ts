import { ICatalogProvider, CatalogItem } from '../providers/ICatalogProvider';
import { TicketmasterCatalogProvider } from '../providers/TicketmasterCatalogProvider';

export class CatalogService {
  private readonly ticketmasterProvider: ICatalogProvider;

  constructor(
    ticketmasterProvider: ICatalogProvider = new TicketmasterCatalogProvider()
  ) {
    this.ticketmasterProvider = ticketmasterProvider;
  }

  async search(query: string): Promise<CatalogItem[]> {
    return !query || query.trim().length === 0
      ? this.ticketmasterProvider.getTrending()
      : this.ticketmasterProvider.search(query.trim());
  }

  async getTrending(): Promise<CatalogItem[]> {
    return this.ticketmasterProvider.getTrending();
  }

  async getById(id: string): Promise<CatalogItem | null> {
    return this.ticketmasterProvider.getById(id);
  }
}
