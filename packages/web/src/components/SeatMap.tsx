import React from 'react';
import { Check, Radio } from 'lucide-react';

export interface SeatItem {
  id: string;
  row: string;
  number: number;
  label: string;
  isAvailable: boolean;
}

interface SeatMapProps {
  seats: SeatItem[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatItem) => void;
  maxSelection?: number;
  isLiveConnected?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  isLiveConnected = true,
}) => {
  // Group seats by row
  const rowsMap = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, SeatItem[]>);

  const sortedRows = Object.keys(rowsMap).sort();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 select-none shadow-xs">
      {/* Live Sync Status Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {isLiveConnected
              ? 'Disponibilidade de poltronas em tempo real (WebSocket)'
              : 'Conectando ao serviço em tempo real...'}
          </span>
        </div>

        <span className="text-[10px] font-bold text-[#2b55f5] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          Live Sync Ativo
        </span>
      </div>

      {/* Screen / Stage Curve */}
      <div className="text-center space-y-3 pt-1">
        <div className="relative max-w-lg mx-auto h-8 flex items-center justify-center">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#2b55f5] to-transparent rounded-full" />
          <div className="absolute inset-x-8 top-1 h-8 bg-gradient-to-b from-blue-500/10 to-transparent blur-md pointer-events-none" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2b55f5]">
            Tela / Palco Principal
          </span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-4 flex justify-center">
        <div className="space-y-2 min-w-fit px-4">
          {sortedRows.map((rowLetter) => {
            const rowSeats = rowsMap[rowLetter].sort((a, b) => a.number - b.number);

            return (
              <div key={rowLetter} className="flex items-center gap-3">
                {/* Row Identifier Left */}
                <span className="w-5 text-xs font-black text-slate-400 text-center">
                  {rowLetter}
                </span>

                {/* Seats in this row */}
                <div className="flex gap-1.5 sm:gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isOccupied = !seat.isAvailable;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seat)}
                        className={`group relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isOccupied
                            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#2b55f5] text-white shadow-xs border border-[#2b55f5] scale-105'
                            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-blue-400 hover:scale-105 shadow-xs'
                        }`}
                        title={
                          isOccupied
                            ? `Assento ${seat.label} (Ocupado / Indisponível)`
                            : isSelected
                            ? `Assento ${seat.label} (Selecionado)`
                            : `Assento ${seat.label} (Disponível)`
                        }
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        ) : (
                          seat.number
                        )}

                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-1.5 hidden group-hover:block z-20 pointer-events-none">
                          <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-white whitespace-nowrap shadow-xl font-semibold">
                            {seat.label} • {isOccupied ? 'Ocupado' : 'Disponível'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Row Identifier Right */}
                <span className="w-5 text-xs font-black text-slate-400 text-center">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-white border border-slate-300 shadow-xs" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-[#2b55f5] border border-[#2b55f5] shadow-xs" />
          <span className="text-slate-900 font-bold">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200 opacity-60" />
          <span className="text-slate-400">Ocupado / Indisponível</span>
        </div>
      </div>
    </div>
  );
};
