// Shared type definitions for IPC communication

import { Athlete, Promotion, Medal, Ruleset, Tournament, TournamentRosterEntry, Club } from '../schemas';

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
        uploadToVault: (sourcePath: string, type: 'profiles' | 'certificates' | 'medals' | 'clubs' | 'branding', recordId: number | string) => Promise<string>;
        getImagePath: (relativePath: string) => Promise<string>;
        downloadVaultFile: (relativePath: string, defaultName?: string) => Promise<boolean>;
    };
    settings: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        getAll: () => Promise<Record<string, string>>;
    };
    tournaments: {
        create: (data: Tournament) => Promise<Tournament>;
        getAll: () => Promise<Tournament[]>;
        getById: (id: number) => Promise<Tournament | undefined>;
        update: (data: Partial<Tournament> & { id: number }) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
        saveRoster: (tournamentId: number, entries: Array<{ athleteId: number; weightClass: string }>) => Promise<void>;
        getRoster: (tournamentId: number) => Promise<TournamentRosterEntry[]>;
    };
    clubs: {
        getAll: () => Promise<Club[]>;
        getById: (id: number) => Promise<Club | undefined>;
        create: (data: Club) => Promise<Club>;
        update: (data: Club & { id: number }) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
    };
    export: {
        generateRosterPDF: (
            tournamentId: number,
            options?: { includeColumns?: string[] }
        ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
        generateAthleteSummaryPDF: (
            athleteIds: number[]
        ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    };
}

declare global {
    interface Window {
        api: IElectronAPI;
    }
}
