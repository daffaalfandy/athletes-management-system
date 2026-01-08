import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAthleteStore } from '../useAthleteStore';
import { Rank } from '../../../../shared/types/domain';
import { PromotionSchema, Promotion } from '../../../../shared/schemas';

import { ProofPreview } from '../../../components/ProofPreview';

interface TimelineProps {
    athleteId: number;
}

export const Timeline: React.FC<TimelineProps> = ({ athleteId }) => {
    const { activePromotions, addPromotion, deletePromotion, historyLoading, error } = useAthleteStore();
    const [isAdding, setIsAdding] = useState(false);
    const [viewingProof, setViewingProof] = useState<{ title: string, date: string, imagePath?: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const sortedPromotions = React.useMemo(() => {
        return [...activePromotions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activePromotions]);

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

    if (historyLoading && activePromotions.length === 0) {
        return (
            <div className="space-y-4 animate-pulse p-4">
                <div className="h-8 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-slate-100 rounded w-full"></div>
                <div className="h-16 bg-slate-100 rounded w-full"></div>
            </div>
        );
    }

    if (error && activePromotions.length === 0) {
        return (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
            </div>
        );
    }

    const onAddPromotion = async (data: Omit<Promotion, 'id'>) => {
        try {
            await addPromotion({ ...data, athleteId, tempFilePath: selectedFile || undefined });
            reset({ athleteId, rank: Rank.White, date: new Date().toISOString().split('T')[0], notes: '' });
            setSelectedFile(null);
            setIsAdding(false);
        } catch (error: any) {
            console.error("Failed to add promotion", error);
            const message = error.message || String(error);
            if (message.includes('File too large')) {
                alert("The selected file is too large. Please choose an image smaller than 1MB.");
            } else {
                alert("Failed to save promotion. Please check details and try again.");
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
        if (window.confirm('Are you sure you want to delete this promotion record? This action cannot be undone.')) {
            await deletePromotion(id);
        }
    };

    return (
        <div className="space-y-6">
            <ProofPreview
                isOpen={!!viewingProof}
                onClose={() => setViewingProof(null)}
                title={viewingProof?.title || ''}
                date={viewingProof?.date || ''}
                type="rank"
                imagePath={viewingProof?.imagePath}
            />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Belt Promotion History</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                    {isAdding ? 'Cancel Promotion' : 'Promote'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onAddPromotion)} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">New Belt</label>
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
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Proof of Promotion (Optional)</label>
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
                {sortedPromotions.map((promo, index) => (
                    <div key={promo.id || index} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                                <span className="text-sm font-bold text-slate-900">{promo.rank}</span>
                                {promo.notes && <p className="text-xs text-slate-500 mt-0.5">{promo.notes}</p>}
                                <div className="mt-1.5 flex">
                                    <button
                                        onClick={() => setViewingProof({ title: promo.rank, date: promo.date, imagePath: promo.proof_image_path })}
                                        className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all group mr-2"
                                        title="View Proof"
                                    >
                                        <div className="bg-slate-100 p-0.5 rounded group-hover:bg-blue-50 transition-colors">
                                            <ImageIcon size={10} />
                                        </div>
                                        <span className="font-medium">View Proof</span>
                                    </button>

                                    <button
                                        onClick={() => promo.id && handleDelete(promo.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center text-xs text-slate-400 font-medium">
                                <Calendar className="w-3 h-3 mr-1" />
                                {promo.date}
                            </div>
                        </div>
                    </div>
                ))}

                {sortedPromotions.length === 0 && (
                    <div className="pl-6 pt-1 text-sm text-slate-400 italic">
                        No promotion history recorded.
                    </div>
                )}
            </div>
        </div>
    );
};
