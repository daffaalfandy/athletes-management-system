import { create } from 'zustand';
import { Athlete } from '../../../shared/schemas';

interface AthleteState {
    athletes: Athlete[];
    loading: boolean;
    error: string | null;
    loadAthletes: () => Promise<void>;
    addAthlete: (data: Omit<Athlete, 'id'>) => Promise<void>;
    deleteAthlete: (id: number) => Promise<void>;
}

export const useAthleteStore = create<AthleteState>((set) => ({
    athletes: [],
    loading: false,
    error: null,

    loadAthletes: async () => {
        set({ loading: true });
        try {
            const athletes = await window.api.athletes.getAll();
            set({ athletes, loading: false });
        } catch (err: unknown) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    addAthlete: async (data) => {
        try {
            const newAthlete = await window.api.athletes.create(data);
            set((state) => ({ athletes: [...state.athletes, newAthlete] }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },

    deleteAthlete: async (id) => {
        try {
            await window.api.athletes.delete(id);
            set((state) => ({
                athletes: state.athletes.filter((a) => a.id !== id),
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },
}));
