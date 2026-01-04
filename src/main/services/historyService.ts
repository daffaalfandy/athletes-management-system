
import { ipcMain } from 'electron';
import { historyRepository } from '../repositories/historyRepository';
import { PromotionSchema, MedalSchema } from '../../shared/schemas';
import { z } from 'zod';
import { FileService } from './FileService';

export function setupHistoryHandlers() {
    ipcMain.handle('history:addPromotion', async (_, data: any) => {
        const { tempFilePath, ...rest } = data;
        const validated = PromotionSchema.parse(rest);

        const newRecord = historyRepository.addPromotion(validated);

        if (tempFilePath && newRecord.id) {
            try {
                const isValid = await FileService.validateFileSize(tempFilePath);
                if (!isValid) throw new Error('File validation failed: File too large (max 1MB)');

                const vaultPath = await FileService.copyToVault(tempFilePath, 'certificates', newRecord.id);
                historyRepository.updatePromotionProof(newRecord.id, vaultPath);
                newRecord.proof_image_path = vaultPath;
            } catch (e) {
                console.error("Failed to upload promotion proof", e);
            }
        }
        return newRecord;
    });

    ipcMain.handle('history:getPromotions', async (_, athleteId) => {
        const id = z.number().parse(athleteId);
        return historyRepository.getPromotions(id);
    });

    ipcMain.handle('history:deletePromotion', async (_, id) => {
        const promotionId = z.number().parse(id);
        const deleted = historyRepository.deletePromotion(promotionId);

        if (deleted && deleted.proof_image_path) {
            await FileService.deleteFile(deleted.proof_image_path);
        }

        return !!deleted;
    });

    ipcMain.handle('history:addMedal', async (_, data: any) => {
        const { tempFilePath, ...rest } = data;
        const validated = MedalSchema.parse(rest);

        const newRecord = historyRepository.addMedal(validated);

        if (tempFilePath && newRecord.id) {
            try {
                const isValid = await FileService.validateFileSize(tempFilePath);
                if (!isValid) throw new Error('File validation failed: File too large (max 1MB)');

                const vaultPath = await FileService.copyToVault(tempFilePath, 'medals', newRecord.id);
                historyRepository.updateMedalProof(newRecord.id, vaultPath);
                newRecord.proof_image_path = vaultPath;
            } catch (e) {
                console.error("Failed to upload medal proof", e);
            }
        }
        return newRecord;
    });

    ipcMain.handle('history:getMedals', async (_, athleteId) => {
        const id = z.number().parse(athleteId);
        return historyRepository.getMedals(id);
    });

    ipcMain.handle('history:deleteMedal', async (_, id) => {
        const medalId = z.number().parse(id);
        const deleted = historyRepository.deleteMedal(medalId);

        if (deleted && deleted.proof_image_path) {
            await FileService.deleteFile(deleted.proof_image_path);
        }

        return !!deleted;
    });

    ipcMain.handle('history:getMedalCountsByYear', async (_, year?: number) => {
        try {
            const counts = historyRepository.getMedalCountsByYear(year);
            return { success: true, data: counts };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('history:getAvailableMedalYears', async () => {
        try {
            const years = historyRepository.getAvailableMedalYears();
            return { success: true, data: years };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
}
