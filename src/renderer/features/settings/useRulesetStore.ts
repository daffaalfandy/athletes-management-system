import { create } from 'zustand';
import { Ruleset } from '../../../shared/schemas';

interface RulesetState {
    rulesets: Ruleset[];
    loading: boolean;
    error: string | null;

    loadRulesets: () => Promise<void>;
    addRuleset: (data: Ruleset) => Promise<void>;
    updateRuleset: (data: Ruleset) => Promise<void>;
    deleteRuleset: (id: number) => Promise<void>;
    setActiveRuleset: (id: number) => Promise<void>;
    getActiveRuleset: () => Ruleset | undefined;
}

export const useRulesetStore = create<RulesetState>((set, get) => ({
    rulesets: [],
    loading: false,
    error: null,

    getActiveRuleset: () => {
        return get().rulesets.find(r => r.is_active);
    },

    loadRulesets: async () => {
        set({ loading: true });
        try {
            const rulesets = await window.api.rulesets.getAll();
            set({ rulesets, loading: false });
        } catch (err: unknown) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    addRuleset: async (data) => {
        try {
            const newRuleset = await window.api.rulesets.create(data);
            set((state) => ({ rulesets: [newRuleset, ...state.rulesets] }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },

    updateRuleset: async (data) => {
        try {
            // Repos expects (id, data) but we pass the object which contains id
            await window.api.rulesets.update(data);
            set((state) => ({
                rulesets: state.rulesets.map((r) => (r.id === data.id ? data : r)),
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },

    deleteRuleset: async (id) => {
        try {
            await window.api.rulesets.delete(id);
            set((state) => ({
                rulesets: state.rulesets.filter((r) => r.id !== id),
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },

    setActiveRuleset: async (id) => {
        try {
            await window.api.rulesets.setActive(id);
            set((state) => ({
                rulesets: state.rulesets.map((r) => ({
                    ...r,
                    is_active: r.id === id
                })),
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message });
        }
    },
}));
