import { create } from 'zustand';
import { EligibilityConflict } from '../../../shared/judo/validateEligibility';

/**
 * Story 5.2: Roster State Management
 * Story 5.3: Conflict tracking added
 * 
 * Manages tournament roster selection state (session-only, not persisted to database).
 * Stores selected athlete IDs to avoid data duplication and ensure roster always
 * reflects current athlete data.
 */

interface RosterState {
    selectedAthleteIds: number[];
    conflicts: Map<number, EligibilityConflict[]>; // Story 5.3: Conflict tracking

    // Actions
    addAthlete: (id: number) => void;
    removeAthlete: (id: number) => void;
    toggleAthlete: (id: number) => void;
    addMultiple: (ids: number[]) => void;
    clearRoster: () => void;
    isSelected: (id: number) => boolean;

    // Story 5.3: Conflict management
    setConflicts: (athleteId: number, conflicts: EligibilityConflict[]) => void;
    getConflicts: (athleteId: number) => EligibilityConflict[];
    hasConflicts: (athleteId: number) => boolean;
    getAllConflicts: () => EligibilityConflict[];
    clearConflicts: () => void;
}

export const useRosterStore = create<RosterState>((set, get) => ({
    selectedAthleteIds: [],
    conflicts: new Map(),

    addAthlete: (id: number) => {
        set((state) => {
            // Prevent duplicates
            if (state.selectedAthleteIds.includes(id)) {
                return state;
            }
            return { selectedAthleteIds: [...state.selectedAthleteIds, id] };
        });
    },

    removeAthlete: (id: number) => {
        set((state) => {
            // Remove from selected IDs
            const newSelectedIds = state.selectedAthleteIds.filter((athleteId) => athleteId !== id);

            // Remove conflicts for this athlete
            const newConflicts = new Map(state.conflicts);
            newConflicts.delete(id);

            return {
                selectedAthleteIds: newSelectedIds,
                conflicts: newConflicts,
            };
        });
    },

    toggleAthlete: (id: number) => {
        const { isSelected, addAthlete, removeAthlete } = get();
        if (isSelected(id)) {
            removeAthlete(id);
        } else {
            addAthlete(id);
        }
    },

    addMultiple: (ids: number[]) => {
        set((state) => {
            // Merge new IDs with existing ones, removing duplicates
            const uniqueIds = Array.from(new Set([...state.selectedAthleteIds, ...ids]));
            return { selectedAthleteIds: uniqueIds };
        });
    },

    clearRoster: () => {
        set({ selectedAthleteIds: [], conflicts: new Map() });
    },

    isSelected: (id: number) => {
        return get().selectedAthleteIds.includes(id);
    },

    // Story 5.3: Conflict management methods
    setConflicts: (athleteId: number, conflicts: EligibilityConflict[]) => {
        set((state) => {
            const newConflicts = new Map(state.conflicts);
            if (conflicts.length > 0) {
                newConflicts.set(athleteId, conflicts);
            } else {
                newConflicts.delete(athleteId);
            }
            return { conflicts: newConflicts };
        });
    },

    getConflicts: (athleteId: number) => {
        return get().conflicts.get(athleteId) || [];
    },

    hasConflicts: (athleteId: number) => {
        const conflicts = get().conflicts.get(athleteId);
        return conflicts !== undefined && conflicts.length > 0;
    },

    getAllConflicts: () => {
        const allConflicts: EligibilityConflict[] = [];
        get().conflicts.forEach((conflicts) => {
            allConflicts.push(...conflicts);
        });
        return allConflicts;
    },

    clearConflicts: () => {
        set({ conflicts: new Map() });
    },
}));
