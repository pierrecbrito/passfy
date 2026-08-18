import React, { useEffect, useState } from 'react';
import { ExternalLink, Music, Radio, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface SpotifyShowCardProps {
  event: {
    title: string;
    venue: string;
    category: string;
    bannerUrl?: string | null;
  };
}

interface SpotifyPlaylist {
  found: boolean;
  embedUrl: string;
  name: string;
  description: string;
  ownerName: string;
  trackCount: number | null;
  externalUrl: string;
}

export const SpotifyShowCard: React.FC<SpotifyShowCardProps> = ({ event }) => {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPlaylist = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await api.get('/catalog/spotify', {
          params: { q: event.title },
        });
        if (!cancelled) setPlaylist(res.data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPlaylist();
    return () => { cancelled = true; };
  }, [event.title]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-md border border-slate-800 transition-all relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
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
              {isLoading ? 'Buscando playlist...' : (playlist?.name ?? 'Setlist do Evento')}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Áudio Oficial</span>
        </span>
      </div>

      {/* Player Body */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[152px] bg-slate-950/80 rounded-2xl border border-slate-800 gap-3">
          <Loader2 className="w-6 h-6 text-[#1DB954] animate-spin" />
          <p className="text-[11px] text-slate-400 font-semibold">
            Buscando playlist relacionada ao evento...
          </p>
        </div>
      ) : error || !playlist ? (
        <div className="flex flex-col items-center justify-center h-[152px] bg-slate-950/80 rounded-2xl border border-slate-800 gap-3">
          <Music className="w-6 h-6 text-slate-600" />
          <p className="text-[11px] text-slate-400 font-semibold text-center px-4">
            Não foi possível carregar a playlist.
          </p>
        </div>
      ) : (
        <>
          {/* Official Spotify Compact Embed (152px matches Spotify official compact player height with 0 wasted space) */}
          <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-800 bg-slate-950">
            <iframe
              key={playlist.embedUrl}
              title={`Spotify Player — ${playlist.name}`}
              src={playlist.embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '16px', display: 'block' }}
            />
          </div>

          {/* Metadata & deep link */}
          <div className="flex items-center justify-between gap-3 text-xs pt-1">
            <div className="text-[11px] text-slate-400 font-medium leading-relaxed truncate">
              <span className="font-bold text-slate-300">{playlist.name}</span>
              {playlist.ownerName && (
                <span className="text-slate-500"> · por {playlist.ownerName}</span>
              )}
              {playlist.trackCount != null && (
                <span className="text-slate-500"> · {playlist.trackCount} faixas</span>
              )}
            </div>

            <a
              href={playlist.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#1DB954] hover:underline shrink-0"
            >
              <span>Abrir no App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </>
      )}
    </div>
  );
};
