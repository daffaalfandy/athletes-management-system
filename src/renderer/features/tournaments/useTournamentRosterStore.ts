import { create } from 'zustand';
import { TournamentRosterEntry } from '../../../shared/schemas';

interface TournamentRosterState {
    selectedAthletes: Map<number, string>; // athleteId -> weightClass
    addAthlete: (athleteId: number, weightClass: string) => void;
    removeAthlete: (athleteId: number) => void;
    updateWeightClass: (athleteId: number, weightClass: string) => void;
    clearRoster: () => void;
    loadRoster: (entries: TournamentRosterEntry[]) => void;
    getRosterEntries: () => Array<{ athleteId: number; weightClass: string }>;
}

export const useTournamentRosterStore = create<TournamentRosterState>((set, get) => ({
    selectedAthletes: new Map(),

    addAthlete: (athleteId: number, weightClass: string) => {
        set((state) => {
            const newMap = new Map(state.selectedAthletes);
            newMap.set(athleteId, weightClass);
            return { selectedAthletes: newMap };
        });
    },

    removeAthlete: (athleteId: number) => {
        set((state) => {
            const newMap = new Map(state.selectedAthletes);
            newMap.delete(athleteId);
            return { selectedAthletes: newMap };
        });
    },

    updateWeightClass: (athleteId: number, weightClass: string) => {
        set((state) => {
            const newMap = new Map(state.selectedAthletes);
            if (newMap.has(athleteId)) {
                newMap.set(athleteId, weightClass);
            }
            return { selectedAthletes: newMap };
        });
    },

    clearRoster: () => {
        set({ selectedAthletes: new Map() });
    },

    loadRoster: (entries: TournamentRosterEntry[]) => {
        const newMap = new Map<number, string>();
        entries.forEach((entry) => {
            newMap.set(entry.athlete_id, entry.weight_class);
        });
        set({ selectedAthletes: newMap });
    },

    getRosterEntries: () => {
        const entries: Array<{ athleteId: number; weightClass: string }> = [];
        get().selectedAthletes.forEach((weightClass, athleteId) => {
            entries.push({ athleteId, weightClass });
        });
        return entries;
    },
}));
