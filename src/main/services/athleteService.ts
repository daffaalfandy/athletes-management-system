import { ipcMain } from 'electron';
import { athleteRepository } from '../repositories/athleteRepository';
import { AthleteSchema, AthleteUpdateSchema } from '../../shared/schemas';
import { z } from 'zod';

export function setupAthleteHandlers() {
    ipcMain.handle('athletes:create', async (_, data) => {
        const validated = AthleteSchema.parse(data);
        return athleteRepository.create(validated);
    });

    ipcMain.handle('athletes:getAll', async () => {
        return athleteRepository.findAll();
    });

    ipcMain.handle('athletes:update', async (_, data) => {
        const validated = AthleteUpdateSchema.parse(data);
        return athleteRepository.update(validated);
    });

    ipcMain.handle('athletes:delete', async (_, id) => {
        const validatedId = z.number().parse(id);
        return athleteRepository.delete(validatedId);
    });
}
