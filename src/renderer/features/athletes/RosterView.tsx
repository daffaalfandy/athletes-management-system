import React, { useMemo } from 'react';
import { X, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useRosterStore } from './useRosterStore';
import { useAthleteStore } from './useAthleteStore';
import { useRulesetStore } from '../settings/useRulesetStore';
import { BeltBadge } from '../../components/BeltBadge';
import { calculateAgeCategory } from '../../../shared/judo/calculateAgeCategory';

/**
 * Story 5.2: Roster View Panel
 * 
 * Slide-out drawer displaying selected athletes for tournament roster.
 * Shows roster summary statistics and allows removing athletes from the roster.
 */

interface RosterViewProps {
    isOpen: boolean;
    onClose: () => void;
    referenceYear: number;
}

// Story 5.1: Weight Class Divisions (Placeholder - same as AthleteList)
const WEIGHT_DIVISIONS = {
    male: ['-60kg', '-66kg', '-73kg', '-81kg', '-90kg', '-100kg', '+100kg'],
    female: ['-48kg', '-52kg', '-57kg', '-63kg', '-70kg', '-78kg', '+78kg'],
};

export const RosterView: React.FC<RosterViewProps> = ({ isOpen, onClose, referenceYear }) => {
    const { selectedAthleteIds, removeAthlete, clearRoster, getConflicts } = useRosterStore();
    const { athletes } = useAthleteStore();
    const activeRuleset = useRulesetStore(state => state.rulesets.find(r => r.is_active));

    // Get full athlete data for selected IDs
    const selectedAthletes = useMemo(() => {
        return athletes
            .filter(athlete => athlete.id && selectedAthleteIds.includes(athlete.id))
            .map(athlete => {
                // Calculate weight class
                let weightClass = 'Unclassified';
                if (athlete.weight > 0) {
                    const divisions = WEIGHT_DIVISIONS[athlete.gender];
                    for (const division of divisions) {
                        if (division.startsWith('+')) {
                            const threshold = parseInt(division.substring(1).replace('kg', ''));
                            if (athlete.weight > threshold) {
                                weightClass = division;
                                break;
                            }
                        } else {
                            const limit = parseInt(division.substring(1).replace('kg', ''));
                            if (athlete.weight <= limit) {
                                weightClass = division;
                                break;
                            }
                        }
                    }
                }

                return {
                    ...athlete,
                    weightClass,
                    ageCategory: calculateAgeCategory(
                        athlete.birthDate,
                        athlete.gender,
                        activeRuleset?.categories || [],
                        referenceYear
                    ),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    }, [athletes, selectedAthleteIds, activeRuleset, referenceYear]);

    // Calculate summary statistics
    const summary = useMemo(() => {
        const total = selectedAthletes.length;
        const maleCount = selectedAthletes.filter(a => a.gender === 'male').length;
        const femaleCount = selectedAthletes.filter(a => a.gender === 'female').length;

        // Age category distribution
        const ageCategoryMap = new Map<string, number>();
        selectedAthletes.forEach(athlete => {
            const count = ageCategoryMap.get(athlete.ageCategory) || 0;
            ageCategoryMap.set(athlete.ageCategory, count + 1);
        });

        // Story 5.3: Count athletes with conflicts
        const conflictedAthletes = selectedAthletes.filter(a => a.id && getConflicts(a.id).length > 0);
        const conflictCount = conflictedAthletes.length;
        const errorCount = conflictedAthletes.filter(a =>
            a.id && getConflicts(a.id).some(c => c.severity === 'error')
        ).length;

        return {
            total,
            maleCount,
            femaleCount,
            ageCategoryDistribution: Array.from(ageCategoryMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([category, count]) => ({ category, count })),
            conflictCount,
            errorCount,
        };
    }, [selectedAthletes, getConflicts]);

    const handleClearRoster = () => {
        if (window.confirm('Are you sure you want to clear the entire roster?')) {
            clearRoster();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between">
                    <h2 className="text-xl font-bold">Tournament Roster</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary Statistics */}
                {selectedAthletes.length > 0 && (
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Total Count */}
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</div>
                                <div className="text-2xl font-bold text-blue-600 mt-1">{summary.total}</div>
                            </div>

                            {/* Gender Breakdown */}
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Gender</div>
                                <div className="text-sm font-semibold text-slate-700 mt-1">
                                    {summary.maleCount}M / {summary.femaleCount}F
                                </div>
                            </div>

                            {/* Age Categories */}
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Categories</div>
                                <div className="text-sm font-semibold text-slate-700 mt-1">
                                    {summary.ageCategoryDistribution.length} unique
                                </div>
                            </div>
                        </div>

                        {/* Age Category Distribution Details */}
                        {summary.ageCategoryDistribution.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {summary.ageCategoryDistribution.map(({ category, count }) => (
                                    <span
                                        key={category}
                                        className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-medium text-slate-700"
                                    >
                                        {category}: <strong>{count}</strong>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Story 5.3: Conflict Summary */}
                        {summary.conflictCount > 0 && (
                            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-900">
                                    {summary.errorCount > 0 ? (
                                        <>{summary.errorCount} athlete{summary.errorCount !== 1 ? 's' : ''} with eligibility errors</>
                                    ) : (
                                        <>{summary.conflictCount} athlete{summary.conflictCount !== 1 ? 's' : ''} with warnings</>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Athlete List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {selectedAthletes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <AlertCircle className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">No athletes selected</p>
                            <p className="text-sm mt-1">Use the checkboxes in the athlete list to build your roster</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedAthletes.map((athlete) => {
                                const athleteConflicts = athlete.id ? getConflicts(athlete.id) : [];
                                const hasErrors = athleteConflicts.some(c => c.severity === 'error');
                                return (
                                    <div
                                        key={athlete.id}
                                        className={`bg-slate-50 border rounded-lg p-4 hover:bg-slate-100 transition-colors ${hasErrors ? 'border-red-300 bg-red-50/30' : athleteConflicts.length > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Name */}
                                                <div className="font-semibold text-slate-900 text-base">
                                                    {athlete.name}
                                                </div>

                                                {/* Details */}
                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                                    <span className="flex items-center gap-1">
                                                        <strong>Gender:</strong> {athlete.gender === 'male' ? 'Male' : 'Female'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <strong>Age Category:</strong> {athlete.ageCategory}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <strong>Weight:</strong> {athlete.weight}kg ({athlete.weightClass})
                                                    </span>
                                                </div>

                                                {/* Rank Badge */}
                                                <div className="mt-2">
                                                    <BeltBadge rank={athlete.rank} />
                                                </div>

                                                {/* Story 5.3: Conflict Display */}
                                                {athleteConflicts.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {athleteConflicts.map((conflict, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs ${conflict.severity === 'error'
                                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                    }`}
                                                            >
                                                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <div className="font-semibold">{conflict.message}</div>
                                                                    {conflict.details && (
                                                                        <div className="text-[10px] mt-0.5 opacity-90">{conflict.details}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => athlete.id && removeAthlete(athlete.id)}
                                                className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove from roster"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedAthletes.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            <strong>{selectedAthletes.length}</strong> athlete{selectedAthletes.length !== 1 ? 's' : ''} in roster
                        </div>
                        <button
                            onClick={handleClearRoster}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Clear Roster
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
