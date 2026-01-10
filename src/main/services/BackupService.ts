import { ipcMain, dialog, app } from 'electron';
import { getDatabase, closeDatabase, initializeDatabase } from '../db';
import path from 'path';
import { promises as fsPromises, createWriteStream, existsSync } from 'fs';
import { DATABASE } from '../../shared/constants';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import os from 'os';
import { FileService } from './FileService';

const BACKUP_ROLLBACK_DIR = 'judo-backup-rollback';

/**
 * Get the path to the database file
 */
function getDatabasePath(): string {
    return path.join(app.getPath('userData'), DATABASE.NAME);
}

/**
 * Get the path to the dossier vault
 */
function getVaultPath(): string {
    return FileService.getVaultPath();
}

/**
 * Generate a timestamped backup filename
 */
function generateBackupFilename(): string {
    const now = new Date();
    const date = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    return `backup-${date}.zip`;
}

/**
 * Validate that a ZIP file contains the required database file
 */
function validateZipStructure(zipPath: string): { valid: boolean; hasDatabase: boolean; hasDossier: boolean; isLegacyDb: boolean } {
    // Check if this is a legacy .db file (not a ZIP)
    const ext = path.extname(zipPath).toLowerCase();
    if (ext === '.db' || ext === '.sqlite') {
        return { valid: true, hasDatabase: true, hasDossier: false, isLegacyDb: true };
    }

    try {
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries();

        const hasDatabase = entries.some(e => e.entryName === DATABASE.NAME || e.entryName === `${DATABASE.NAME}`);
        const hasDossier = entries.some(e => e.entryName.startsWith('dossier/'));

        return {
            valid: hasDatabase,
            hasDatabase,
            hasDossier,
            isLegacyDb: false
        };
    } catch (error) {
        console.error('[Backup] Failed to validate ZIP structure:', error);
        return { valid: false, hasDatabase: false, hasDossier: false, isLegacyDb: false };
    }
}

/**
 * Create a rollback backup in the system temp directory
 */
async function createRollbackBackup(): Promise<string> {
    const rollbackDir = path.join(os.tmpdir(), BACKUP_ROLLBACK_DIR);

    // Clean up any existing rollback directory
    if (existsSync(rollbackDir)) {
        await fsPromises.rm(rollbackDir, { recursive: true, force: true });
    }
    await fsPromises.mkdir(rollbackDir, { recursive: true });

    const dbPath = getDatabasePath();
    const vaultPath = getVaultPath();

    // Copy database
    if (existsSync(dbPath)) {
        await fsPromises.copyFile(dbPath, path.join(rollbackDir, DATABASE.NAME));
    }

    // Copy WAL and SHM if they exist
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    if (existsSync(walPath)) {
        await fsPromises.copyFile(walPath, path.join(rollbackDir, DATABASE.NAME + '-wal'));
    }
    if (existsSync(shmPath)) {
        await fsPromises.copyFile(shmPath, path.join(rollbackDir, DATABASE.NAME + '-shm'));
    }

    // Copy dossier folder if it exists
    if (existsSync(vaultPath)) {
        await copyDirectory(vaultPath, path.join(rollbackDir, 'dossier'));
    }

    console.log('[Backup] Rollback backup created at:', rollbackDir);
    return rollbackDir;
}

/**
 * Recursively copy a directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
    await fsPromises.mkdir(dest, { recursive: true });
    const entries = await fsPromises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fsPromises.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Recursively delete a directory
 */
async function deleteDirectory(dirPath: string): Promise<void> {
    if (existsSync(dirPath)) {
        await fsPromises.rm(dirPath, { recursive: true, force: true });
    }
}

/**
 * Restore from rollback backup
 */
async function restoreFromRollback(rollbackDir: string): Promise<void> {
    console.log('[Backup] Restoring from rollback...');

    const dbPath = getDatabasePath();
    const vaultPath = getVaultPath();

    // Restore database
    const rollbackDbPath = path.join(rollbackDir, DATABASE.NAME);
    if (existsSync(rollbackDbPath)) {
        await fsPromises.copyFile(rollbackDbPath, dbPath);
    }

    // Restore WAL and SHM
    const rollbackWalPath = path.join(rollbackDir, DATABASE.NAME + '-wal');
    const rollbackShmPath = path.join(rollbackDir, DATABASE.NAME + '-shm');
    if (existsSync(rollbackWalPath)) {
        await fsPromises.copyFile(rollbackWalPath, dbPath + '-wal');
    }
    if (existsSync(rollbackShmPath)) {
        await fsPromises.copyFile(rollbackShmPath, dbPath + '-shm');
    }

    // Restore dossier folder
    const rollbackVaultPath = path.join(rollbackDir, 'dossier');
    if (existsSync(rollbackVaultPath)) {
        // Delete current vault first
        if (existsSync(vaultPath)) {
            await deleteDirectory(vaultPath);
        }
        await copyDirectory(rollbackVaultPath, vaultPath);
    }

    console.log('[Backup] Rollback restore complete');
}

/**
 * Clean up rollback backup
 */
async function cleanupRollback(rollbackDir: string): Promise<void> {
    try {
        await deleteDirectory(rollbackDir);
        console.log('[Backup] Rollback cleanup complete');
    } catch (error) {
        console.error('[Backup] Failed to cleanup rollback:', error);
        // Non-fatal - ignore cleanup errors
    }
}

/**
 * Clean up WAL and SHM files
 */
