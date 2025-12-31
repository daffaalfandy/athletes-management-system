import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useAthleteStore } from './useAthleteStore';
import { BeltBadge } from '../../components/BeltBadge';
import { ActivityStatus, Rank } from '../../../shared/types/domain';
import { Athlete } from '../../../shared/schemas';

export const AthleteList: React.FC = () => {
    const { athletes, deleteAthlete } = useAthleteStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [rankFilter, setRankFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('');

    // Helper to derive UI fields from backend data
    const enhanceAthlete = (athlete: Athlete) => ({
        ...athlete,
        // TODO: Implement real weight class logic in a shared utility
        weightClass: athlete.weight > 0 ? `-${athlete.weight}kg` : 'Open',
        // TODO: Fetch club name from ClubStore when implemented
        clubName: athlete.clubId ? `Club #${athlete.clubId}` : 'Unattached',
        // TODO: Real status logic based on attendance
        status: ActivityStatus.Constant,
        isVerified: true
    });

    // Derive unique clubs for filter dropdown
    const availableClubs = useMemo(() => {
        const clubs = new Set(athletes.map(a => a.clubId ? `Club #${a.clubId}` : 'Unattached'));
        return Array.from(clubs).sort();
    }, [athletes]);

    // Filtering Logic
    // Design Decision: Single Page / High Density List
    // We intentionally avoid pagination (page 1, 2, 3) to allow Senseis to quickly scan the entire roster (~50-200 athletes).
    // This aligns with the "High Density" requirement of Story 1.3.
    // Performance Note: If roster exceeds 500 items, consider implementing virtualization (e.g. react-window) or client-side pagination.
    const filteredAthletes = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return athletes.map(enhanceAthlete).filter(
            (athlete) => {
                const matchesName = athlete.name.toLowerCase().includes(term);
                const matchesRank = rankFilter ? athlete.rank === rankFilter : true;
                const matchesClub = clubFilter ? athlete.clubName === clubFilter : true;
                return matchesName && matchesRank && matchesClub;
            }
        );
    }, [athletes, searchTerm, rankFilter, clubFilter]);

    // Handler for Delete
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name} from the athlete pool?`)) {
            deleteAthlete(id);
        }
    };

    // Handler for Edit (Mock)
    const handleEdit = (id: number) => {
        console.log(`Open edit drawer for athlete ${id}`);
        // In a real app, this would open the drawer from Story 1.2
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Control Bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={rankFilter}
                        onChange={(e) => setRankFilter(e.target.value)}
                        className="block w-40 pl-3 pr-8 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                    >
                        <option value="">All Ranks</option>
                        {Object.values(Rank).map((rank) => (
                            <option key={rank} value={rank}>{rank}</option>
                        ))}
                    </select>

                    <select
                        value={clubFilter}
                        onChange={(e) => setClubFilter(e.target.value)}
                        className="block w-40 pl-3 pr-8 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                    >
                        <option value="">All Clubs</option>
                        {availableClubs.map((club) => (
                            <option key={club} value={club}>{club}</option>
                        ))}
                    </select>

                    <div className="flex items-center text-xs text-slate-500 font-medium ml-auto">
                        <Filter className="w-3 h-3 mr-1.5" />
                        Showing {filteredAthletes.length} of {athletes.length}
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm ring-1 ring-slate-900/5">
                        <tr>
                            <th scope="col" className="px-3 pl-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Athlete Identity
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Rank
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Club
                            </th>
                            <th scope="col" className="px-3 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Status
                            </th>
                            <th scope="col" className="relative px-3 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {filteredAthletes.map((athlete) => (
                            <tr
                                key={athlete.id}
                                className="group hover:bg-blue-50/40 transition-colors duration-150 ease-in-out cursor-pointer"
                            >
                                {/* Identity Column */}
                                <td className="px-3 pl-4 py-2.5 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {/* Initials Avatar */}
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {athlete.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                {athlete.name}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                                {athlete.weightClass} • {athlete.birthYear}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Rank Column */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                    <BeltBadge rank={athlete.rank} />
                                </td>

                                {/* Club Column */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                    <div className="text-xs text-slate-600 font-medium">
                                        {athlete.clubName}
                                    </div>
                                </td>

                                {/* Status Column */}
                                <td className="px-3 py-2.5 whitespace-nowrap text-center">
                                    <StatusPill status={athlete.status} isVerified={athlete.isVerified} />
                                </td>

                                {/* Actions Column (Visible on Hover) */}
                                <td className="px-3 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); athlete.id && handleEdit(athlete.id); }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Edit Athlete"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); athlete.id && handleDelete(athlete.id, athlete.name); }}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete Athlete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredAthletes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    <p className="text-sm">No athletes found matching "{searchTerm}"</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Helper Component for the Status Column
const StatusPill: React.FC<{ status: ActivityStatus; isVerified: boolean }> = ({ status, isVerified }) => {
    const statusColors = {
        [ActivityStatus.Constant]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        [ActivityStatus.Intermittent]: 'bg-amber-50 text-amber-700 border-amber-100',
        [ActivityStatus.Dormant]: 'bg-slate-50 text-slate-500 border-slate-100',
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[status]}`}>
                {status}
            </span>
            {!isVerified && (
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                    • Unverified •
                </span>
            )}
        </div>
    );
};
