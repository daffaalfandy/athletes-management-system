import { ipcMain } from 'electron';
import { settingsRepository } from '../repositories/settingsRepository';

export const setupSettingsHandlers = () => {
    ipcMain.handle('settings:get', async (_: any, key: string) => {
        return settingsRepository.get(key);
    });

    ipcMain.handle('settings:set', async (_: any, key: string, value: string) => {
        return settingsRepository.set(key, value);
    });

    ipcMain.handle('settings:getAll', async () => {
        return settingsRepository.getAll();
    });
};