async function cleanupWalFiles(): Promise<void> {
    const dbPath = getDatabasePath();
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';

    try {
        if (existsSync(walPath)) {
            await fsPromises.unlink(walPath);
        }
    } catch (e) {
        console.warn('[Backup] Failed to delete WAL file:', e);
    }

    try {
        if (existsSync(shmPath)) {
            await fsPromises.unlink(shmPath);
        }
    } catch (e) {
        console.warn('[Backup] Failed to delete SHM file:', e);
    }
}

/**
 * Create a comprehensive backup ZIP containing database and all attachments
 */
async function createBackupZip(destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(destPath);
        const archive = archiver('zip', { zlib: { level: 5 } });

        output.on('close', () => {
            console.log(`[Backup] ZIP created: ${archive.pointer()} bytes`);
            resolve();
        });

        output.on('error', (err) => {
            reject(err);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        const dbPath = getDatabasePath();
        const vaultPath = getVaultPath();

        // Add database file
        if (existsSync(dbPath)) {
            archive.file(dbPath, { name: DATABASE.NAME });
        }

        // Add dossier folder (if it exists)
        if (existsSync(vaultPath)) {
            archive.directory(vaultPath, 'dossier');
        }

        archive.finalize();
    });
}

/**
 * Extract a backup ZIP to the userData directory
 */
async function extractBackupZip(zipPath: string, userDataPath: string): Promise<void> {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(userDataPath, true); // overwrite = true
    console.log('[Backup] ZIP extracted to:', userDataPath);
}

/**
 * Handle legacy .db file import
 */
async function importLegacyDatabase(sourcePath: string): Promise<void> {
    const destPath = getDatabasePath();
    await fsPromises.copyFile(sourcePath, destPath);
    console.log('[Backup] Legacy database imported');
}

/**
 * Restart the application
 */
function restartApp(): void {
    console.log('[Backup] Restarting application...');
    app.relaunch();
    app.quit();
}

export function setupBackupHandlers() {
    ipcMain.handle('system:backupDatabase', async () => {
        try {
            const db = getDatabase();

            // Generate default filename with timestamp
            const defaultFilename = generateBackupFilename();

            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Create Backup',
                defaultPath: defaultFilename,
                filters: [
                    { name: 'Backup Archive', extensions: ['zip'] }
                ]
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Cancelled by user' };
            }

            // Ensure .zip extension
            let finalPath = filePath;
            if (!finalPath.toLowerCase().endsWith('.zip')) {
                finalPath += '.zip';
            }

            // Before creating ZIP, checkpoint the database to ensure WAL is flushed
            try {
                db.pragma('wal_checkpoint(TRUNCATE)');
            } catch (e) {
                console.warn('[Backup] WAL checkpoint failed (non-fatal):', e);
            }

            // Create the backup ZIP
            await createBackupZip(finalPath);

            return { success: true, data: finalPath };
        } catch (error) {
            console.error('[Backup] Failed:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('system:restoreDatabase', async () => {
        let rollbackDir: string | null = null;

        try {
            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Restore from Backup',
                properties: ['openFile'],
                filters: [
                    { name: 'Backup Archive', extensions: ['zip'] },
                    { name: 'Legacy Database', extensions: ['db', 'sqlite'] }
                ]
            });

            if (canceled || filePaths.length === 0) {
                return { success: false, error: 'Cancelled by user' };
            }

            const sourcePath = filePaths[0];
            const userDataPath = app.getPath('userData');

            // Validate the backup file
            const validation = validateZipStructure(sourcePath);

            if (!validation.valid) {
                return { success: false, error: 'Invalid backup file: database not found' };
            }

            console.log(`[Restore] Restoring from ${sourcePath}`);
            console.log(`[Restore] Validation: isLegacy=${validation.isLegacyDb}, hasDatabase=${validation.hasDatabase}, hasDossier=${validation.hasDossier}`);

            // Step 1: Create rollback backup
            rollbackDir = await createRollbackBackup();

            // Step 2: Close database connection
            closeDatabase();

            try {
                // Step 3: Handle import based on file type
                if (validation.isLegacyDb) {
                    // Legacy .db file import
                    await importLegacyDatabase(sourcePath);
                } else {
                    // ZIP import
                    const vaultPath = getVaultPath();

                    // Delete existing dossier folder before extraction (if ZIP has dossier)
                    if (validation.hasDossier && existsSync(vaultPath)) {
                        await deleteDirectory(vaultPath);
                    }

                    // Extract ZIP contents
                    await extractBackupZip(sourcePath, userDataPath);
                }

                // Step 4: Clean up WAL/SHM files
                await cleanupWalFiles();

                // Step 5: Clean up rollback (success path)
                await cleanupRollback(rollbackDir);
                rollbackDir = null;

                console.log('[Restore] Restore successful, restarting app...');

                // Step 6: Restart the application
                // Use a short delay to ensure the IPC response is sent
                setTimeout(() => {
                    restartApp();
                }, 500);

                return { success: true };
            } catch (extractError) {
                // Extraction failed - restore from rollback
                console.error('[Restore] Extraction failed:', extractError);

                if (rollbackDir) {
                    try {
                        await restoreFromRollback(rollbackDir);
                        await cleanupRollback(rollbackDir);
                    } catch (rollbackError) {
                        console.error('[Restore] Rollback restore failed:', rollbackError);
                    }
                }

                // Re-initialize database connection
                try {
                    initializeDatabase();
                } catch (e) {
                    console.error('[Restore] Failed to reinitialize database:', e);
                }

                throw extractError;
            }
        } catch (error) {
            console.error('[Restore] Failed:', error);

            // Attempt to re-init if restore failed, so app isn't broken
            try {
                initializeDatabase();
            } catch (e) {
                console.error('[Restore] Failed to recover DB connection', e);
            }

            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
}
