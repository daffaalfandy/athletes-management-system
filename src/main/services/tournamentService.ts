import { ipcMain } from 'electron';
import { TournamentRepository } from '../repositories/tournamentRepository';
import { TournamentRosterRepository } from '../repositories/tournamentRosterRepository';
import { TournamentSchema, TournamentRosterEntrySchema } from '../../shared/schemas';
import { getDatabase } from '../db';

let tournamentRepository: TournamentRepository;
let tournamentRosterRepository: TournamentRosterRepository;

export function setupTournamentHandlers() {
    const db = getDatabase();
    tournamentRepository = new TournamentRepository(db);
    tournamentRosterRepository = new TournamentRosterRepository(db);

    // Create tournament
    ipcMain.handle('tournaments:create', async (_, data) => {
        try {
            const validated = TournamentSchema.parse(data);
            return tournamentRepository.create(validated);
        } catch (error) {
            console.error('Error creating tournament:', error);
            throw error;
        }
    });

    // Get all tournaments
    ipcMain.handle('tournaments:getAll', async () => {
        try {
            return tournamentRepository.findAll();
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw error;
        }
    });

    // Get tournament by ID
    ipcMain.handle('tournaments:getById', async (_, id: number) => {
        try {
            return tournamentRepository.findById(id);
        } catch (error) {
            console.error('Error fetching tournament:', error);
            throw error;
        }
    });

    // Update tournament
    ipcMain.handle('tournaments:update', async (_, data) => {
        try {
            const { id, ...updateData } = data;
            if (!id) throw new Error('Tournament ID is required');
            return tournamentRepository.update(id, updateData);
        } catch (error) {
            console.error('Error updating tournament:', error);
            throw error;
        }
    });

    // Delete tournament
    ipcMain.handle('tournaments:delete', async (_, id: number) => {
        try {
            return tournamentRepository.delete(id);
        } catch (error) {
            console.error('Error deleting tournament:', error);
            throw error;
        }
    });

    // Save roster
    ipcMain.handle('tournaments:saveRoster', async (_, tournamentId: number, entries) => {
        try {
            // Validate entries
            entries.forEach((entry: any) => {
                if (!entry.athleteId || !entry.weightClass) {
                    throw new Error('Invalid roster entry: athleteId and weightClass are required');
                }
            });

            tournamentRosterRepository.saveRoster(tournamentId, entries);
        } catch (error) {
            console.error('Error saving roster:', error);
            throw error;
        }
    });

    // Get roster
    ipcMain.handle('tournaments:getRoster', async (_, tournamentId: number) => {
        try {
            return tournamentRosterRepository.getRoster(tournamentId);
        } catch (error) {
            console.error('Error fetching roster:', error);
            throw error;
        }
    });
}
