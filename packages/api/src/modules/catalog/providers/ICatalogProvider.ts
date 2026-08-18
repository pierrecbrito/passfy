export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  category: 'MOVIE' | 'CONCERT';
  source: 'TMDB' | 'TICKETMASTER' | 'MANUAL';
}

export interface ICatalogProvider {
  search(query: string): Promise<CatalogItem[]>;
  getTrending(): Promise<CatalogItem[]>;
  getById(id: string): Promise<CatalogItem | null>;
}
