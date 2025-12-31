import { ipcMain } from 'electron';
import { rulesetRepository } from '../repositories/rulesetRepository';
import { RulesetSchema } from '../../shared/schemas';
import { z } from 'zod';

export function setupRulesetHandlers() {
    ipcMain.handle('rulesets:getAll', async () => {
        return rulesetRepository.getAll();
    });

    ipcMain.handle('rulesets:getById', async (_, id) => {
        const validatedId = z.number().parse(id);
        return rulesetRepository.getById(validatedId);
    });

    ipcMain.handle('rulesets:create', async (_, data) => {
        const validated = RulesetSchema.parse(data);
        return rulesetRepository.create(validated);
    });

    ipcMain.handle('rulesets:update', async (_, data) => {
        // The update method in repository takes (id, data).
        // The call from preload passes `data` as a single object (which probably should contain id or be {id, ...data}).
        // But `data` passed here is matching what is expected by repo.
        // Wait, repository update signature is (id: number, data: Ruleset).
        // Usually, in simplified IPC, we pass an object like { id, ...data }.
        // Let's assume data has `id`.

        // I need to extract ID from data and parse the rest as Ruleset.
        // But RulesetSchema has id optional.

        // Let's assume the frontend calls update({ id, ...data }).
        // I need to validate safely.

        const schemaWithId = RulesetSchema.extend({ id: z.number() });
        const validated = schemaWithId.parse(data);
        const { id, ...rest } = validated;

        // We can pass `validated` (which includes id) to update, but repo update expects (id, data).
        return rulesetRepository.update(id, validated);
    });

    ipcMain.handle('rulesets:delete', async (_, id) => {
        const validatedId = z.number().parse(id);
        return rulesetRepository.delete(validatedId);
    });

    ipcMain.handle('rulesets:setActive', async (_, id) => {
        const validatedId = z.number().parse(id);
        return rulesetRepository.setActive(validatedId);
    });
}
