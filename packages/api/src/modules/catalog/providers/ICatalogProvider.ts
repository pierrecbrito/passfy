export interface CatalogItem {
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
  url?: string;
}

export interface ICatalogProvider {
  search(query: string): Promise<CatalogItem[]>;
  getTrending(): Promise<CatalogItem[]>;
  getById(id: string): Promise<CatalogItem | null>;
}
