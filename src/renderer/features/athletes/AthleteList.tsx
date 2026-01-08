import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, User, Trash2, Filter, ChevronUp, ChevronDown, Calendar, FileCheck, FileX, Clipboard, AlertTriangle, FileDown } from 'lucide-react';
import { useAthleteStore } from './useAthleteStore';

import { BeltBadge } from '../../components/BeltBadge';
import { ActivityStatus, Rank } from '../../../shared/types/domain';
import { Athlete, AgeCategory } from '../../../shared/schemas';
import { calculateAgeCategory } from '../../../shared/judo/calculateAgeCategory';
import { useRulesetStore } from '../settings/useRulesetStore';
import { useClubStore } from '../settings/useClubStore';


interface AthleteListProps {
    onEdit: (athlete: Athlete) => void;
}

type SortColumn = 'name' | 'rank' | 'club' | 'status';
type SortDirection = 'asc' | 'desc';

const RANK_ORDER: Record<string, number> = {
    [Rank.White]: 1,
    [Rank.Yellow]: 2,
    [Rank.Orange]: 3,
    [Rank.Green]: 4,
    [Rank.Blue]: 5,
    [Rank.Brown]: 6,
    [Rank.Dan1]: 7,
    [Rank.Dan2]: 8,
    [Rank.Dan3]: 9,
    [Rank.Dan4]: 10,
    [Rank.Dan5]: 11,
    [Rank.Dan6]: 12,
    [Rank.Dan7]: 13,
    [Rank.Dan8]: 14,
    [Rank.Dan9]: 15,
    [Rank.Dan10]: 16,
};

const STATUS_ORDER: Record<string, number> = {
    [ActivityStatus.Constant]: 1,
    [ActivityStatus.Intermittent]: 2,
    [ActivityStatus.Dormant]: 3,
};

// Story 9.3: Refined Weight Class Divisions (Pa/Pi)
const WEIGHT_DIVISIONS = {
    male: ['-50kg', '-55kg', '-60kg', '-66kg', '-73kg', '-81kg', '+81kg', '-90kg', '-100kg', '+100kg'],
    female: ['-40kg', '-44kg', '-48kg', '-52kg', '-57kg', '-63kg', '+63kg', '-70kg', '-78kg', '+78kg'],
};

