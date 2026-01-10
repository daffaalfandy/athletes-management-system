import React, { useEffect, useState } from 'react';
import { useTournamentStore } from './useTournamentStore';
import { useTournamentRosterStore } from './useTournamentRosterStore';
import { useRulesetStore } from '../settings/useRulesetStore';
import { useAthleteStore } from '../athletes/useAthleteStore';
import { AgeCategory, WeightClass, Athlete } from '../../../shared/schemas';
import { calculateAgeCategory } from '../../../shared/judo/calculateAgeCategory';
import { AlertTriangle, X, Plus, Trash2, Calendar, MapPin, BookOpen, FileDown } from 'lucide-react';

interface TournamentDetailProps {
    tournamentId: string | null; // 'new' or numeric ID as string
    onBack: () => void;
}

export const TournamentDetail: React.FC<TournamentDetailProps> = ({ tournamentId, onBack }) => {
    const isNew = tournamentId === 'new';

    const { createTournament, updateTournament } = useTournamentStore();
    const { rulesets, loadRulesets } = useRulesetStore();
    const { athletes, loadAthletes } = useAthleteStore();
    const rosterStore = useTournamentRosterStore();

    // Tournament metadata
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [selectedRulesetId, setSelectedRulesetId] = useState<number | null>(null);
    const [rulesetSnapshot, setRulesetSnapshot] = useState<any>(null);

    // Weight classes per age category
    const [weightClassesByCategory, setWeightClassesByCategory] = useState<Map<number, WeightClass[]>>(new Map());

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [isSchoolBased, setIsSchoolBased] = useState(false);

    useEffect(() => {
        loadRulesets();
        loadAthletes();

        if (!isNew && tournamentId) {
            loadTournament(parseInt(tournamentId));
        }
    }, [tournamentId]);

    const loadTournament = async (tournamentId: number) => {
        setLoading(true);
        try {
            const tournament = await window.api.tournaments.getById(tournamentId);
            if (tournament) {
                setName(tournament.name);
                setDate(tournament.date);
                setLocation(tournament.location || '');

                // Parse ruleset snapshot
                const snapshot = JSON.parse(tournament.ruleset_snapshot);
                setRulesetSnapshot(snapshot);
                setSelectedRulesetId(snapshot.ruleset_id);

                // Load weight classes from snapshot
                const wcMap = new Map<number, WeightClass[]>();
                snapshot.age_categories.forEach((cat: AgeCategory & { id: number }) => {
                    if (cat.weight_classes) {
                        wcMap.set(cat.id, cat.weight_classes);
                    }
                });
                setWeightClassesByCategory(wcMap);

                // Load roster
                const roster = await window.api.tournaments.getRoster(tournamentId);
                rosterStore.loadRoster(roster);
            }
        } catch (error) {
            console.error('Failed to load tournament:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRulesetChange = async (rulesetId: number) => {
        setSelectedRulesetId(rulesetId);

        // Load ruleset with categories
        const ruleset = await window.api.rulesets.getById(rulesetId);
        if (ruleset && ruleset.categories) {
            // Initialize empty weight classes for each category
            const wcMap = new Map<number, WeightClass[]>();
            ruleset.categories.forEach((cat) => {
                if (cat.id) {
                    wcMap.set(cat.id, []);
                }
            });
            setWeightClassesByCategory(wcMap);
        }
    };

    const addWeightClass = (categoryId: number, limit: number, label: string) => {
        setWeightClassesByCategory((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(categoryId) || [];
            newMap.set(categoryId, [...existing, { limit, label }]);
            return newMap;
        });
    };

    const removeWeightClass = (categoryId: number, index: number) => {
        setWeightClassesByCategory((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(categoryId) || [];
            newMap.set(categoryId, existing.filter((_, i) => i !== index));
            return newMap;
        });
    };

    const handleSave = async () => {
        if (!name || !date || !selectedRulesetId) {
            alert('Please fill in all required fields');
            return;
        }

        const selectedRuleset = rulesets.find(r => r.id === selectedRulesetId);
        if (!selectedRuleset || !selectedRuleset.categories) {
            alert('Invalid ruleset selected');
            return;
        }

        // Check if at least one weight class is defined across all categories
        const totalWeightClasses = Array.from(weightClassesByCategory.values())
            .reduce((sum, wcs) => sum + wcs.length, 0);

        if (totalWeightClasses === 0) {
            alert('Please add at least one weight class to any age category');
            return;
        }

        setSaving(true);
        try {
            // Create ruleset snapshot
            const snapshot = {
                ruleset_id: selectedRulesetId,
                ruleset_name: selectedRuleset.name,
                description: selectedRuleset.description || '',
                age_categories: selectedRuleset.categories.map((cat) => ({
                    ...cat,
                    weight_classes: weightClassesByCategory.get(cat.id!) || [],
                })),
            };

            const tournamentData = {
                name,
                date,
                location,
                ruleset_snapshot: JSON.stringify(snapshot),
            };

            if (isNew) {
                const newTournament = await createTournament(tournamentData);

                // Save roster
                const rosterEntries = rosterStore.getRosterEntries();
                if (rosterEntries.length > 0) {
                    await window.api.tournaments.saveRoster(newTournament.id!, rosterEntries);
                }

                onBack();
            } else {
                await updateTournament({ ...tournamentData, id: parseInt(tournamentId!) });

                // Save roster
                const rosterEntries = rosterStore.getRosterEntries();
                await window.api.tournaments.saveRoster(parseInt(tournamentId!), rosterEntries);

                onBack();
            }
        } catch (error) {
            console.error('Failed to save tournament:', error);
            alert('Failed to save tournament');
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = async () => {
        if (isNew || !tournamentId) {
            alert('Please save the tournament first before exporting');
            return;
        }

        setExporting(true);
        try {
            const includeColumns = isSchoolBased
                ? ['school_name', 'nisn', 'nik']
                : [];

            const result = await window.api.export.generateRosterPDF(parseInt(tournamentId), {
                includeColumns
            });

            if (result.success) {
                alert(`PDF exported successfully to:\n${result.filePath}`);
            } else {
                // Sanitize error message for user display
                const userMessage = result.error?.includes('not found')
                    ? 'Tournament or roster data not found'
                    : result.error?.includes('No athletes')
                        ? 'No athletes in roster. Please add athletes before exporting.'
                        : 'Failed to generate PDF. Please try again.';
                alert(userMessage);
                console.error('Export error:', result.error);
            }
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('An unexpected error occurred while exporting. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading tournament...</div>
            </div>
        );
    }

    const selectedRuleset = rulesets.find(r => r.id === selectedRulesetId);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header Bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        ← Back to Tournaments
                    </button>
                    <div className="flex gap-3">
                        {!isNew && (
                            <label className="flex items-center gap-2 text-sm text-slate-700 mr-2" title="Include School Name, NISN, and NIK columns in PDF export">
                                <input
                                    type="checkbox"
                                    checked={isSchoolBased}
                                    onChange={(e) => setIsSchoolBased(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    aria-label="Include school data in roster export"
                                />
                                School Based
                            </label>
                        )}
                        {!isNew && (
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium text-sm shadow-sm flex items-center gap-2"
                            >
                                <FileDown className="w-4 h-4" />
                                {exporting ? 'Exporting...' : 'Export PDF'}
                            </button>
                        )}
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium text-sm shadow-sm"
                        >
                            {saving ? 'Saving...' : 'Save Tournament'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">


                {/* Tournament Information */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Tournament Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Tournament name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Tournament location"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <BookOpen className="w-4 h-4 inline mr-1" />
                                Ruleset * {!isNew && <span className="text-amber-600">(frozen)</span>}
                            </label>
                            <select
                                value={selectedRulesetId || ''}
                                onChange={(e) => handleRulesetChange(parseInt(e.target.value))}
                                disabled={!isNew}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50 transition-all"
                            >
                                <option value="">Select ruleset</option>
                                {rulesets.map((ruleset) => (
                                    <option key={ruleset.id} value={ruleset.id}>
                                        {ruleset.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Weight Classes */}
                {selectedRuleset && selectedRuleset.categories && (
                    <WeightClassSection
                        categories={selectedRuleset.categories}
                        weightClassesByCategory={weightClassesByCategory}
                        onAddWeightClass={addWeightClass}
                        onRemoveWeightClass={removeWeightClass}
                        disabled={!isNew}
                    />
                )}

                {/* Roster Selection */}
                {selectedRuleset && selectedRuleset.categories && (
                    <RosterSection
                        categories={selectedRuleset.categories}
                        weightClassesByCategory={weightClassesByCategory}
                        athletes={athletes}
                        tournamentYear={date ? new Date(date).getFullYear() : new Date().getFullYear()}
                        activeRuleset={selectedRuleset}
                    />
                )}
            </div>
        </div>
    );
};

// Weight Class Section Component
const WeightClassSection: React.FC<{
    categories: AgeCategory[];
    weightClassesByCategory: Map<number, WeightClass[]>;
    onAddWeightClass: (categoryId: number, limit: number, label: string) => void;
    onRemoveWeightClass: (categoryId: number, index: number) => void;
    disabled: boolean;
}> = ({ categories, weightClassesByCategory, onAddWeightClass, onRemoveWeightClass, disabled }) => {
    const [newWeightClass, setNewWeightClass] = useState<{ categoryId: number | null; limit: string; label: string }>({
        categoryId: null,
        limit: '',
        label: '',
    });

    const handleAdd = () => {
        if (newWeightClass.categoryId && newWeightClass.limit && newWeightClass.label) {
            onAddWeightClass(newWeightClass.categoryId, parseFloat(newWeightClass.limit), newWeightClass.label);
            setNewWeightClass({ categoryId: null, limit: '', label: '' });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Weight Classes (Optional)</h2>
            <p className="text-sm text-slate-600 mb-4">Define weight classes for age categories that will be used in this tournament. You can leave categories empty if not needed.</p>
            {categories.map((category) => (
                <div key={category.id} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">{category.name} ({category.gender})</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {(weightClassesByCategory.get(category.id!) || []).length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No weight classes defined</span>
                        ) : (
                            (weightClassesByCategory.get(category.id!) || []).map((wc, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="text-sm font-medium text-blue-700">{wc.label}</span>
                                    {!disabled && (
                                        <button
                                            onClick={() => onRemoveWeightClass(category.id!, index)}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    {!disabled && (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Limit (kg)"
                                value={newWeightClass.categoryId === category.id ? newWeightClass.limit : ''}
                                onChange={(e) => setNewWeightClass({ categoryId: category.id!, limit: e.target.value, label: newWeightClass.label })}
                                className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Label (e.g., -55kg)"
                                value={newWeightClass.categoryId === category.id ? newWeightClass.label : ''}
                                onChange={(e) => setNewWeightClass({ categoryId: category.id!, limit: newWeightClass.limit, label: e.target.value })}
                                className="w-40 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Roster Section Component
const RosterSection: React.FC<{
    categories: AgeCategory[];
    weightClassesByCategory: Map<number, WeightClass[]>;
    athletes: Athlete[];
    tournamentYear: number;
    activeRuleset: any;
}> = ({ categories, weightClassesByCategory, athletes, tournamentYear, activeRuleset }) => {
    const rosterStore = useTournamentRosterStore();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedWeightClass, setSelectedWeightClass] = useState<string>('');

    const handleAddAthlete = (athleteId: number) => {
        if (selectedWeightClass && selectedCategory) {
            rosterStore.addAthlete(athleteId, selectedWeightClass);
        }
    };

    const selectedAthletes = rosterStore.selectedAthletes;

    // Helper to check athlete eligibility
    const checkAthleteEligibility = (athlete: Athlete, categoryId: number, weightClass: string) => {
        const warnings: string[] = [];

        // Check age category match
        const athleteCategory = calculateAgeCategory(
            athlete.birthDate,
            athlete.gender,
            activeRuleset?.categories || [],
            tournamentYear
        );
        const selectedCat = categories.find(c => c.id === categoryId);
        if (selectedCat && athleteCategory !== selectedCat.name) {
            warnings.push(`Age category mismatch: Athlete is ${athleteCategory}, selected ${selectedCat.name}`);
        }

        // Check weight class
        const weightClassLimit = parseFloat(weightClass.replace(/[^\d.]/g, ''));
        if (!isNaN(weightClassLimit) && athlete.weight > weightClassLimit) {
            warnings.push(`Weight exceeds class limit: ${athlete.weight}kg > ${weightClassLimit}kg`);
        }

        return warnings;
    };

    // Filter available athletes by selected category
    const availableAthletes = athletes.filter((athlete) => {
        if (selectedAthletes.has(athlete.id!)) return false;

        if (selectedCategory) {
            const athleteCategory = calculateAgeCategory(
                athlete.birthDate,
                athlete.gender,
                activeRuleset?.categories || [],
                tournamentYear
            );
            const selectedCat = categories.find(c => c.id === selectedCategory);
            // Show all athletes but we'll warn about mismatches
            return true;
        }

        return true;
    });

    // Group selected athletes by weight class
    const athletesByWeightClass = new Map<string, Array<Athlete & { warnings: string[] }>>();
    selectedAthletes.forEach((weightClass, athleteId) => {
        const athlete = athletes.find((a) => a.id === athleteId);
        if (athlete) {
            // Find which category this weight class belongs to
            let categoryId: number | null = null;
            for (const [catId, wcs] of weightClassesByCategory.entries()) {
                if (wcs.some(wc => wc.label === weightClass)) {
                    categoryId = catId;
                    break;
                }
            }

            const warnings = categoryId ? checkAthleteEligibility(athlete, categoryId, weightClass) : [];

            if (!athletesByWeightClass.has(weightClass)) {
                athletesByWeightClass.set(weightClass, []);
            }
            athletesByWeightClass.get(weightClass)!.push({ ...athlete, warnings });
        }
    });

    // Count total warnings
    const totalWarnings = Array.from(athletesByWeightClass.values())
        .flat()
        .reduce((sum, a) => sum + a.warnings.length, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Roster Selection</h2>
                {totalWarnings > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">{totalWarnings} warning{totalWarnings > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Available Athletes */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Athletes</h3>

                    {/* Filters */}
                    <div className="mb-4 space-y-2">
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value ? parseInt(e.target.value) : null);
                                setSelectedWeightClass(''); // Reset weight class when category changes
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            <option value="">Select Age Category First</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name} ({cat.gender})</option>
                            ))}
                        </select>

                        <select
                            value={selectedWeightClass}
                            onChange={(e) => setSelectedWeightClass(e.target.value)}
                            disabled={!selectedCategory}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50 transition-all"
                        >
                            <option value="">Select Weight Class</option>
                            {selectedCategory && weightClassesByCategory.get(selectedCategory)?.map((wc, idx) => (
                                <option key={idx} value={wc.label}>{wc.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {availableAthletes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No athletes available
                            </div>
                        ) : (
                            availableAthletes.map((athlete) => {
                                const warnings = selectedCategory && selectedWeightClass
                                    ? checkAthleteEligibility(athlete, selectedCategory, selectedWeightClass)
                                    : [];

                                return (
                                    <div key={athlete.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">{athlete.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {athlete.weight}kg • {athlete.rank}
                                            </div>
                                            {warnings.length > 0 && (
                                                <div className="mt-1 flex items-start gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-amber-600">
                                                        {warnings[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddAthlete(athlete.id!)}
                                            disabled={!selectedWeightClass || !selectedCategory}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ml-3"
                                        >
                                            Add
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Selected Athletes */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Selected Athletes ({selectedAthletes.size})
                    </h3>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {athletesByWeightClass.size === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No athletes selected yet
                            </div>
                        ) : (
                            Array.from(athletesByWeightClass.entries()).map(([weightClass, athleteList]) => (
                                <div key={weightClass}>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{weightClass}</h4>
                                    <div className="space-y-2">
                                        {athleteList.map((athlete) => {
                                            const hasWarnings = athlete.warnings.length > 0;

                                            return (
                                                <div key={athlete.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${hasWarnings
                                                    ? 'bg-amber-50 border-amber-200'
                                                    : 'bg-slate-50 border-slate-200'
                                                    }`}>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-slate-900">{athlete.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {athlete.weight}kg • {athlete.rank}
                                                        </div>
                                                        {hasWarnings && (
                                                            <div className="mt-1.5 space-y-1">
                                                                {athlete.warnings.map((warning, idx) => (
                                                                    <div key={idx} className="flex items-start gap-1">
                                                                        <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                                                        <span className="text-xs text-amber-600">{warning}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => rosterStore.removeAthlete(athlete.id!)}
                                                        className="text-red-500 hover:text-red-600 transition-colors ml-3"
                                                        title="Remove athlete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
