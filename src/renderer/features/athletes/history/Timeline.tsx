import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trophy, Calendar } from 'lucide-react';
import { useAthleteStore } from '../useAthleteStore';
import { Rank } from '../../../../shared/types/domain';
import { PromotionSchema, Promotion } from '../../../../shared/schemas';

interface TimelineProps {
    athleteId: number;
}

export const Timeline: React.FC<TimelineProps> = ({ athleteId }) => {
    const { activePromotions, addPromotion } = useAthleteStore();
    const [isAdding, setIsAdding] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(PromotionSchema.omit({ id: true })),
        defaultValues: {
            athleteId,
            rank: Rank.White, // Default, user should change
            date: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    const onAddPromotion = async (data: Omit<Promotion, 'id'>) => {
        await addPromotion({ ...data, athleteId }); // Ensure athleteId is set
        reset({ athleteId, rank: Rank.White, date: new Date().toISOString().split('T')[0], notes: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Rank History</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {isAdding ? 'Cancel' : 'Promote'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onAddPromotion)} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">New Rank</label>
                            <select
                                {...register('rank')}
                                className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {Object.values(Rank).map((rank) => (
                                    <option key={rank} value={rank}>{rank}</option>
                                ))}
                            </select>
                            {errors.rank && <p className="text-red-500 text-xs mt-1">{errors.rank.message}</p>}
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
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
                        <input
                            type="text"
                            {...register('notes')}
                            placeholder="e.g. Grading details..."
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save Promotion
                    </button>
                </form>
            )}

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                {activePromotions.map((promo, index) => (
                    <div key={promo.id || index} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                                <span className="text-sm font-bold text-slate-900">{promo.rank}</span>
                                {promo.notes && <p className="text-xs text-slate-500 mt-0.5">{promo.notes}</p>}
                            </div>
                            <div className="flex items-center text-xs text-slate-400 font-medium">
                                <Calendar className="w-3 h-3 mr-1" />
                                {promo.date}
                            </div>
                        </div>
                    </div>
                ))}

                {activePromotions.length === 0 && (
                    <div className="pl-6 pt-1 text-sm text-slate-400 italic">
                        No promotion history recorded.
                    </div>
                )}
            </div>
        </div>
    );
};
