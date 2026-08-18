import React from 'react';
import { Armchair, Check } from 'lucide-react';

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
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  maxSelection = 6,
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
    <div className="bg-surface-100 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 select-none">
      {/* Screen / Stage Curve */}
      <div className="text-center space-y-3">
        <div className="relative max-w-lg mx-auto h-8 flex items-center justify-center">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full shadow-glow" />
          <div className="absolute inset-x-8 top-1 h-8 bg-gradient-to-b from-brand-500/15 to-transparent blur-md pointer-events-none" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-300">
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
                <span className="w-5 text-xs font-extrabold text-slate-500 text-center">
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
                        className={`group relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center ${
                          isOccupied
                            ? 'bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed'
                            : isSelected
                            ? 'bg-brand-500 text-white shadow-glow border border-brand-400 scale-105 animate-pulse-slow'
                            : 'bg-surface-50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-brand-500/50 hover:scale-105'
                        }`}
                        title={
                          isOccupied
                            ? `Assento ${seat.label} (Ocupado)`
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
                          <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[10px] text-white whitespace-nowrap shadow-xl">
                            {seat.label} • {isOccupied ? 'Ocupado' : 'Disponível'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Row Identifier Right */}
                <span className="w-5 text-xs font-extrabold text-slate-500 text-center">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-surface-50 border border-slate-700" />
          <span>Livre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-brand-500 border border-brand-400 shadow-glow" />
          <span className="text-white font-medium">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-800" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
};
