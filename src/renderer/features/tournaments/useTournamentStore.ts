import { create } from 'zustand';
import { Tournament } from '../../../shared/schemas';

interface TournamentState {
    tournaments: Tournament[];
    loading: boolean;
    error: string | null;
    loadTournaments: () => Promise<void>;
    createTournament: (data: Tournament) => Promise<Tournament>;
    updateTournament: (data: Tournament & { id: number }) => Promise<void>;
    deleteTournament: (id: number) => Promise<void>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
    tournaments: [],
    loading: false,
    error: null,

    loadTournaments: async () => {
        set({ loading: true, error: null });
        try {
            const tournaments = await window.api.tournaments.getAll();
            set({ tournaments, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    createTournament: async (data: Tournament) => {
        set({ loading: true, error: null });
        try {
            const newTournament = await window.api.tournaments.create(data);
            set((state) => ({
                tournaments: [newTournament, ...state.tournaments],
                loading: false,
            }));
            return newTournament;
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    updateTournament: async (data: Tournament & { id: number }) => {
        set({ loading: true, error: null });
        try {
            await window.api.tournaments.update(data);
            set((state) => ({
                tournaments: state.tournaments.map((t) =>
                    t.id === data.id ? { ...t, ...data } : t
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteTournament: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await window.api.tournaments.delete(id);
            set((state) => ({
                tournaments: state.tournaments.filter((t) => t.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },
}));
