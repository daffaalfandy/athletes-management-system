import { create } from 'zustand';
import { Athlete, Promotion, Medal } from '../../../shared/schemas';

interface AthleteState {
    athletes: Athlete[];
    loading: boolean;
    error: string | null;
    activePromotions: Promotion[];
    activeMedals: Medal[];

    loadAthletes: () => Promise<void>;
    addAthlete: (data: Omit<Athlete, 'id'>) => Promise<void>;
    updateAthlete: (data: Athlete) => Promise<void>;
    deleteAthlete: (id: number) => Promise<void>;

    loadHistory: (athleteId: number) => Promise<void>;
    addPromotion: (data: Omit<Promotion, 'id'>) => Promise<void>;
    addMedal: (data: Omit<Medal, 'id'>) => Promise<void>;
}

export const useAthleteStore = create<AthleteState>((set) => ({
    athletes: [],
    loading: false,
    error: null,
    activePromotions: [],
    activeMedals: [],

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

    updateAthlete: async (data) => {
        try {
            await window.api.athletes.update(data);
            set((state) => ({
                athletes: state.athletes.map((a) => (a.id === data.id ? data : a)),
            }));
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

    loadHistory: async (athleteId) => {
        set({ loading: true });
        try {
            const [promotions, medals] = await Promise.all([
                window.api.history.getPromotions(athleteId),
                window.api.history.getMedals(athleteId),
            ]);
            set({ activePromotions: promotions, activeMedals: medals, loading: false });
        } catch (err: unknown) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    addPromotion: async (data) => {
        try {
            const newPromotion = await window.api.history.addPromotion(data);
            set((state) => ({
                activePromotions: [newPromotion, ...state.activePromotions],
                athletes: state.athletes.map((a) =>
                    a.id === data.athleteId ? { ...a, rank: data.rank } : a
                ),
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },

    addMedal: async (data) => {
        try {
            const newMedal = await window.api.history.addMedal(data);
            set((state) => ({
                activeMedals: [newMedal, ...state.activeMedals],
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },
}));
