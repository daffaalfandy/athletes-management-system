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
    history: {
        addPromotion: (data) => ipcRenderer.invoke('history:addPromotion', data),
        getPromotions: (athleteId) => ipcRenderer.invoke('history:getPromotions', athleteId),
        addMedal: (data) => ipcRenderer.invoke('history:addMedal', data),
        getMedals: (athleteId) => ipcRenderer.invoke('history:getMedals', athleteId),
    },
    system: {
        backupDatabase: () => ipcRenderer.invoke('system:backupDatabase'),
        restoreDatabase: () => ipcRenderer.invoke('system:restoreDatabase'),
    },
    rulesets: {
        getAll: () => ipcRenderer.invoke('rulesets:getAll'),
        getById: (id) => ipcRenderer.invoke('rulesets:getById', id),
        create: (data) => ipcRenderer.invoke('rulesets:create', data),
        update: (data) => ipcRenderer.invoke('rulesets:update', data),
        delete: (id) => ipcRenderer.invoke('rulesets:delete', id),
        setActive: (id) => ipcRenderer.invoke('rulesets:setActive', id),
    },
    files: {
        selectImage: () => ipcRenderer.invoke('files:selectImage'),
        uploadToVault: (sourcePath, type, recordId) => ipcRenderer.invoke('files:uploadToVault', sourcePath, type, recordId),
        getImagePath: (relativePath) => ipcRenderer.invoke('files:getImagePath', relativePath),
        downloadVaultFile: (relativePath, defaultName) => ipcRenderer.invoke('files:downloadVaultFile', relativePath, defaultName),
    },
};

contextBridge.exposeInMainWorld('api', api);
