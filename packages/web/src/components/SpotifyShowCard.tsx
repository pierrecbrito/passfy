import React, { useState } from 'react';
import {
  ExternalLink,
  Music,
  Radio,
  Sparkles,
} from 'lucide-react';

interface SpotifyShowCardProps {
  event: {
    title: string;
    venue: string;
    category: string;
    bannerUrl?: string | null;
  };
}

export const SpotifyShowCard: React.FC<SpotifyShowCardProps> = ({ event }) => {
  const titleLower = event.title.toLowerCase();

  // Map events to official Spotify Embed URIs (Artists, Official Albums or Curated Tour Playlists)
  let spotifyEmbedUri = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1rVvRgNX2YR'; // Rock Classics default
  let artistOrShowName = 'Rock Classics & Festivais';
  let categoryLabel = 'Playlist Oficial do Festival';
  let directSpotifyUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX1rVvRgNX2YR';

  if (titleLower.includes('coldplay')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/artist/4gzpq5Yv4eYTN5I6iwW3N5?utm_source=generator&theme=0';
    artistOrShowName = 'Coldplay — Music of the Spheres Tour';
    categoryLabel = 'Setlist Oficial do Artista';
    directSpotifyUrl = 'https://open.spotify.com/artist/4gzpq5Yv4eYTN5I6iwW3N5';
  } else if (titleLower.includes('rock in rio') || titleLower.includes('rock world') || titleLower.includes('rock')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1rVvRgNX2YR?utm_source=generator&theme=0';
    artistOrShowName = 'Rock World Classics & Anthems';
    categoryLabel = 'Setlist Curada do Festival';
    directSpotifyUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX1rVvRgNX2YR';
  } else if (titleLower.includes('taylor') || titleLower.includes('swift')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/artist/06HL4z0CvFAxyc27GXpf02?utm_source=generator&theme=0';
    artistOrShowName = 'Taylor Swift — The Eras Tour';
    categoryLabel = 'Discografia Oficial no Spotify';
    directSpotifyUrl = 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02';
  } else if (titleLower.includes('tomorrowland') || titleLower.includes('alok') || titleLower.includes('vintage')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6J5JvtNmNww?utm_source=generator&theme=0';
    artistOrShowName = 'Tomorrowland Mainstage Hits';
    categoryLabel = 'Setlist Oficial EDM & Eletrônica';
    directSpotifyUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX6J5JvtNmNww';
  } else if (titleLower.includes('billie') || titleLower.includes('eilish')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/artist/6qqNVTkY8uBg9cP3Jd7DAH?utm_source=generator&theme=0';
    artistOrShowName = 'Billie Eilish — HIT ME HARD AND SOFT';
    categoryLabel = 'Álbum e Músicas da Turnê';
    directSpotifyUrl = 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH';
  } else if (titleLower.includes('duna') || titleLower.includes('dune')) {
    spotifyEmbedUri = 'https://open.spotify.com/embed/album/3BZw3N1h57i68uH8S9Pz8k?utm_source=generator&theme=0';
    artistOrShowName = 'Hans Zimmer — Dune: Part Two (OST)';
    categoryLabel = 'Trilha Sonora Original Oficial';
    directSpotifyUrl = 'https://open.spotify.com/album/3BZw3N1h57i68uH8S9Pz8k';
  } else {
    // Generic top hits playlist
    spotifyEmbedUri = `https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0`;
    artistOrShowName = event.title.split('—')[0].split('-')[0].trim();
    categoryLabel = 'Top Músicas da Turnê';
    directSpotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(event.title)}`;
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-md border border-slate-800 transition-all relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Official Spotify Branding */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1DB954] text-slate-950 flex items-center justify-center shadow-xs shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.307a.754.754 0 01-1.037.248c-2.839-1.735-6.413-2.128-10.622-1.166a.75.75 0 11-.336-1.462c4.607-1.053 8.563-.61 11.747 1.343.348.213.46.669.248 1.037zm1.467-3.261a.94.94 0 01-1.293.31c-3.249-1.996-8.204-2.574-12.049-1.407a.94.94 0 01-.555-1.796c4.394-1.334 9.855-.688 13.587 1.6a.94.94 0 01.31 1.293zm.126-3.395c-3.896-2.314-10.323-2.528-14.05-1.396a1.127 1.127 0 11-.652-2.158c4.285-1.3 11.385-1.052 15.86 1.606a1.127 1.127 0 11-1.158 1.948z"/>
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1DB954] block">
              Player Oficial Spotify
            </span>
            <h4 className="text-sm font-black text-white truncate max-w-[200px]">
              {categoryLabel}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Áudio Oficial</span>
        </span>
      </div>

      {/* Official Spotify Embed Player Widget */}
      <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-800 bg-slate-950">
        <iframe
          title={`Spotify Player - ${artistOrShowName}`}
          src={spotifyEmbedUri}
          width="100%"
          height="280"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-2xl"
          style={{ borderRadius: '16px' }}
        />
      </div>

      {/* Direct Spotify Deep Link */}
      <div className="pt-1 flex items-center justify-between gap-3 text-xs">
        <span className="text-[11px] text-slate-400 font-medium">
          Músicas sincronizadas com a turnê
        </span>

        <a
          href={directSpotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-[#1DB954] hover:underline"
        >
          <span>Abrir no App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
