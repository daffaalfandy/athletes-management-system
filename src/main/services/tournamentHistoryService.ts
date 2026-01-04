import { ipcMain } from 'electron';
import { tournamentHistoryRepository } from '../repositories/tournamentHistoryRepository';
import { TournamentHistorySchema } from '../../shared/schemas';

export function setupTournamentHistoryHandlers() {
    /**
     * Get tournament history for an athlete
     */
    ipcMain.handle('tournamentHistory:getByAthlete', async (_, athleteId: number) => {
        try {
            const history = tournamentHistoryRepository.getHistoryByAthlete(athleteId);
            return { success: true, data: history };
        } catch (error) {
            console.error('Failed to get tournament history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get tournament history'
            };
        }
    });

    /**
     * Add manual tournament history entry
     */
    ipcMain.handle('tournamentHistory:addManual', async (_, data: unknown) => {
        try {
            // Validate input
            const validated = TournamentHistorySchema.omit({ id: true, is_auto_generated: true, created_at: true }).parse(data);

            // Add manual entry (is_auto_generated = false)
            const result = tournamentHistoryRepository.addHistory({
                ...validated,
                is_auto_generated: false,
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to add manual tournament history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add manual tournament history'
            };
        }
    });

    /**
     * Update manual tournament history entry
     */
    ipcMain.handle('tournamentHistory:update', async (_, id: number, data: unknown) => {
        try {
            // Validate input
            const validated = TournamentHistorySchema.partial().omit({ id: true, athlete_id: true, is_auto_generated: true, created_at: true }).parse(data);

            const success = tournamentHistoryRepository.updateHistory(id, validated);

            if (!success) {
                return {
                    success: false,
                    error: 'Failed to update history entry. It may not exist or is auto-generated.'
                };
            }

            return { success: true, data: success };
        } catch (error) {
            console.error('Failed to update tournament history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update tournament history'
            };
        }
    });

    /**
     * Delete manual tournament history entry
     */
    ipcMain.handle('tournamentHistory:delete', async (_, id: number) => {
        try {
            const success = tournamentHistoryRepository.deleteHistory(id);

            if (!success) {
                return {
                    success: false,
                    error: 'Failed to delete history entry. It may not exist or is auto-generated.'
                };
            }

            return { success: true, data: success };
        } catch (error) {
            console.error('Failed to delete tournament history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete tournament history'
            };
        }
    });
}
