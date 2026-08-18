import axios from 'axios';
import { env } from '../../../core/config/env';
import { CatalogItem, ICatalogProvider } from './ICatalogProvider';

// Curated fallback Ticketmaster events for offline / zero-key testing & demo reliability
const FALLBACK_TICKETMASTER_EVENTS: CatalogItem[] = [
  {
    id: 'tm-coldplay-2026',
    title: 'Coldplay — Music of the Spheres World Tour',
    description:
      'A aclamada turnê mundial da banda britânica Coldplay, repleta de efeitos visuais imersivos, pulseiras de LED e os maiores sucessos da carreira.',
    posterUrl:
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-09-15',
    category: 'CONCERT',
    source: 'TICKETMASTER',
    venue: 'Estádio MorumBIS, São Paulo - SP',
    city: 'São Paulo',
    url: 'https://ticketmaster.com',
  },
  {
    id: 'tm-rockinrio-2026',
    title: 'Rock World Festival 2026 — Palco Mundo',
    description:
      'O maior festival de música e entretenimento do planeta reunindo os principais nomes do rock, pop e música eletrônica internacional.',
    posterUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-10-18',
    category: 'CONCERT',
    source: 'TICKETMASTER',
    venue: 'Cidade do Rock, Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    url: 'https://ticketmaster.com',
  },
  {
    id: 'tm-taylor-swift-eras',
    title: 'Taylor Swift | The Eras Tour VIP Night',
    description:
      'Uma celebração inesquecível de todas as eras musicais de Taylor Swift em uma apresentação de mais de 3 horas com estrutura monumental.',
    posterUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-11-20',
    category: 'CONCERT',
    source: 'TICKETMASTER',
    venue: 'Allianz Parque, São Paulo - SP',
    city: 'São Paulo',
    url: 'https://ticketmaster.com',
  },
  {
    id: 'tm-tomorrowland-br',
    title: 'Tomorrowland Brasil 2026 — Mainstage Experience',
    description:
      'O festival belga de música eletrônica mais mágico do mundo traz seus temas lendários, pirotecnia mágica e os melhores DJs globais.',
    posterUrl:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-10-10',
    category: 'CONCERT',
    source: 'TICKETMASTER',
    venue: 'Parque Maeda, Itu - SP',
    city: 'Itu',
    url: 'https://ticketmaster.com',
  },
  {
    id: 'tm-billie-eilish-2026',
    title: 'Billie Eilish — Hit Me Hard and Soft Tour',
    description:
      'A sensação global Billie Eilish em uma turnê eletrizante e intimista apresentando seus maiores hits e os arranjos inovadores do novo álbum.',
    posterUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-12-05',
    category: 'CONCERT',
    source: 'TICKETMASTER',
    venue: 'Farmasi Arena, Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    url: 'https://ticketmaster.com',
  },
  {
    id: 'tm-cirque-du-soleil',
    title: 'Cirque du Soleil — Crystal On Ice',
    description:
      'A fusão emocionante da arte circense com o patinar no gelo de alta performance, acrobacias vertiginosas e projeções visuais de tirar o fôlego.',
    posterUrl:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=780&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    releaseDate: '2026-08-30',
    category: 'THEATER',
    source: 'TICKETMASTER',
    venue: 'Ginásio do Ibirapuera, São Paulo - SP',
    city: 'São Paulo',
    url: 'https://ticketmaster.com',
  },
];

export class TicketmasterCatalogProvider implements ICatalogProvider {
  private readonly client = axios.create({
    baseURL: env.TICKETMASTER_BASE_URL,
    timeout: 5000,
  });

  async search(query: string): Promise<CatalogItem[]> {
    if (!env.TICKETMASTER_API_KEY) {
      const lower = query.toLowerCase();
      return FALLBACK_TICKETMASTER_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.description.toLowerCase().includes(lower) ||
          (e.venue && e.venue.toLowerCase().includes(lower))
      );
    }

    try {
      const response = await this.client.get('/events.json', {
        params: {
          apikey: env.TICKETMASTER_API_KEY,
          keyword: query,
          size: 20,
          locale: '*',
        },
      });

      const events = response.data._embedded?.events || [];
      return events.map((item: any) => this.mapEventToCatalogItem(item));
    } catch (error) {
      console.warn('Ticketmaster Discovery API call failed or key expired, falling back to curated dataset.');
      const lower = query.toLowerCase();
      return FALLBACK_TICKETMASTER_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.description.toLowerCase().includes(lower) ||
          (e.venue && e.venue.toLowerCase().includes(lower))
      );
    }
  }

  async getTrending(): Promise<CatalogItem[]> {
    if (!env.TICKETMASTER_API_KEY) {
      return FALLBACK_TICKETMASTER_EVENTS;
    }

    try {
      const response = await this.client.get('/events.json', {
        params: {
          apikey: env.TICKETMASTER_API_KEY,
          classificationName: 'music',
          sort: 'relevance,desc',
          size: 20,
          locale: '*',
        },
      });

      const events = response.data._embedded?.events || [];
      return events.map((item: any) => this.mapEventToCatalogItem(item));
    } catch (error) {
      console.warn('Ticketmaster Discovery API trending failed, falling back to curated dataset.');
      return FALLBACK_TICKETMASTER_EVENTS;
    }
  }

  async getById(id: string): Promise<CatalogItem | null> {
    if (!env.TICKETMASTER_API_KEY) {
      return FALLBACK_TICKETMASTER_EVENTS.find((e) => e.id === id) || null;
    }

    try {
      const response = await this.client.get(`/events/${id}.json`, {
        params: {
          apikey: env.TICKETMASTER_API_KEY,
        },
      });

      return this.mapEventToCatalogItem(response.data);
    } catch (error) {
      return FALLBACK_TICKETMASTER_EVENTS.find((e) => e.id === id) || null;
    }
  }

  private mapEventToCatalogItem(item: any): CatalogItem {
    // Select best resolution images
    const images = item.images || [];
    const backdropImg =
      images.find((img: any) => img.ratio === '16_9' && img.width >= 1000) ||
      images.find((img: any) => img.ratio === '16_9') ||
      images[0];

    const posterImg =
      images.find((img: any) => img.ratio === '3_2' || img.ratio === '4_3') ||
      images[0];

    // Venue details
    const venueObj = item._embedded?.venues?.[0];
    const venueName = venueObj ? `${venueObj.name}${venueObj.city ? `, ${venueObj.city.name}` : ''}` : undefined;
    const cityName = venueObj?.city?.name;

    // Classification to category
    const segment = item.classifications?.[0]?.segment?.name?.toLowerCase() || '';
    let category: 'MOVIE' | 'CONCERT' | 'THEATER' | 'OTHER' = 'CONCERT';
    if (segment.includes('theatre') || segment.includes('arts')) {
      category = 'THEATER';
    } else if (segment.includes('film') || segment.includes('movie')) {
      category = 'MOVIE';
    } else if (segment.includes('music') || segment.includes('concert')) {
      category = 'CONCERT';
    }

    return {
      id: String(item.id),
      title: item.name || 'Evento sem título',
      description:
        item.info ||
        item.pleaseNote ||
        item.description ||
        `Apresentação ao vivo de ${item.name} com ingressos oficiais garantidos via Ticketmaster Discovery.`,
      posterUrl: posterImg?.url || null,
      backdropUrl: backdropImg?.url || null,
      releaseDate: item.dates?.start?.localDate || '',
      category,
      source: 'TICKETMASTER',
      venue: venueName,
      city: cityName,
      url: item.url,
    };
  }
}
