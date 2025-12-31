import React from 'react';
import { Rank } from '../../shared/types/domain';

interface BeltBadgeProps {
  rank: Rank | string;
}

const rankConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  [Rank.White]: { bg: 'bg-white', text: 'text-slate-700', border: 'border-slate-200', label: 'White' },
  [Rank.Yellow]: { bg: 'bg-yellow-300', text: 'text-yellow-900', border: 'border-yellow-400', label: 'Yellow' },
  [Rank.Orange]: { bg: 'bg-orange-400', text: 'text-white', border: 'border-orange-500', label: 'Orange' },
  [Rank.Green]: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700', label: 'Green' },
  [Rank.Blue]: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', label: 'Blue' },
  [Rank.Brown]: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-900', label: 'Brown' },
  [Rank.Dan1]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 1)' },
  [Rank.Dan2]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 2)' },
  [Rank.Dan3]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 3)' },
  [Rank.Dan4]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 4)' },
  [Rank.Dan5]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 5)' },
  [Rank.Dan6]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 6)' },
  [Rank.Dan7]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (DAN 7)' },
};

export const BeltBadge: React.FC<BeltBadgeProps> = ({ rank }) => {
  // Fallback for unknown ranks
  const config = rankConfig[rank] || { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', label: rank };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${config.bg} ${config.text} ${config.border}`}
    >
      {/* Small dot to mimic the physical belt knot or texture */}
      <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-40`} />
      {config.label}
    </span>
  );
};