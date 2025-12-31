import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, History as HistoryIcon, Save, Info, Edit2, X as CloseIcon, Check } from 'lucide-react';
import { AthleteSchema, Athlete } from '../../../shared/schemas';
import { Rank } from '../../../shared/types/domain';
import { Timeline } from './history/Timeline';
import { MedalList } from './history/MedalList';
import { useAthleteStore } from './useAthleteStore';
import { BeltBadge } from '../../components/BeltBadge';

interface AthleteFormProps {
    onSubmit: (data: Omit<Athlete, 'id'>) => Promise<void>;
    initialData?: Athlete;
}

type TabType = 'profile' | 'history';

export const AthleteForm: React.FC<AthleteFormProps> = ({ onSubmit, initialData }) => {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [editingField, setEditingField] = useState<string | null>(null);
    const { loadHistory } = useAthleteStore();

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(AthleteSchema),
        defaultValues: initialData || {
            name: '',
            birthDate: `${new Date().getFullYear() - 10}-01-01`,
            gender: 'male' as const,
            weight: 0,
            rank: Rank.White,
        },
    });

    useEffect(() => {
        if (initialData?.id && activeTab === 'history') {
            loadHistory(initialData.id);
        }
    }, [initialData?.id, activeTab, loadHistory]);

    // Reset form if initialData changes (e.g. switching between different athletes to edit)
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onFormSubmit = async (data: any) => {
        await onSubmit(data);
        setEditingField(null);
        if (!initialData) {
            reset();
        }
    };

    const onFieldSave = async (fieldName: string) => {
        const values = getValues();
        // Submit the full update
        await onSubmit(values);
        setEditingField(null);
    };

    const cancelEdit = () => {
        if (initialData) {
            reset(initialData);
        }
        setEditingField(null);
    };

    const renderField = (name: keyof Athlete, label: string, type: string = 'text', options?: any[]) => {
        const isEditing = editingField === name;
        const value = initialData ? (initialData as any)[name] : '';

        if (!initialData) {
            // "Create" mode: Just standard labels and inputs
            return (
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    {options ? (
                        <div className="relative">
                            <select
                                {...register(name as any)}
                                className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm appearance-none"
                            >
                                {options.map(opt => (
                                    <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    ) : (
                        <input
                            type={type}
                            step={type === 'number' ? '0.1' : undefined}
                            {...register(name as any, { valueAsNumber: type === 'number' })}
                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm placeholder-slate-400"
                        />
                    )}
                    {(errors as any)[name] && <p className="text-red-500 text-[10px] mt-1 font-medium">{(errors as any)[name].message}</p>}
                </div>
            );
        }

        // "Details/Edit" mode
        return (
            <div className={`p-4 rounded-xl border transition-all duration-200 ${isEditing ? 'border-blue-200 bg-blue-50/30 ring-4 ring-blue-50/50' : 'border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                    <div className="flex gap-1">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onFieldSave(name as string)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                    title="Save changes"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                                    title="Cancel"
                                >
                                    <CloseIcon size={14} />
                                </button>
                            </>
                        ) : (
                            name !== 'rank' && (
                                <button
                                    type="button"
                                    onClick={() => setEditingField(name as string)}
                                    className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title={`Edit ${label}`}
                                >
                                    <Edit2 size={14} />
                                </button>
                            )
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        {options ? (
                            <div className="relative">
                                <select
                                    {...register(name as any)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                                    className="block w-full px-3 py-1.5 rounded-md border border-blue-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm appearance-none shadow-sm"
                                >
                                    {options.map(opt => (
                                        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type={type}
                                step={type === 'number' ? '0.1' : undefined}
                                {...register(name as any, { valueAsNumber: type === 'number' })}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                                className="block w-full px-3 py-1.5 rounded-md border border-blue-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
                            />
                        )}
                        {(errors as any)[name] && <p className="text-red-500 text-[10px] mt-1 font-medium">{(errors as any)[name].message}</p>}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                            {name === 'rank' ? (
                                <BeltBadge rank={value} />
                            ) : name === 'gender' ? (
                                value.charAt(0).toUpperCase() + value.slice(1)
                            ) : (
                                value
                            )}
                        </span>
                    </div>
                )}

                {name === 'rank' && (
                    <div className="mt-2 text-[9px] text-slate-400 font-medium bg-white/50 p-1.5 rounded border border-slate-100 flex items-center gap-1.5">
                        <Info size={10} className="text-blue-400" />
                        Updated via History tab
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            {/* Tab Navigation */}
            {initialData?.id && (
                <div className="flex border-b border-slate-200 mb-6 bg-slate-50/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'profile'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <User size={16} />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'history'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <HistoryIcon size={16} />
                        History & Medals
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'profile' ? (
                    <div className="space-y-6 pb-2">
                        {/* Profile Picture Placeholder */}
                        <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                            <div className="relative group cursor-not-allowed">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden group-hover:border-blue-400 transition-colors shadow-inner">
                                    {initialData ? (
                                        <span className="text-2xl font-bold text-slate-500">{initialData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                                    ) : (
                                        <User size={40} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-200">Coming Soon</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Athlete Photo</p>
                                <p className="text-[10px] text-slate-400 italic">Portrait (headshot) for competition IDs</p>
                            </div>
                        </div>

                        <form id="athlete-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                            <div className={initialData ? "grid grid-cols-1 gap-4" : "space-y-6"}>
                                {renderField('name', 'Full Name')}

                                <div className="grid grid-cols-2 gap-4">
                                    {renderField('birthDate', 'Date of Birth', 'date')}
                                    {renderField('gender', 'Gender', 'text', [
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' }
                                    ])}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {renderField('weight', 'Weight (kg)', 'number')}
                                    {renderField('rank', 'Current Rank', 'text', Object.values(Rank).map(r => ({ value: r, label: r })))}
                                </div>
                            </div>

                            {!initialData && (
                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 py-2.5 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 text-sm font-bold transition-all active:scale-[0.98]"
                                    >
                                        <Save size={18} />
                                        Create Athlete
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="space-y-10 pb-6 animate-in fade-in duration-300">
                        {initialData?.id && (
                            <>
                                <Timeline athleteId={initialData.id} />
                                <div className="border-t border-slate-100 pt-8">
                                    <MedalList athleteId={initialData.id} />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
