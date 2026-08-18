import { ICatalogProvider } from '../providers/ICatalogProvider';
import { TmdbCatalogProvider } from '../providers/TmdbCatalogProvider';

export class CatalogService {
  private readonly provider: ICatalogProvider;

  constructor(provider: ICatalogProvider = new TmdbCatalogProvider()) {
    this.provider = provider;
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return this.provider.getTrending();
    }
    return this.provider.search(query.trim());
  }

  async getTrending() {
    return this.provider.getTrending();
  }

  async getById(id: string) {
    return this.provider.getById(id);
  }
}
