import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Award, Calendar, Trash2 } from 'lucide-react';
import { useAthleteStore } from '../useAthleteStore';
import { MedalSchema, Medal } from '../../../../shared/schemas';

interface MedalListProps {
    athleteId: number;
}

export const MedalList: React.FC<MedalListProps> = ({ athleteId }) => {
    const { activeMedals, addMedal } = useAthleteStore();
    const [isAdding, setIsAdding] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(MedalSchema.omit({ id: true })),
        defaultValues: {
            athleteId,
            tournament: '',
            date: new Date().toISOString().split('T')[0],
            medal: 'Gold' as const,
            category: '',
        },
    });

    const onAddMedal = async (data: Omit<Medal, 'id'>) => {
        await addMedal({ ...data, athleteId });
        reset({ athleteId, tournament: '', date: new Date().toISOString().split('T')[0], medal: 'Gold', category: '' });
        setIsAdding(false);
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
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Competition Record</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {isAdding ? 'Cancel' : 'Add Medal'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onAddMedal)} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
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
                {activeMedals.map((medal, index) => (
                    <div key={medal.id || index} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getMedalColor(medal.medal)}`}>
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{medal.tournament}</p>
                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                <span className="font-medium mr-2">{medal.medal}</span>
                                {medal.category && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span>{medal.category}</span>
                                    </>
                                )}
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

                {activeMedals.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No competition records yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
