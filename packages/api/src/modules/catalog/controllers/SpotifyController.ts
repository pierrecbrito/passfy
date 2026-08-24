import { Request, Response } from 'express';
import axios from 'axios';
import { env } from '../../../core/config/env';

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (_cachedToken && Date.now() < _tokenExpiresAt) return _cachedToken;

  try {
    const res = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 6000,
      }
    );

    _cachedToken = res.data.access_token;
    // expire 60s before actual expiry
    _tokenExpiresAt = Date.now() + (res.data.expires_in - 60) * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

export const SpotifyController = {
  /**
   * GET /catalog/spotify?q=<event title>
   * Returns the first playlist found on Spotify for the query.
   * If no credentials are set, returns a curated fallback.
   */
  async searchPlaylist(req: Request, res: Response): Promise<void> {
    const query = (req.query.q as string || '').trim();

    if (!query) {
      res.status(400).json({ error: 'Missing query parameter q' });
      return;
    }

    const token = await getSpotifyToken();

    // ── LIVE PATH: Spotify API available ─────────────────────────────────
    if (token) {
      try {
        const searchRes = await axios.get('https://api.spotify.com/v1/search', {
          params: { q: query, type: 'playlist', limit: 1, market: 'BR' },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 6000,
        });

        const playlists = searchRes.data?.playlists?.items;
        if (playlists?.length > 0) {
          const pl = playlists[0];
          res.json({
            found: true,
            embedUrl: `https://open.spotify.com/embed/playlist/${pl.id}?utm_source=generator&theme=0`,
            name: pl.name,
            description: pl.description || '',
            ownerName: pl.owner?.display_name || 'Spotify',
            trackCount: pl.tracks?.total ?? 0,
            externalUrl: pl.external_urls?.spotify || `https://open.spotify.com/playlist/${pl.id}`,
          });
          return;
        }
      } catch {
        // Fall through to curated fallback
      }
    }

    // ── FALLBACK PATH: curated official playlists ─────────────────────────
    const q = query.toLowerCase();

    let embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1rVvRgNX2YR?utm_source=generator&theme=0';
    let name = 'Rock Classics';
    let externalUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX1rVvRgNX2YR';

    if (q.includes('coldplay')) {
      embedUrl = 'https://open.spotify.com/embed/artist/4gzpq5Yv4eYTN5I6iwW3N5?utm_source=generator&theme=0';
      name = 'Coldplay: Top Tracks';
      externalUrl = 'https://open.spotify.com/artist/4gzpq5Yv4eYTN5I6iwW3N5';
    } else if (q.includes('taylor') || q.includes('swift')) {
      embedUrl = 'https://open.spotify.com/embed/artist/06HL4z0CvFAxyc27GXpf02?utm_source=generator&theme=0';
      name = 'Taylor Swift: Top Tracks';
      externalUrl = 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02';
    } else if (q.includes('billie') || q.includes('eilish')) {
      embedUrl = 'https://open.spotify.com/embed/artist/6qqNVTkY8uBg9cP3Jd7DAH?utm_source=generator&theme=0';
      name = 'Billie Eilish: Top Tracks';
      externalUrl = 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH';
    } else if (q.includes('tomorrowland') || q.includes('edm') || q.includes('eletrô')) {
      embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6J5JvtNmNww?utm_source=generator&theme=0';
      name = 'Tomorrowland Mainstage Hits';
      externalUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX6J5JvtNmNww';
    } else if (q.includes('duna') || q.includes('dune')) {
      embedUrl = 'https://open.spotify.com/embed/album/3BZw3N1h57i68uH8S9Pz8k?utm_source=generator&theme=0';
      name = 'Dune: Part Two (OST) — Hans Zimmer';
      externalUrl = 'https://open.spotify.com/album/3BZw3N1h57i68uH8S9Pz8k';
    } else if (q.includes('rock')) {
      embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1rVvRgNX2YR?utm_source=generator&theme=0';
      name = 'Rock Classics';
      externalUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX1rVvRgNX2YR';
    } else if (q.includes('pop') || q.includes('hits')) {
      embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
      name = 'Today\'s Top Hits';
      externalUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
    } else if (q.includes('jazz') || q.includes('blues')) {
      embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator&theme=0';
      name = 'Jazz Classics';
      externalUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt';
    }

    res.json({
      found: false,
      embedUrl,
      name,
      description: 'Seleção curada relacionada ao evento',
      ownerName: 'Spotify Editorial',
      trackCount: null,
      externalUrl,
    });
  },
};
