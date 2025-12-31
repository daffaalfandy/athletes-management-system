// Shared type definitions for IPC communication

export interface IElectronAPI {
    ping: () => Promise<string>;
}

declare global {
    interface Window {
        api: IElectronAPI;
    }
}
