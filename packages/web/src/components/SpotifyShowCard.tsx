import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  ExternalLink,
  Volume2,
  Sparkles,
  Music,
  CheckCircle,
  Radio,
  Share2,
} from 'lucide-react';

interface SpotifyShowCardProps {
  event: {
    title: string;
    venue: string;
    category: string;
    bannerUrl?: string | null;
  };
}

interface Track {
  id: number;
  title: string;
  album: string;
  duration: string;
  plays: string;
  notes?: number[];
}

export const SpotifyShowCard: React.FC<SpotifyShowCardProps> = ({ event }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<any>(null);

  // Derive artist and preset setlists based on event title
  const titleLower = event.title.toLowerCase();

  let artistName = 'Artista Oficial';
  let monthlyListeners = '45.890.120';
  let artistGenre = 'Pop / Rock / Alternativo';
  let spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(event.title)}`;
  let tracks: Track[] = [];

  if (titleLower.includes('coldplay')) {
    artistName = 'Coldplay';
    monthlyListeners = '82.450.800';
    artistGenre = 'Pop Rock • Britpop';
    spotifySearchUrl = 'https://open.spotify.com/artist/4gzpq5Yv4eYTN5I6iwW3N5';
    tracks = [
      { id: 1, title: 'Viva La Vida', album: 'Viva la Vida or Death and All His Friends', duration: '4:01', plays: '1.9B', notes: [523.25, 659.25, 783.99, 1046.5] },
      { id: 2, title: 'Yellow', album: 'Parachutes', duration: '4:29', plays: '2.4B', notes: [440, 554.37, 659.25, 880] },
      { id: 3, title: 'Fix You', album: 'X&Y', duration: '4:54', plays: '1.8B', notes: [392, 493.88, 587.33, 783.99] },
      { id: 4, title: 'A Sky Full of Stars', album: 'Ghost Stories', duration: '4:28', plays: '1.5B', notes: [587.33, 659.25, 880, 1174.66] },
    ];
  } else if (titleLower.includes('rock in rio') || titleLower.includes('rock world')) {
    artistName = 'Rock in Rio Official Lineup';
    monthlyListeners = '12.300.450';
    artistGenre = 'Festival • Rock • Indie • Heavy Metal';
    spotifySearchUrl = 'https://open.spotify.com/search/Rock%20in%20Rio';
    tracks = [
      { id: 1, title: 'Rock You Like a Hurricane', album: 'Rock Legends Fest', duration: '4:15', plays: '890M', notes: [440, 523.25, 659.25, 880] },
      { id: 2, title: 'Highway to Sound', album: 'Palco Mundo Live', duration: '3:48', plays: '640M', notes: [392, 440, 587.33, 783.99] },
      { id: 3, title: 'Bohemian Anthem', album: 'Cidade do Rock Live', duration: '5:55', plays: '2.1B', notes: [523.25, 659.25, 783.99, 1046.5] },
    ];
  } else if (titleLower.includes('taylor') || titleLower.includes('swift')) {
    artistName = 'Taylor Swift';
    monthlyListeners = '104.200.000';
    artistGenre = 'Pop • Country • Folk';
    spotifySearchUrl = 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02';
    tracks = [
      { id: 1, title: 'Cruel Summer', album: 'Lover', duration: '2:58', plays: '2.3B', notes: [587.33, 659.25, 880, 1174.66] },
      { id: 2, title: 'Anti-Hero', album: 'Midnights', duration: '3:20', plays: '1.6B', notes: [440, 554.37, 659.25, 880] },
      { id: 3, title: 'Blank Space', album: '1989 (Taylor’s Version)', duration: '3:51', plays: '1.9B', notes: [523.25, 659.25, 783.99, 1046.5] },
    ];
  } else if (titleLower.includes('tomorrowland')) {
    artistName = 'Tomorrowland Artists';
    monthlyListeners = '38.900.000';
    artistGenre = 'EDM • Progressive House • Techno';
    spotifySearchUrl = 'https://open.spotify.com/search/Tomorrowland';
    tracks = [
      { id: 1, title: 'Titanium (Festival Mix)', album: 'Mainstage Anthems', duration: '3:45', plays: '1.4B', notes: [440, 554.37, 659.25, 880] },
      { id: 2, title: 'Levels', album: 'Tomorrowland Classics', duration: '3:18', plays: '1.2B', notes: [523.25, 659.25, 783.99, 1046.5] },
      { id: 3, title: 'Tremor', album: 'EDM World Tour', duration: '4:02', plays: '780M', notes: [392, 493.88, 587.33, 783.99] },
    ];
  } else if (titleLower.includes('billie') || titleLower.includes('eilish')) {
    artistName = 'Billie Eilish';
    monthlyListeners = '98.500.000';
    artistGenre = 'Dark Pop • Alt Pop • Electropop';
    spotifySearchUrl = 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH';
    tracks = [
      { id: 1, title: 'BIRDS OF A FEATHER', album: 'HIT ME HARD AND SOFT', duration: '3:16', plays: '1.8B', notes: [523.25, 659.25, 783.99, 1046.5] },
      { id: 2, title: 'bad guy', album: 'WHEN WE ALL FALL ASLEEP', duration: '3:14', plays: '2.5B', notes: [392, 440, 587.33, 783.99] },
      { id: 3, title: 'LUNCH', album: 'HIT ME HARD AND SOFT', duration: '2:59', plays: '920M', notes: [440, 554.37, 659.25, 880] },
    ];
  } else {
    artistName = event.title.split('—')[0].split('-')[0].trim();
    tracks = [
      { id: 1, title: `${event.title} (Ao Vivo)`, album: 'Tour Setlist Oficial', duration: '3:45', plays: '850K', notes: [523.25, 659.25, 783.99, 1046.5] },
      { id: 2, title: 'Abertura da Turnê', album: 'Live Session', duration: '4:10', plays: '620K', notes: [440, 554.37, 659.25, 880] },
      { id: 3, title: 'Hit Principal (Encore)', album: 'Grand Finale', duration: '4:35', plays: '1.2M', notes: [392, 493.88, 587.33, 783.99] },
    ];
  }

  const activeTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  // Synthetic Audio Preview Generator using Web Audio API
  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.connect(audioCtx.destination);
      gainRef.current = gain;

      const notes = activeTrack.notes || [440, 554.37, 659.25, 880];
      let noteIndex = 0;

      const playChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtx.currentTime);
        noteIndex++;

        const noteGain = audioCtx.createGain();
        noteGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

        osc.connect(noteGain);
        noteGain.connect(gain);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      };

      playChord();
      const interval = setInterval(() => {
        playChord();
      }, 600);
      intervalRef.current = interval;
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const handleTogglePlay = (trackId?: number) => {
    if (trackId && trackId !== currentTrackId) {
      setCurrentTrackId(trackId);
      setProgress(0);
      if (!isPlaying) {
        setIsPlaying(true);
        startAudio();
      }
      return;
    }

    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startAudio();
    }
  };

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Next track
            const nextId = (currentTrackId % tracks.length) + 1;
            setCurrentTrackId(nextId);
            return 0;
          }
          return prev + 1.2;
        });
      }, 300);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrackId, tracks.length]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setToastText(isFollowing ? 'Deixou de seguir o artista' : 'Seguindo artista no Spotify!');
    setTimeout(() => setToastText(null), 2500);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-md border border-slate-800 transition-all relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1DB954]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Toast */}
      {toastText && (
        <div className="absolute top-3 right-3 z-30 bg-[#1DB954] text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-lg animate-in fade-in">
          {toastText}
        </div>
      )}

      {/* Header: Spotify Brand & Official Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          {/* Spotify Icon */}
          <div className="w-8 h-8 rounded-full bg-[#1DB954] text-slate-950 flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.307a.754.754 0 01-1.037.248c-2.839-1.735-6.413-2.128-10.622-1.166a.75.75 0 11-.336-1.462c4.607-1.053 8.563-.61 11.747 1.343.348.213.46.669.248 1.037zm1.467-3.261a.94.94 0 01-1.293.31c-3.249-1.996-8.204-2.574-12.049-1.407a.94.94 0 01-.555-1.796c4.394-1.334 9.855-.688 13.587 1.6a.94.94 0 01.31 1.293zm.126-3.395c-3.896-2.314-10.323-2.528-14.05-1.396a1.127 1.127 0 11-.652-2.158c4.285-1.3 11.385-1.052 15.86 1.606a1.127 1.127 0 11-1.158 1.948z"/>
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1DB954] block">
              Integração Oficial Spotify
            </span>
            <h4 className="text-sm font-black text-white">Setlist da Turnê</h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Ao Vivo</span>
        </span>
      </div>

      {/* Artist Profile Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
            {event.bannerUrl ? (
              <img src={event.bannerUrl} alt={artistName} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-6 h-6 text-[#1DB954]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white">{artistName}</h3>
              <CheckCircle className="w-3.5 h-3.5 text-[#1DB954] fill-[#1DB954]/20" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {monthlyListeners} ouvintes mensais
            </p>
          </div>
        </div>

        <button
          onClick={handleFollow}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
            isFollowing
              ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
              : 'bg-white text-slate-950 hover:bg-slate-100'
          }`}
        >
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      </div>

      {/* Interactive Mini Player Display */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTogglePlay()}
              className="w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-slate-950 flex items-center justify-center shadow-lg transition active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate max-w-[170px]">
                {activeTrack.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                {activeTrack.album}
              </p>
            </div>
          </div>

          {/* Equalizer Wave Animation */}
          {isPlaying ? (
            <div className="flex items-end gap-1 h-5 px-2">
              <div className="w-1 bg-[#1DB954] rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <div className="w-1 bg-[#1DB954] rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
              <div className="w-1 bg-[#1DB954] rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
              <div className="w-1 bg-[#1DB954] rounded-full animate-bounce h-2" style={{ animationDelay: '200ms' }} />
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              Preview 30s
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#1DB954] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>0:{Math.floor((progress * 0.3)).toString().padStart(2, '0')}</span>
            <span>0:30</span>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Mais Tocadas na Turnê
        </p>

        <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto pr-1">
          {tracks.map((track, index) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => handleTogglePlay(track.id)}
                className={`py-2 px-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                  isCurrent
                    ? 'bg-[#1DB954]/15 text-[#1DB954]'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-4 text-[10px] font-mono font-bold text-slate-500">
                    {isCurrent && isPlaying ? '▶' : index + 1}
                  </span>
                  <div className="truncate">
                    <p className={`font-semibold truncate text-[11px] ${isCurrent ? 'text-[#1DB954] font-bold' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">{track.plays} reproduções</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0 ml-2">
                  {track.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA: Open in Spotify */}
      <a
        href={spotifySearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
      >
        <span>Abrir Playlist Completa no Spotify</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
