import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, History as HistoryIcon, Save, Info, Edit2, X as CloseIcon, Check, Calendar } from 'lucide-react';
import { AthleteSchema, Athlete } from '../../../shared/schemas';
import { Rank } from '../../../shared/types/domain';
import { calculateAgeCategory } from '../../../shared/judo/calculateAgeCategory';
import { useRulesetStore } from '../settings/useRulesetStore';
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
    const { loadRulesets } = useRulesetStore();
    // Use Zustand selector for reactivity
    const activeRuleset = useRulesetStore(state => state.rulesets.find(r => r.is_active));
    const currentYear = new Date().getFullYear();
    const [referenceYear, setReferenceYear] = useState(currentYear);

    // Generate year options (current year + next 3 years)
    const yearOptions = useMemo(() => {
        return Array.from({ length: 4 }, (_, i) => currentYear + i);
    }, [currentYear]);

    // Load rulesets on mount
    useEffect(() => {
        loadRulesets();
    }, [loadRulesets]);


    const {
        register,
        handleSubmit,
        reset,
        getValues,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(AthleteSchema),
        defaultValues: initialData || {
            name: '',
            birthDate: `${new Date().getFullYear() - 10}-01-01`,
            gender: 'male' as const,
            weight: 0,
            rank: Rank.White,
            birth_place: '',
            region: '',
            address: '',
            phone: '',
            email: '',
            parent_guardian: '',
            parent_phone: '',
            profile_photo_path: '',
        },
    });

    // Watch birthDate for reactive minor detection
    const birthDate = watch('birthDate');
    const isMinor = useMemo(() => {
        if (!birthDate) return false;

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();

        // Adjust age if birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age < 18;
    }, [birthDate]);

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

    const handlePhotoUpload = async () => {
        try {
            const filePath = await window.api.files.selectImage();
            if (!filePath) return;

            // In create mode, we can't upload to vault with ID yet.
            // We might need to store the source path and upload AFTER creation?
            // OR we just allow upload for existing athletes only?
            // Tech spec says: "Handle file selection -> upload -> update athlete record flow"
            // For new athletes, it might be complex because we need ID.
            // Let's implement for EXISTING athletes first as per "AC4: Given an athlete has an uploaded profile photo... when viewing... clicking allows re-uploading"
            // For new athletes, maybe we just show a placeholder "Save athlete to upload photo".

            if (!initialData?.id) {
                alert("Please save the athlete first before uploading a photo.");
                return;
            }

            const vaultPath = await window.api.files.uploadToVault(filePath, 'profiles', initialData.id);

            // Update local state and DB
            // Sanitize optional fields to avoid "invalid_union" errors with empty strings
            const currentValues = getValues();
            const payload = {
                ...currentValues,
                profile_photo_path: vaultPath,
                parent_guardian: currentValues.parent_guardian || undefined,
                parent_phone: currentValues.parent_phone || undefined,
                clubId: currentValues.clubId || null,
                // Ensure other optional fields are handled if necessary, though strings usually fine
            };
            await onSubmit(payload);

            // Force reload or update UI? onSubmit usually refreshes.
        } catch (error: any) {
            console.error("Upload failed", error);
            const message = error.message || String(error);
            if (message.includes('File too large')) {
                alert("The selected file is too large. Please choose an image smaller than 1MB.");
            } else {
                alert("Failed to upload photo. Please check the logs for details.");
            }
        }
    };

    // Helper to get image src
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    useEffect(() => {
        const loadPhoto = async () => {
            const path = watch('profile_photo_path');
            if (path) {
                // Use custom protocol for secure loading
                setPhotoSrc(`dossier://${path}`);
            } else {
                setPhotoSrc(null);
            }
        };
        loadPhoto();
    }, [watch('profile_photo_path')]);

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
        <div className="flex flex-col h-[75vh]">
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
                        <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                            <div className={`relative group ${initialData?.id ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={(e) => {
                                if (initialData?.id) { e.stopPropagation(); handlePhotoUpload(); }
                            }}>
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden group-hover:border-blue-400 transition-colors shadow-inner">
                                    {photoSrc ? (
                                        <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                                    ) : initialData ? (
                                        <span className="text-2xl font-bold text-slate-500">{initialData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                                    ) : (
                                        <User size={40} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    if (initialData?.id) handlePhotoUpload();
                                }}>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-200">
                                        {initialData?.id ? 'Upload Photo' : 'Save First'}
                                    </span>
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

                                {initialData && (
                                    <div className="p-4 rounded-xl border border-slate-100 bg-blue-50/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age Category</label>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 text-slate-400" />
                                                <select
                                                    value={referenceYear}
                                                    onChange={(e) => setReferenceYear(Number(e.target.value))}
                                                    className="text-[10px] px-2 py-0.5 border border-slate-200 rounded bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                                >
                                                    {yearOptions.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year === currentYear ? `${year} (Current)` : year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-md bg-white border border-blue-100 text-blue-700 text-sm font-bold shadow-sm">
                                                {calculateAgeCategory(
                                                    getValues('birthDate'),
                                                    getValues('gender'),
                                                    activeRuleset?.categories || [],
                                                    referenceYear
                                                )}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-medium">Based on active ruleset</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {renderField('weight', 'Weight (kg)', 'number')}
                                    {renderField('rank', 'Current Rank', 'text', Object.values(Rank).map(r => ({ value: r, label: r })))}
                                </div>

                                {/* Detailed Information Section */}
                                <div className="space-y-4 pt-6 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider pb-2">
                                        Detailed Information
                                        {!initialData && (
                                            <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case tracking-normal">
                                                (Recommended for tournament registration)
                                            </span>
                                        )}
                                    </h4>

                                    <div className={initialData ? "grid grid-cols-1 gap-4" : "space-y-4"}>
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderField('birth_place', 'Birth Place', 'text')}
                                            {renderField('region', 'Region/Province', 'text')}
                                        </div>

                                        {renderField('address', 'Address', 'text')}

                                        <div className="grid grid-cols-2 gap-4">
                                            {renderField('phone', 'Phone Number', 'tel')}
                                            {renderField('email', 'Email', 'email')}
                                        </div>

                                        {/* Parent/Guardian Info - Show for athletes under 18 */}
                                        {isMinor && (
                                            <>
                                                <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-4 pt-4 border-t border-slate-100">
                                                    Parent/Guardian Information
                                                </h5>
                                                <div className={initialData ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
                                                    {renderField('parent_guardian', 'Parent/Guardian Name', 'text')}
                                                    {renderField('parent_phone', 'Parent/Guardian Phone', 'tel')}
                                                </div>
                                            </>
                                        )}
                                    </div>
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
