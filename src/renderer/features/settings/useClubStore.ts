import { create } from 'zustand';
import { Club } from '../../../shared/schemas';

interface ClubState {
    clubs: Club[];
    clubsVersion: number;
    loading: boolean;
    error: string | null;

    loadClubs: () => Promise<void>;
    addClub: (data: Club) => Promise<Club>;
    updateClub: (data: Club) => Promise<void>;
    deleteClub: (id: number) => Promise<void>;
}

export const useClubStore = create<ClubState>((set, get) => ({
    clubs: [],
    clubsVersion: Date.now(),
    loading: false,
    error: null,

    loadClubs: async () => {
        set({ loading: true });
        try {
            const clubs = await window.api.clubs.getAll();
            set({ clubs, loading: false });
        } catch (err: unknown) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    addClub: async (data) => {
        try {
            const newClub = await window.api.clubs.create(data);
            set((state) => ({
                clubs: [newClub, ...state.clubs],
                clubsVersion: Date.now()
            }));
            return newClub;
        } catch (err: unknown) {
            set({ error: (err as Error).message });
            throw err;
        }
    },

    updateClub: async (data) => {
        try {
            await window.api.clubs.update(data as Club & { id: number });
            set((state) => ({
                clubs: state.clubs.map((c) => (c.id === data.id ? data : c)),
                clubsVersion: Date.now()
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
            throw err;
        }
    },

    deleteClub: async (id) => {
        try {
            await window.api.clubs.delete(id);
            set((state) => ({
                clubs: state.clubs.filter((c) => c.id !== id),
                clubsVersion: Date.now()
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
            throw err;
        }
    },
}));
