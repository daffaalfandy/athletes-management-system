import { ipcMain, dialog, app } from 'electron';
import { getDatabase, closeDatabase, initializeDatabase } from '../db';
import path from 'path';
import { copyFile } from 'fs/promises';
import { DATABASE } from '../../shared/constants';

export function setupBackupHandlers() {
    ipcMain.handle('system:backupDatabase', async () => {
        try {
            const db = getDatabase();

            // Generate default filename with local date YYYY-MM-DD
            const now = new Date();
            const date = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            const defaultFilename = `judo_manager_backup_${date}.db`;

            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Backup Database',
                defaultPath: defaultFilename,
                filters: [
                    { name: 'SQLite Database', extensions: ['db', 'sqlite'] }
                ]
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Cancelled by user' };
            }

            // Perform backup
            await db.backup(filePath);

            return { success: true, data: filePath };
        } catch (error) {
            console.error('[Backup] Failed:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('system:restoreDatabase', async () => {
        try {
            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Import Database',
                properties: ['openFile'],
                filters: [
                    { name: 'SQLite Database', extensions: ['db', 'sqlite'] }
                ]
            });

            if (canceled || filePaths.length === 0) {
                return { success: false, error: 'Cancelled by user' };
            }

            const sourcePath = filePaths[0];
            const userDataPath = app.getPath('userData');
            const destPath = path.join(userDataPath, DATABASE.NAME);

            console.log(`[Restore] Restoring from ${sourcePath} to ${destPath}`);

            // 1. Close existing connection
            closeDatabase();

            // 2. Overwrite database file
            // Note: In WAL mode, we should ideally also clean up -shm and -wal files if they exist, 
            // but copyFile overwriting the main DB and better-sqlite3 handling reconstruction might be enough.
            // For safety, let's try to remove WAL/SHM if they exist or just rely on overwrite.
            // Actually, copying the *source* file to destination is what we want. 
            // If the source is a proper backup (VACUUMed into one file), it won't have WAL/SHM.
            // If we overwrite the main .db, better-sqlite3 will detect protocol mismatch if old WAL exists?
            // Safer to delete old files first.

            await copyFile(sourcePath, destPath);

            // Clean up potential left-over WAL files from previous session to avoid corruption
            // (Ignoring errors if they don't exist)
            const fs = require('fs'); // fallback for sync unlink if needed, but we use promises
            const { unlink } = require('fs/promises');
            try { await unlink(destPath + '-wal'); } catch (e) { }
            try { await unlink(destPath + '-shm'); } catch (e) { }

            // 3. Re-initialize
            initializeDatabase();

            console.log('[Restore] Database restored successfully');
            return { success: true };
        } catch (error) {
            console.error('[Restore] Failed:', error);
            // Attempt to re-init if restore failed, so app isn't broken
            try { initializeDatabase(); } catch (e) { console.error('Failed to recover DB connection', e); }
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
}
