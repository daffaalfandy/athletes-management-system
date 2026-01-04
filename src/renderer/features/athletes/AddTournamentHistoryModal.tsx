import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TournamentHistorySchema, TournamentHistory } from '../../../shared/schemas';
import { useTournamentHistoryStore } from './useTournamentHistoryStore';

interface AddTournamentHistoryModalProps {
    athleteId: number;
    initialData?: TournamentHistory;
    onClose: () => void;
}

export const AddTournamentHistoryModal: React.FC<AddTournamentHistoryModalProps> = ({
    athleteId,
    initialData,
    onClose,
}) => {
    const { addManualHistory, updateHistory, isLoading } = useTournamentHistoryStore();
    const isEditing = !!initialData;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(
            TournamentHistorySchema.omit({
                id: true,
                athlete_id: true,
                tournament_id: true,
                is_auto_generated: true,
                created_at: true,
            })
        ),
        defaultValues: initialData
            ? {
                tournament_name: initialData.tournament_name,
                tournament_date: initialData.tournament_date,
                tournament_location: initialData.tournament_location || '',
                weight_class: initialData.weight_class || '',
                age_category: initialData.age_category || '',
            }
            : {
                tournament_name: '',
                tournament_date: new Date().toISOString().split('T')[0],
                tournament_location: '',
                weight_class: '',
                age_category: '',
            },
    });

    const onSubmit = async (data: any) => {
        try {
            if (isEditing && initialData?.id) {
                await updateHistory(initialData.id, data);
            } else {
                await addManualHistory({
                    athlete_id: athleteId,
                    ...data,
                });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save tournament history:', error);
            alert('Failed to save tournament history. Please try again.');
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {isEditing ? 'Edit Tournament History' : 'Add Manual Tournament Entry'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Tournament Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Tournament Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('tournament_name')}
                            placeholder="e.g. National Championship 2024"
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {errors.tournament_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.tournament_name.message}</p>
                        )}
                    </div>

                    {/* Tournament Date */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register('tournament_date')}
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {errors.tournament_date && (
                            <p className="text-red-500 text-xs mt-1">{errors.tournament_date.message}</p>
                        )}
                    </div>

                    {/* Tournament Location */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Location <span className="text-slate-400 text-[10px]">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            {...register('tournament_location')}
                            placeholder="e.g. Jakarta, Indonesia"
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {errors.tournament_location && (
                            <p className="text-red-500 text-xs mt-1">{errors.tournament_location.message}</p>
                        )}
                    </div>

                    {/* Weight Class */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Weight Class <span className="text-slate-400 text-[10px]">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            {...register('weight_class')}
                            placeholder="e.g. -66kg"
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {errors.weight_class && (
                            <p className="text-red-500 text-xs mt-1">{errors.weight_class.message}</p>
                        )}
                    </div>

                    {/* Age Category */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Age Category <span className="text-slate-400 text-[10px]">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            {...register('age_category')}
                            placeholder="e.g. U-18"
                            className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {errors.age_category && (
                            <p className="text-red-500 text-xs mt-1">{errors.age_category.message}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : isEditing ? 'Update Entry' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
