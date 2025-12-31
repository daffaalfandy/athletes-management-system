import { ipcMain } from 'electron';
import { historyRepository } from '../repositories/historyRepository';
import { PromotionSchema, MedalSchema } from '../../shared/schemas';
import { z } from 'zod';

export function setupHistoryHandlers() {
    ipcMain.handle('history:addPromotion', async (_, data) => {
        const validated = PromotionSchema.parse(data);
        return historyRepository.addPromotion(validated);
    });

    ipcMain.handle('history:getPromotions', async (_, athleteId) => {
        const id = z.number().parse(athleteId);
        return historyRepository.getPromotions(id);
    });

    ipcMain.handle('history:addMedal', async (_, data) => {
        const validated = MedalSchema.parse(data);
        return historyRepository.addMedal(validated);
    });

    ipcMain.handle('history:getMedals', async (_, athleteId) => {
        const id = z.number().parse(athleteId);
        return historyRepository.getMedals(id);
    });
}
