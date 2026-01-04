import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export const MedallionSummary: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [medalCounts, setMedalCounts] = useState({ gold: 0, silver: 0, bronze: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadYears = async () => {
            const result = await window.api.history.getAvailableMedalYears();
            if (result.success && result.data) {
                setAvailableYears(result.data);
            }
        };
        loadYears();
    }, []);

    useEffect(() => {
        const loadMedalCounts = async () => {
            setIsLoading(true);
            const year = selectedYear === 'all' ? undefined : selectedYear;
            const result = await window.api.history.getMedalCountsByYear(year);
            if (result.success && result.data) {
                setMedalCounts(result.data);
            }
            setIsLoading(false);
        };
        loadMedalCounts();
    }, [selectedYear]);

    const totalMedals = medalCounts.gold + medalCounts.silver + medalCounts.bronze;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="text-amber-500" size={20} />
                    Medallion Summary
                </h3>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Time</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-slate-400">Loading...</div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-2xl font-bold text-slate-900">{totalMedals}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total</p>
                    </div>

                    {/* Gold */}
                    <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-100">
                        <Medal className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-bold text-amber-700">{medalCounts.gold}</p>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Gold</p>
                    </div>

                    {/* Silver */}
                    <div className="text-center p-4 rounded-lg bg-slate-100 border border-slate-200">
                        <Medal className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-2xl font-bold text-slate-700">{medalCounts.silver}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Silver</p>
                    </div>

                    {/* Bronze */}
                    <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
                        <Award className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold text-orange-700">{medalCounts.bronze}</p>
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mt-1">Bronze</p>
                    </div>
                </div>
            )}
        </div>
    );
};
