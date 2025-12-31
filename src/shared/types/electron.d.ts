// Shared type definitions for IPC communication

import { Athlete } from '../schemas';

export interface IElectronAPI {
    ping: () => Promise<string>;
    athletes: {
        create: (data: unknown) => Promise<Athlete>;
        getAll: () => Promise<Athlete[]>;
        update: (data: unknown) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        api: IElectronAPI;
    }
}
