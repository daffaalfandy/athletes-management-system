import { ipcMain } from 'electron';
import { clubRepository } from '../repositories/clubRepository';
import { ClubSchema } from '../../shared/schemas';
import { z } from 'zod';

export function setupClubHandlers() {
    ipcMain.handle('clubs:getAll', async () => {
        return clubRepository.getAll();
    });

    ipcMain.handle('clubs:getById', async (_, id) => {
        const validatedId = z.number().parse(id);
        return clubRepository.getById(validatedId);
    });

    ipcMain.handle('clubs:create', async (_, data) => {
        const validated = ClubSchema.parse(data);
        return clubRepository.create(validated);
    });

    ipcMain.handle('clubs:update', async (_, data) => {
        const schemaWithId = ClubSchema.extend({ id: z.number() });
        const validated = schemaWithId.parse(data);
        const { id, ...rest } = validated;
        return clubRepository.update(id, validated);
    });

    ipcMain.handle('clubs:delete', async (_, id) => {
        const validatedId = z.number().parse(id);
        try {
            return clubRepository.delete(validatedId);
        } catch (error: any) {
            throw new Error(error.message);
        }
    });
}
