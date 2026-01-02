import React, { useEffect, useState } from 'react';
import { useTournamentStore } from './useTournamentStore';
import { Tournament } from '../../../shared/schemas';

interface TournamentListProps {
    onEdit: (id: number) => void;
    onNew: () => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ onEdit, onNew }) => {
    const { tournaments, loading, loadTournaments, deleteTournament } = useTournamentStore();
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        loadTournaments();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteTournament(id);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete tournament:', error);
        }
    };

    if (loading && tournaments.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading tournaments...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header Bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Tournaments</h1>
                    <button
                        onClick={onNew}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                        Create Tournament
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {tournaments.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <p className="text-slate-400 mb-4 text-lg">No tournaments yet</p>
                            <button
                                onClick={onNew}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                Create Your First Tournament
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <table className="w-full">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Roster
                                    </th>
                                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tournaments.map((tournament) => (
                                    <TournamentRow
                                        key={tournament.id}
                                        tournament={tournament}
                                        onEdit={() => onEdit(tournament.id!)}
                                        onDelete={() => setDeleteConfirm(tournament.id!)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Delete Tournament?</h3>
                        <p className="text-slate-600 mb-6">
                            This will permanently delete this tournament and all its roster data. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TournamentRow: React.FC<{
    tournament: Tournament;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ tournament, onEdit, onDelete }) => {
    const [rosterCount, setRosterCount] = useState<number | null>(null);

    useEffect(() => {
        const loadRosterCount = async () => {
            try {
                const roster = await window.api.tournaments.getRoster(tournament.id!);
                setRosterCount(roster.length);
            } catch (error) {
                setRosterCount(0);
            }
        };
        loadRosterCount();
    }, [tournament.id]);

    return (
        <tr className="group hover:bg-blue-50/40 transition-colors duration-150 ease-in-out">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                {tournament.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                {new Date(tournament.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                {tournament.location || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                {rosterCount !== null ? (
                    <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700">
                        {rosterCount} athlete{rosterCount !== 1 ? 's' : ''}
                    </span>
                ) : (
                    'Loading...'
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={onEdit}
                        className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors font-medium"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
};

