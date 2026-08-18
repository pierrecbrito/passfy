import axios from 'axios';
import { env } from '../../../core/config/env';
import { CatalogItem, ICatalogProvider } from './ICatalogProvider';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

// Curated fallback movies for offline / zero-key testing
const FALLBACK_MOVIES: CatalogItem[] = [
  {
    id: '693134',
    title: 'Duna: Parte 2',
    description:
      'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/5aUVlvr5t0p89JgK6W6Y5CjYyA5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    releaseDate: '2024-02-27',
    category: 'MOVIE',
    source: 'TMDB',
  },
  {
    id: '1022789',
    title: 'Divertida Mente 2',
    description:
      'Com a chegada da adolescência, a sala de comando de Riley passa por uma reforma para abrir espaço para novas emoções.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/stKGOm8ffToIgIlj57jhY2PNDGl.jpg',
    releaseDate: '2024-06-11',
    category: 'MOVIE',
    source: 'TMDB',
  },
  {
    id: '533535',
    title: 'Deadpool & Wolverine',
    description:
      'Wade Wilson e Wolverine unem forças em uma missão multiversal cheia de ação, sarcasmo e caos.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/9l1eZiJHmhnNXghMU2UMWuZqKu.jpg',
    releaseDate: '2024-07-24',
    category: 'MOVIE',
    source: 'TMDB',
  },
  {
    id: '945961',
    title: 'Alien: Romulus',
    description:
      'Jovens colonizadores espaciais encontram a forma de vida mais aterrorizante do universo em uma estação abandonada.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/b33nnKl1v074FdILTH0xYVlX0hM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    releaseDate: '2024-08-13',
    category: 'MOVIE',
    source: 'TMDB',
  },
  {
    id: '573435',
    title: 'Bad Boys: Até o Fim',
    description:
      'Os detetives Mike Lowrey e Marcus Burnett enfrentam um esquema de corrupção dentro da polícia de Miami.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/ga4OLm4qLxOqTquZCcjBv1t1q4v.jpg',
    releaseDate: '2024-06-05',
    category: 'MOVIE',
    source: 'TMDB',
  },
];

export class TmdbCatalogProvider implements ICatalogProvider {
  private readonly client = axios.create({
    baseURL: env.TMDB_BASE_URL,
    params: {
      api_key: env.TMDB_API_KEY,
      language: 'pt-BR',
    },
    timeout: 5000,
  });

  async search(query: string): Promise<CatalogItem[]> {
    if (!env.TMDB_API_KEY) {
      const lower = query.toLowerCase();
      return FALLBACK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(lower) ||
          m.description.toLowerCase().includes(lower)
      );
    }

    try {
      const response = await this.client.get('/search/movie', {
        params: { query },
      });

      return (response.data.results || []).map((item: any) => this.mapMovieToCatalogItem(item));
    } catch (error) {
      console.warn('TMDb search API failed or key expired, falling back to local dataset.');
      const lower = query.toLowerCase();
      return FALLBACK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(lower) ||
          m.description.toLowerCase().includes(lower)
      );
    }
  }

  async getTrending(): Promise<CatalogItem[]> {
    if (!env.TMDB_API_KEY) {
      return FALLBACK_MOVIES;
    }

    try {
      const response = await this.client.get('/trending/movie/week');
      return (response.data.results || []).map((item: any) => this.mapMovieToCatalogItem(item));
    } catch (error) {
      console.warn('TMDb trending API failed or key expired, falling back to local dataset.');
      return FALLBACK_MOVIES;
    }
  }

  async getById(id: string): Promise<CatalogItem | null> {
    if (!env.TMDB_API_KEY) {
      return FALLBACK_MOVIES.find((m) => m.id === id) || null;
    }

    try {
      const response = await this.client.get(`/movie/${id}`);
      return this.mapMovieToCatalogItem(response.data);
    } catch (error) {
      return FALLBACK_MOVIES.find((m) => m.id === id) || null;
    }
  }

  private mapMovieToCatalogItem(item: any): CatalogItem {
    return {
      id: String(item.id),
      title: item.title || item.original_title || 'Sem título',
      description: item.overview || 'Sem descrição disponível.',
      posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
      backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}` : null,
      releaseDate: item.release_date || '',
      category: 'MOVIE',
      source: 'TMDB',
    };
  }
}