export const AthleteList: React.FC<AthleteListProps> = ({ onEdit }) => {
    const athletes = useAthleteStore(state => state.athletes);
    const deleteAthlete = useAthleteStore(state => state.deleteAthlete);
    const loadRulesets = useRulesetStore(state => state.loadRulesets);
    const clubs = useClubStore(state => state.clubs);
    const loadClubs = useClubStore(state => state.loadClubs);


    // Use Zustand selector for reactivity
    const activeRuleset = useRulesetStore(state => state.rulesets.find(r => r.is_active));
    const currentYear = new Date().getFullYear();

    const [searchTerm, setSearchTerm] = useState('');
    const [referenceYear, setReferenceYear] = useState(currentYear);
    const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection }>({
        key: 'name',
        direction: 'asc',
    });

    // Story 5.1: Roster Filter States
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
    const [ageCategoryFilter, setAgeCategoryFilter] = useState<string[]>([]);
    const [weightClassFilter, setWeightClassFilter] = useState<string[]>([]);
    const [rankFilter, setRankFilter] = useState<string[]>([]); // Changed to array for multi-select
    const [clubFilter, setClubFilter] = useState<string[]>([]); // Changed to array for multi-select

    // Story 6.2: Selection state for PDF export
    const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);




    // Load rulesets and clubs on mount
    useEffect(() => {
        loadRulesets();
        loadClubs();
    }, [loadRulesets, loadClubs]);

    // Story 5.3: Validate selected athletes for conflicts




    // Generate year options (current year + next 3 years)
    const yearOptions = useMemo(() => {
        return Array.from({ length: 4 }, (_, i) => currentYear + i);
    }, [currentYear]);

    // Helper to derive UI fields from backend data
    const enhanceAthlete = useCallback((athlete: Athlete) => {
        // Calculate weight class based on gender and weight
        let weightClass = 'Unclassified';
        if (athlete.weight > 0) {
            const divisions = WEIGHT_DIVISIONS[athlete.gender];
            for (const division of divisions) {
                if (division.startsWith('+')) {
                    // For +100kg or +78kg, assign if weight is greater than the threshold
                    const threshold = parseInt(division.substring(1).replace('kg', ''));
                    if (athlete.weight > threshold) {
                        weightClass = division;
                        break;
                    }
                } else {
                    // For -60kg, -66kg, etc., assign if weight is less than or equal to the limit
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
                referenceYear // Use selected reference year
            ),
            clubName: athlete.clubId ? (clubs.find(c => c.id === athlete.clubId)?.name || 'Unknown Club') : 'Unattached',
            status: (athlete.activity_status as ActivityStatus) || ActivityStatus.Constant,
            isVerified: true
        };
    }, [activeRuleset, referenceYear, clubs]);

    // Filtering & Sorting Logic
    const filteredAthletes = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const results = athletes.map(enhanceAthlete).filter(
            (athlete) => {
                const matchesName = athlete.name.toLowerCase().includes(term);

                // Story 5.1: New roster filters
                const matchesGender = genderFilter === 'all' || athlete.gender === genderFilter;
                const matchesAgeCategory = ageCategoryFilter.length === 0 || ageCategoryFilter.includes(athlete.ageCategory);

                // Story 9.3: Range-based weight class filtering
                const matchesWeightClass = weightClassFilter.length === 0 || weightClassFilter.some(selectedClass => {
                    // Remove Pa/Pi label to get raw weight class
                    const rawClass = selectedClass.replace(/ \((Pa|Pi)\)/g, '');
                    const divisions = WEIGHT_DIVISIONS[athlete.gender];
                    const classIndex = divisions.indexOf(rawClass);

                    if (classIndex === -1) return false;

                    // Calculate range for this weight class
                    if (rawClass.startsWith('+')) {
                        // Upper limit: e.g., +100kg means > 100
                        const threshold = parseInt(rawClass.substring(1).replace('kg', ''));
                        return athlete.weight > threshold;
                    } else {
                        // Upper bound: e.g., -55kg means <= 55
                        const max = parseInt(rawClass.substring(1).replace('kg', ''));

                        // Find minimum from previous class
                        let min = 0;
                        if (classIndex > 0) {
                            const prevClass = divisions[classIndex - 1];
                            if (prevClass.startsWith('+')) {
                                min = parseInt(prevClass.substring(1).replace('kg', ''));
                            } else {
                                min = parseInt(prevClass.substring(1).replace('kg', ''));
                            }
                        }

                        return athlete.weight > min && athlete.weight <= max;
                    }
                });

                const matchesRank = rankFilter.length === 0 || rankFilter.includes(athlete.rank); // Multi-select
                const matchesClub = clubFilter.length === 0 || clubFilter.includes(athlete.clubName); // Multi-select

                return matchesName && matchesGender && matchesAgeCategory && matchesWeightClass && matchesRank && matchesClub;
            }
        );

        // Apply Sorting
        return results.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortConfig.key) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'rank':
                    valA = RANK_ORDER[a.rank as Rank] || 0;
                    valB = RANK_ORDER[b.rank as Rank] || 0;
                    break;
                case 'club':
                    valA = a.clubName.toLowerCase();
                    valB = b.clubName.toLowerCase();
                    break;
                case 'status':
                    valA = STATUS_ORDER[a.status] || 0;
                    valB = STATUS_ORDER[a.status] || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [athletes, searchTerm, sortConfig, enhanceAthlete, genderFilter, ageCategoryFilter, weightClassFilter, rankFilter, clubFilter]);

    // Story 6.2: Clear stale selections when filters change
    useEffect(() => {
        if (selectedAthleteIds.size > 0) {
            const validIds = new Set(
                filteredAthletes
                    .map(a => a.id)
                    .filter((id): id is number => id !== undefined)
            );
            const hasStaleSelections = Array.from(selectedAthleteIds).some(id => !validIds.has(id));
            if (hasStaleSelections) {
                // Remove IDs that are no longer in filtered list
                const updatedIds = new Set(
                    Array.from(selectedAthleteIds).filter(id => validIds.has(id))
                );
                setSelectedAthleteIds(updatedIds);
            }
        }
    }, [filteredAthletes, selectedAthleteIds]);

    // Derive unique clubs for filter dropdown - show all clubs, not just assigned ones
    const availableClubs = useMemo(() => {
        const clubNames = clubs.map(c => c.name);
        // Add "Unattached" if any athletes don't have a club
        const hasUnattached = athletes.some(a => !a.clubId);
        if (hasUnattached) {
            clubNames.push('Unattached');
        }
        return clubNames.sort();
    }, [athletes, clubs]);

    // Story 5.1: Extract available age categories from active ruleset
    const availableAgeCategories = useMemo(() => {
        if (!activeRuleset?.categories) return [];
        const categories = new Set(activeRuleset.categories.map(cat => cat.name));
        return Array.from(categories).sort();
    }, [activeRuleset]);

    // Story 9.3: Get available weight classes with Pa/Pi labels
    const availableWeightClasses = useMemo(() => {
        if (genderFilter === 'all') {
            // Show both male and female divisions with labels when "all" is selected
            const maleClasses = WEIGHT_DIVISIONS.male.map(wc => `${wc} (Pa)`);
            const femaleClasses = WEIGHT_DIVISIONS.female.map(wc => `${wc} (Pi)`);
            return [...maleClasses, ...femaleClasses];
        }
        // Add gender label to weight classes
        const label = genderFilter === 'male' ? 'Pa' : 'Pi';
        return WEIGHT_DIVISIONS[genderFilter].map(wc => `${wc} (${label})`);
    }, [genderFilter]);

    const handleSort = (key: SortColumn) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const renderSortIcon = (key: SortColumn) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />;
    };

    // Handler for Delete
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name} from the athlete pool?`)) {
            deleteAthlete(id);
        }
    };

    // Handler for Edit
    const handleEdit = (athlete: Athlete) => {
        onEdit(athlete);
    };

    // Story 5.1: Filter handlers
    const handleClearAllFilters = () => {
        setSearchTerm('');
        setGenderFilter('all');
        setAgeCategoryFilter([]);
        setWeightClassFilter([]);
        setRankFilter([]);
        setClubFilter([]);
    };

    // Story 9.3: Handle gender filter change with weight class sync
    const handleGenderFilterChange = (newGender: 'all' | 'male' | 'female') => {
        setGenderFilter(newGender);

        // Clear weight class selections when changing gender
        // This prevents showing Pa classes when Female is selected, etc.
        if (weightClassFilter.length > 0) {
            if (newGender === 'all') {
                // Keep selections when switching to 'all'
                return;
            }

            // Filter out incompatible weight classes
            const targetLabel = newGender === 'male' ? '(Pa)' : '(Pi)';
            const compatibleSelections = weightClassFilter.filter(wc => wc.includes(targetLabel));

            if (compatibleSelections.length !== weightClassFilter.length) {
                setWeightClassFilter(compatibleSelections);
            }
        }
    };

    const toggleAgeCategory = (category: string) => {
        setAgeCategoryFilter(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Story 9.3: Auto-sync gender filter when weight class is selected
    const toggleWeightClass = (weightClass: string) => {
        // Extract gender from label
        const isPa = weightClass.includes('(Pa)');
        const isPi = weightClass.includes('(Pi)');

        // Auto-sync gender filter
        if (isPa && genderFilter !== 'male') {
            setGenderFilter('male');
            // Clear incompatible weight class selections
            setWeightClassFilter([weightClass]);
        } else if (isPi && genderFilter !== 'female') {
            setGenderFilter('female');
            // Clear incompatible weight class selections
            setWeightClassFilter([weightClass]);
        } else {
            // Normal toggle behavior
            setWeightClassFilter(prev =>
                prev.includes(weightClass)
                    ? prev.filter(w => w !== weightClass)
                    : [...prev, weightClass]
            );
        }
    };

    const toggleRank = (rank: string) => {
        setRankFilter(prev =>
            prev.includes(rank)
                ? prev.filter(r => r !== rank)
                : [...prev, rank]
        );
    };

    const toggleClub = (club: string) => {
        setClubFilter(prev =>
            prev.includes(club)
                ? prev.filter(c => c !== club)
                : [...prev, club]
        );
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== '' || genderFilter !== 'all' ||
        ageCategoryFilter.length > 0 || weightClassFilter.length > 0 ||
        rankFilter.length > 0 || clubFilter.length > 0;

    // Story 6.2: Selection handlers
    const handleToggleAthlete = (id: number) => {
        setSelectedAthleteIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedAthleteIds.size === filteredAthletes.length) {
            // If all are selected, deselect all
            setSelectedAthleteIds(new Set());
        } else {
            // Select all filtered athletes
            const allIds = new Set(filteredAthletes.map(a => a.id).filter((id): id is number => id !== undefined));
            setSelectedAthleteIds(allIds);
        }
    };

    const handleExportPDF = async () => {
        if (selectedAthleteIds.size === 0) return;

        setIsExporting(true);
        try {
            // Get ordered athlete IDs from filtered list
            const orderedIds = filteredAthletes
                .filter(a => a.id !== undefined && selectedAthleteIds.has(a.id))
                .map(a => a.id as number);

            const result = await window.api.export.generateAthleteSummaryPDF(orderedIds);

            if (result.success) {
                alert(`PDF exported successfully!\n\nSaved to: ${result.filePath}`);
                // Clear selection after successful export
                setSelectedAthleteIds(new Set());
            } else {
                alert(`Export failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };




    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Control Bar - Improved Multi-Row Layout */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                {/* Row 1: Search + Gender + Year + Count */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[280px] max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Story 5.1: Gender Filter Toggle - Larger Buttons */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-50">
                        <button
                            onClick={() => handleGenderFilterChange('all')}
                            className={`px-4 py-2.5 text-sm font-medium transition-all ${genderFilter === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleGenderFilterChange('male')}
                            className={`px-4 py-2.5 text-sm font-medium transition-all border-l border-slate-200 ${genderFilter === 'male'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Male
                        </button>
                        <button
                            onClick={() => handleGenderFilterChange('female')}
                            className={`px-4 py-2.5 text-sm font-medium transition-all border-l border-slate-200 ${genderFilter === 'female'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Female
                        </button>
                    </div>

                    {/* Tournament Year Selector */}
                    <MultiSelectDropdown
                        label="Tournament Year"
                        options={yearOptions.map(year =>
                            year === currentYear ? `${year} (Current)` : year.toString()
                        )}
                        selectedOptions={[referenceYear === currentYear ? `${referenceYear} (Current)` : referenceYear.toString()]}
                        onToggle={(yearStr) => {
                            const year = parseInt(yearStr.replace(' (Current)', ''));
                            setReferenceYear(year);
                        }}
                        onClear={() => setReferenceYear(currentYear)}
                        onSelectAll={() => { }} // Not applicable for single-select
                        hideActions={true}
                    />

                    {/* Result Count */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium ml-auto">
                        <div className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            Showing {filteredAthletes.length} of {athletes.length}
                        </div>

                        {/* Story 6.2: Selection Count and Export Button */}
                        {selectedAthleteIds.size > 0 && (
                            <>
                                <div className="flex items-center text-blue-600 font-semibold">
                                    {selectedAthleteIds.size} selected
                                </div>
                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                                >
                                    <FileDown className="w-4 h-4" />
                                    {isExporting ? 'Exporting...' : 'Export Selected Athletes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Row 2: Roster Filters + Standard Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Story 5.1: Age Category Multi-Select */}
                    <MultiSelectDropdown
                        label="Age Category"
                        options={availableAgeCategories}
                        selectedOptions={ageCategoryFilter}
                        onToggle={toggleAgeCategory}
                        onClear={() => setAgeCategoryFilter([])}
                        onSelectAll={() => setAgeCategoryFilter(availableAgeCategories)}
                    />

                    {/* Story 5.1: Weight Class Multi-Select */}
                    <MultiSelectDropdown
                        label="Weight Class"
                        options={availableWeightClasses}
                        selectedOptions={weightClassFilter}
                        onToggle={toggleWeightClass}
                        onClear={() => setWeightClassFilter([])}
                        onSelectAll={() => setWeightClassFilter(availableWeightClasses)}
                    />

                    {/* Rank Filter */}
                    <MultiSelectDropdown
                        label="Belt"
                        options={Object.values(Rank)}
                        selectedOptions={rankFilter}
                        onToggle={toggleRank}
                        onClear={() => setRankFilter([])}
                        onSelectAll={() => setRankFilter(Object.values(Rank))}
                    />

                    {/* Club Filter */}
                    <MultiSelectDropdown
                        label="Club"
                        options={availableClubs}
                        selectedOptions={clubFilter}
                        onToggle={toggleClub}
                        onClear={() => setClubFilter([])}
                        onSelectAll={() => setClubFilter(availableClubs)}
                    />
                </div>
            </div>

            {/* Story 5.1: Active Filter Indicators */}
            {hasActiveFilters && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600">Active Filters:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {genderFilter !== 'all' && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Gender: <strong>{genderFilter}</strong>
                            </span>
                        )}
                        {ageCategoryFilter.length > 0 && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Age: <strong>{ageCategoryFilter.join(', ')}</strong>
                            </span>
                        )}
                        {weightClassFilter.length > 0 && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Weight: <strong>{weightClassFilter.join(', ')}</strong>
                            </span>
                        )}
                        {rankFilter.length > 0 && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Belt: <strong>{rankFilter.join(', ')}</strong>
                            </span>
                        )}
                        {clubFilter.length > 0 && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Club: <strong>{clubFilter.join(', ')}</strong>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-700">
                                Search: <strong>"{searchTerm}"</strong>
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleClearAllFilters}
                        className="ml-auto px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* List Container */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm ring-1 ring-slate-900/5">
                        <tr>
                            {/* Story 6.2: Checkbox Column Header */}
                            <th scope="col" className="px-3 pl-4 py-3 text-center w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedAthleteIds.size > 0 && selectedAthleteIds.size === filteredAthletes.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    title="Select All"
                                    aria-label="Select all athletes"
                                />
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Athlete Identity
                                    {renderSortIcon('name')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort('rank')}
                            >
                                <div className="flex items-center">
                                    Belt
                                    {renderSortIcon('rank')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort('club')}
                            >
                                <div className="flex items-center">
                                    Club
                                    {renderSortIcon('club')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center justify-center">
                                    Status
                                    {renderSortIcon('status')}
                                </div>
                            </th>
                            <th scope="col" className="relative px-3 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {filteredAthletes.map((athlete) => {
                            return (
                                <tr
                                    key={athlete.id}
                                    onClick={() => handleEdit(athlete)}
                                    className="group hover:bg-blue-50/40 transition-colors duration-150 ease-in-out cursor-pointer"
                                >
                                    {/* Story 6.2: Checkbox Column */}
                                    <td className="px-3 pl-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={athlete.id !== undefined && selectedAthleteIds.has(athlete.id)}
                                            onChange={() => athlete.id !== undefined && handleToggleAthlete(athlete.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                            aria-label={`Select ${athlete.name}`}
                                        />
                                    </td>
                                    {/* Identity Column */}
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {/* Initials Avatar */}
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
                                                {athlete.profile_photo_path ? (
                                                    <img src={`dossier://${athlete.profile_photo_path}?t=${Date.now()}`} alt={athlete.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    athlete.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                    {athlete.name}
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                                        {athlete.ageCategory}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{athlete.weightClass}</span>
                                                    <span>•</span>
                                                    <span>{athlete.birthDate?.toString().split('-')[0] || 'N/A'}</span>
                                                </div>
                                            </div>
                                            {/* Dossier Status Badge (Visible mostly on desktop or if critical) */}
                                            <div className="ml-auto pr-4 hidden sm:flex items-center gap-2">
                                                {athlete.profile_photo_path ? (
                                                    <div className="group/dossier relative">
                                                        <FileCheck size={16} className="text-emerald-500" />
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/dossier:opacity-100 transition-opacity whitespace-nowrap mb-1">
                                                            Dossier Active
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="group/dossier relative">
                                                        <FileX size={16} className="text-slate-300" />
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/dossier:opacity-100 transition-opacity whitespace-nowrap mb-1">
                                                            No Photo
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rank Column */}
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                        <BeltBadge rank={athlete.rank} />
                                    </td>

                                    {/* Club Column */}
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                        <div className="text-xs text-slate-600 font-medium">
                                            {athlete.clubName}
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                                        <StatusPill status={athlete.status} isVerified={athlete.isVerified} />
                                    </td>

                                    {/* Actions Column (Visible on Hover) */}
                                    <td className="px-3 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(athlete); }}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="View Details"
                                            >
                                                <User className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); athlete.id && handleDelete(athlete.id, athlete.name); }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Athlete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredAthletes.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    <p className="text-sm">No athletes found matching "{searchTerm}"</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Story 5.1: Multi-Select Dropdown Component
interface MultiSelectDropdownProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onToggle: (option: string) => void;
    onClear: () => void;
    onSelectAll: () => void;
    hideActions?: boolean; // Optional: hide Select All/Clear buttons
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    label,
    options,
    selectedOptions,
    onToggle,
    onClear,
    onSelectAll,
    hideActions = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium shadow-sm transition-all min-w-[160px]"
            >
                <span>{label}</span>
                {selectedOptions.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                        {selectedOptions.length}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[220px] max-h-[320px] overflow-y-auto z-50">
                    {/* Select All / Clear All */}
                    {!hideActions && (
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                            <button
                                onClick={onSelectAll}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Select All
                            </button>
                            <button
                                onClick={onClear}
                                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Options List */}
                    {options.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-slate-400 text-center">
                            No options available
                        </div>
                    ) : (
                        <div className="py-1">
                            {options.map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.includes(option)}
                                        onChange={() => onToggle(option)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper Component for the Status Column
const StatusPill: React.FC<{ status: ActivityStatus; isVerified: boolean }> = ({ status, isVerified }) => {
    const statusColors = {
        [ActivityStatus.Constant]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        [ActivityStatus.Intermittent]: 'bg-amber-50 text-amber-700 border-amber-100',
        [ActivityStatus.Dormant]: 'bg-slate-50 text-slate-500 border-slate-100',
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[status]}`}>
                {status}
            </span>
            {!isVerified && (
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                    • Unverified •
                </span>
            )}
        </div>
    );
};
