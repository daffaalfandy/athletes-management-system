// Shared type definitions for IPC communication

import { Athlete, Promotion, Medal } from '../schemas';

export interface IElectronAPI {
    ping: () => Promise<string>;
    athletes: {
        create: (data: unknown) => Promise<Athlete>;
        getAll: () => Promise<Athlete[]>;
        update: (data: unknown) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
    };
    history: {
        addPromotion: (data: unknown) => Promise<Promotion>;
        getPromotions: (athleteId: number) => Promise<Promotion[]>;
        addMedal: (data: unknown) => Promise<Medal>;
        getMedals: (athleteId: number) => Promise<Medal[]>;
    };
}

declare global {
    interface Window {
        api: IElectronAPI;
    }
}
