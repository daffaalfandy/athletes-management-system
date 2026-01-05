import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Award, Calendar, Image as ImageIcon, Trash2, Link2 } from 'lucide-react';
import { useAthleteStore } from '../useAthleteStore';
import { useTournamentHistoryStore } from '../useTournamentHistoryStore';
import { MedalSchema, Medal } from '../../../../shared/schemas';

import { ProofPreview } from '../../../components/ProofPreview';

interface MedalListProps {
    athleteId: number;
}

export const MedalList: React.FC<MedalListProps> = ({ athleteId }) => {
    const { activeMedals, addMedal, deleteMedal, historyLoading, error } = useAthleteStore();
    const { history, loadHistory } = useTournamentHistoryStore();
    const [isAdding, setIsAdding] = useState(false);
    const [viewingProof, setViewingProof] = useState<{ title: string, date: string, imagePath?: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

    const sortedMedals = React.useMemo(() => {
        return [...activeMedals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activeMedals]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(MedalSchema.omit({ id: true, tournament_id: true })),
        defaultValues: {
            athleteId,
            tournament: '',
            date: new Date().toISOString().split('T')[0],
            medal: 'Gold' as const,
            category: '',
        },
    });

    // Load tournament history when component mounts
    useEffect(() => {
        loadHistory(athleteId);
    }, [athleteId, loadHistory]);

    if (historyLoading && activeMedals.length === 0) {
        return (
            <div className="space-y-4 animate-pulse p-4">
                <div className="h-8 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-slate-100 rounded w-full"></div>
                <div className="h-20 bg-slate-100 rounded w-full"></div>
            </div>
        );
    }

    if (error && activeMedals.length === 0) {
        return (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
            </div>
        );
    }

    const handleTournamentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tournamentId = e.target.value ? parseInt(e.target.value) : null;
        setSelectedTournamentId(tournamentId);

        if (tournamentId) {
            const tournament = history.find(th => th.id === tournamentId);
            if (tournament) {
                setValue('tournament', tournament.tournament_name);
                setValue('date', tournament.tournament_date);
            }
        } else {
            // Manual entry - clear fields
            setValue('tournament', '');
            setValue('date', new Date().toISOString().split('T')[0]);
        }
    };

    const onAddMedal = async (data: Omit<Medal, 'id'>) => {
        try {
            await addMedal({
                ...data,
                athleteId,
                tournament_id: selectedTournamentId,
                tempFilePath: selectedFile || undefined
            });
            reset({ athleteId, tournament: '', date: new Date().toISOString().split('T')[0], medal: 'Gold', category: '' });
            setSelectedFile(null);
            setSelectedTournamentId(null);
            setIsAdding(false);
        } catch (error: any) {
            console.error("Failed to add medal", error);
            const message = error.message || String(error);
            if (message.includes('File too large')) {
                alert("The selected file is too large. Please choose an image smaller than 1MB.");
            } else {
                alert("Failed to save medal. Please check details and try again.");
            }
        }
    };

    const handleFileSelect = async () => {
        const path = await window.api.files.selectImage();
        if (path) {
            setSelectedFile(path);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this medal record? This action cannot be undone.')) {
            await deleteMedal(id);
        }
    };

    const getMedalColor = (type: string) => {
        switch (type) {
            case 'Gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Silver': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <ProofPreview
                isOpen={!!viewingProof}
                onClose={() => setViewingProof(null)}
                title={viewingProof?.title || ''}
                date={viewingProof?.date || ''}
                type="medal"
                imagePath={viewingProof?.imagePath}
            />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Competition Record</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                    {isAdding ? 'Cancel Entry' : 'Add Medal'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onAddMedal)} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Link to Tournament (Optional)
                        </label>
                        <select
                            value={selectedTournamentId || ''}
                            onChange={handleTournamentSelect}
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="">Manual Entry (Type tournament name below)</option>
                            {history.map(th => (
                                <option key={th.id} value={th.id}>
                                    {th.tournament_name} - {th.tournament_date}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Select a tournament from history or enter manually</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Tournament Name</label>
                            <input
                                type="text"
                                {...register('tournament')}
                                placeholder="e.g. National Championship"
                                className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {errors.tournament && <p className="text-red-500 text-xs mt-1">{errors.tournament.message}</p>}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Proof of Medal (Optional)</label>
                        <div
                            onClick={handleFileSelect}
                            className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${selectedFile ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-300 text-slate-400 hover:bg-slate-50 hover:border-blue-300'
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                {selectedFile ? <ImageIcon size={16} /> : <span className="text-xs font-bold text-slate-500">IMG</span>}
                            </div>
                            <span className="text-xs truncate max-w-[200px]">{selectedFile ? selectedFile.split(/[/\\]/).pop() : 'Click to select proof image...'}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Medal</label>
                            <select
                                {...register('medal')}
                                className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Bronze">Bronze</option>
                            </select>
                            {errors.medal && <p className="text-red-500 text-xs mt-1">{errors.medal.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                            <input
                                type="date"
                                {...register('date')}
                                className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Category (Opt)</label>
                            <input
                                type="text"
                                {...register('category')}
                                placeholder="-66kg"
                                className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save Record
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {sortedMedals.map((medal, index) => (
                    <div key={medal.id || index} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getMedalColor(medal.medal)}`}>
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900 truncate">{medal.tournament}</p>
                                {medal.tournament_id && (
                                    <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex-shrink-0">
                                        <Link2 size={10} />
                                        <span>Linked</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                <span className="font-medium mr-2">{medal.medal}</span>
                                {medal.category && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span>{medal.category}</span>
                                    </>
                                )}
                            </div>
                            <div className="mt-1.5 flex">
                                <button
                                    onClick={() => setViewingProof({ title: medal.tournament, date: medal.date, imagePath: medal.proof_image_path })}
                                    className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all group mr-2"
                                    title="View Proof"
                                >
                                    <div className="bg-slate-100 p-0.5 rounded group-hover:bg-blue-50 transition-colors">
                                        <ImageIcon size={10} />
                                    </div>
                                    <span className="font-medium">View Proof</span>
                                </button>

                                <button
                                    onClick={() => medal.id && handleDelete(medal.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Record"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center text-xs text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {medal.date}
                            </div>
                        </div>
                    </div>
                ))}

                {sortedMedals.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No competition records yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
