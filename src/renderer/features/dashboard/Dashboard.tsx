import React, { useState, useEffect } from 'react';
import { Users, Activity, UserCheck, UserX, Plus, Trophy } from 'lucide-react';
import { KPICard } from './KPICard';
import { MedallionSummary } from './MedallionSummary';
import { useSettingsStore } from '../settings/useSettingsStore';

interface DashboardProps {
    onNavigate: (view: 'athletes' | 'tournaments') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { kabupatanName, kabupatanLogoPath } = useSettingsStore();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [statistics, setStatistics] = useState({
        totalPool: 0,
        competitivePool: 0,
        maleCount: 0,
        femaleCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (kabupatanLogoPath) {
            setLogoUrl(`dossier://${kabupatanLogoPath}`);
        } else {
            setLogoUrl(null);
        }
    }, [kabupatanLogoPath]);

    useEffect(() => {
        const loadStatistics = async () => {
            setIsLoading(true);
            const result = await window.api.athlete.getStatistics();
            if (result.success && result.data) {
                setStatistics(result.data);
            }
            setIsLoading(false);
        };
        loadStatistics();
    }, []);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50">
            {/* Header with Regency Branding */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-6">
                    {logoUrl && (
                        <div className="w-20 h-20 rounded-lg bg-slate-900 border border-white/20 flex items-center justify-center overflow-hidden p-2">
                            <img src={logoUrl} alt="Regency Logo" className="w-full h-full object-contain" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Command Center</h1>
                        <p className="text-slate-300 text-sm font-medium">
                            {kabupatanName} • Athlete Management System
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                            <div className="h-12 bg-slate-100 rounded mb-4"></div>
                            <div className="h-8 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Pool"
                        value={statistics.totalPool}
                        subtitle="All registered athletes"
                        icon={Users}
                        iconColor="text-blue-600"
                    />
                    <KPICard
                        title="Competitive Pool"
                        value={statistics.competitivePool}
                        subtitle="Constant + Intermittent"
                        icon={Activity}
                        iconColor="text-emerald-600"
                    />
                    <KPICard
                        title="Male Athletes"
                        value={statistics.maleCount}
                        subtitle={`${Math.round((statistics.maleCount / statistics.totalPool) * 100) || 0}% of total`}
                        icon={UserCheck}
                        iconColor="text-indigo-600"
                    />
                    <KPICard
                        title="Female Athletes"
                        value={statistics.femaleCount}
                        subtitle={`${Math.round((statistics.femaleCount / statistics.totalPool) * 100) || 0}% of total`}
                        icon={UserX}
                        iconColor="text-pink-600"
                    />
                </div>
            )}

            {/* Medallion Summary */}
            <MedallionSummary />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => onNavigate('athletes')}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Plus size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700">Add Athlete</p>
                            <p className="text-xs text-slate-500">Register a new athlete to the pool</p>
                        </div>
                    </button>
                    <button
                        onClick={() => onNavigate('tournaments')}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Trophy size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Manage Tournaments</p>
                            <p className="text-xs text-slate-500">Create or edit tournament rosters</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
