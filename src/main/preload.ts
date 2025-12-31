import { contextBridge, ipcRenderer } from 'electron';
import type { IElectronAPI } from '../shared/types/electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: IElectronAPI = {
    ping: () => ipcRenderer.invoke('ping'),
};

contextBridge.exposeInMainWorld('api', api);
