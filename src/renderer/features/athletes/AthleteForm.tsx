import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AthleteSchema, Athlete } from '../../../shared/schemas';
import { Rank } from '../../../shared/types/domain';

interface AthleteFormProps {
    onSubmit: (data: Omit<Athlete, 'id'>) => Promise<void>;
}

export const AthleteForm: React.FC<AthleteFormProps> = ({ onSubmit }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(AthleteSchema),
        defaultValues: {
            name: '',
            birthYear: new Date().getFullYear() - 10,
            gender: 'male' as const,
            weight: 0,
            rank: Rank.White, // Use Enum Default
        },
    });

    const onFormSubmit = async (data: Omit<Athlete, 'id'>) => {
        await onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                    {...register('name')}
                    placeholder="e.g. Judoka"
                    className="block w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm sm:text-sm placeholder-slate-400"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Birth Year</label>
                    <input
                        type="number"
                        {...register('birthYear', { valueAsNumber: true })}
                        className="block w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm sm:text-sm"
                    />
                    {errors.birthYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.birthYear.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                    <div className="relative">
                        <select
                            {...register('gender')}
                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm sm:text-sm appearance-none"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('weight', { valueAsNumber: true })}
                        className="block w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm sm:text-sm"
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1 font-medium">{errors.weight.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Rank</label>
                    <div className="relative">
                        <select
                            {...register('rank')}
                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm sm:text-sm appearance-none"
                        >
                            {Object.values(Rank).map((rank) => (
                                <option key={rank} value={rank}>
                                    {rank}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    {errors.rank && <p className="text-red-500 text-xs mt-1 font-medium">{errors.rank.message}</p>}
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                    Create Athlete
                </button>
            </div>
        </form>
    );
};
