// Shared type definitions for IPC communication

import { Athlete, Promotion, Medal, Ruleset } from '../schemas';

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
        deletePromotion: (id: number) => Promise<boolean>;
        addMedal: (data: unknown) => Promise<Medal>;
        getMedals: (athleteId: number) => Promise<Medal[]>;
        deleteMedal: (id: number) => Promise<boolean>;
    };
    system: {
        backupDatabase: () => Promise<{ success: boolean; data?: string; error?: string }>;
        restoreDatabase: () => Promise<{ success: boolean; error?: string }>;
    };
    rulesets: {
        getAll: () => Promise<Ruleset[]>;
        getById: (id: number) => Promise<Ruleset | undefined>;
        create: (data: unknown) => Promise<Ruleset>;
        update: (data: unknown) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
        setActive: (id: number) => Promise<boolean>;
    };
    files: {
        selectImage: () => Promise<string | null>;
        uploadToVault: (sourcePath: string, type: 'profiles' | 'certificates' | 'medals', recordId: number) => Promise<string>;
        getImagePath: (relativePath: string) => Promise<string>;
        downloadVaultFile: (relativePath: string, defaultName?: string) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        api: IElectronAPI;
    }
}
