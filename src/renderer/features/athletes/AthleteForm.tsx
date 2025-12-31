import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AthleteSchema, Athlete } from '../../../shared/schemas';

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
            rank: 'White Belt',
        },
    });

    const onFormSubmit = async (data: Omit<Athlete, 'id'>) => {
        await onSubmit(data); // onSubmit is expected to return a promise now
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:ring-0 text-white"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Birth Year</label>
                    <input
                        type="number"
                        {...register('birthYear', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:ring-0 text-white"
                    />
                    {errors.birthYear && <p className="text-red-500 text-xs mt-1">{errors.birthYear.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Gender</label>
                    <select
                        {...register('gender')}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:ring-0 text-white"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('weight', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:ring-0 text-white"
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Rank</label>
                    <input
                        {...register('rank')}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:ring-0 text-white"
                    />
                    {errors.rank && <p className="text-red-500 text-xs mt-1">{errors.rank.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Add Athlete
            </button>
        </form>
    );
};
