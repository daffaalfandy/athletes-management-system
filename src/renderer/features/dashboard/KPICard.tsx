import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-blue-500',
    trend,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-slate-50 ${iconColor}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-slate-900">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-slate-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};
