import { create } from 'zustand';
import { TournamentHistory } from '../../../shared/schemas';

interface TournamentHistoryState {
    history: TournamentHistory[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadHistory: (athleteId: number) => Promise<void>;
    addManualHistory: (data: Omit<TournamentHistory, 'id' | 'is_auto_generated' | 'created_at'>) => Promise<void>;
    updateHistory: (id: number, data: Partial<Omit<TournamentHistory, 'id' | 'athlete_id' | 'is_auto_generated' | 'created_at'>>) => Promise<void>;
    deleteHistory: (id: number) => Promise<void>;
    clearHistory: () => void;
}

export const useTournamentHistoryStore = create<TournamentHistoryState>((set, get) => ({
    history: [],
    isLoading: false,
    error: null,

    loadHistory: async (athleteId: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await window.api.tournamentHistory.getByAthlete(athleteId);

            if (response.success && response.data) {
                set({ history: response.data, isLoading: false });
            } else {
                set({ error: response.error || 'Failed to load tournament history', isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load tournament history',
                isLoading: false
            });
        }
    },

    addManualHistory: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await window.api.tournamentHistory.addManual(data);

            if (response.success && response.data) {
                // Reload history to get the updated list
                await get().loadHistory(data.athlete_id);
            } else {
                set({ error: response.error || 'Failed to add tournament history', isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to add tournament history',
                isLoading: false
            });
        }
    },

    updateHistory: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await window.api.tournamentHistory.update(id, data);

            if (response.success) {
                // Find the athlete_id from current history to reload
                const entry = get().history.find(h => h.id === id);
                if (entry) {
                    await get().loadHistory(entry.athlete_id);
                }
            } else {
                set({ error: response.error || 'Failed to update tournament history', isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update tournament history',
                isLoading: false
            });
        }
    },

    deleteHistory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await window.api.tournamentHistory.delete(id);

            if (response.success) {
                // Find the athlete_id from current history to reload
                const entry = get().history.find(h => h.id === id);
                if (entry) {
                    await get().loadHistory(entry.athlete_id);
                }
            } else {
                set({ error: response.error || 'Failed to delete tournament history', isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete tournament history',
                isLoading: false
            });
        }
    },

    clearHistory: () => {
        set({ history: [], error: null, isLoading: false });
    },
}));
