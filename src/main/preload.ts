import { contextBridge, ipcRenderer } from 'electron';
import type { IElectronAPI } from '../shared/types/electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: IElectronAPI = {
    ping: () => ipcRenderer.invoke('ping'),
    athletes: {
        create: (data) => ipcRenderer.invoke('athletes:create', data),
        getAll: () => ipcRenderer.invoke('athletes:getAll'),
        update: (data) => ipcRenderer.invoke('athletes:update', data),
        delete: (id) => ipcRenderer.invoke('athletes:delete', id),
    },
};

contextBridge.exposeInMainWorld('api', api);
