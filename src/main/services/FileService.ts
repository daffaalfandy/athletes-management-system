
import { dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const VAULT_DIR_NAME = 'dossier';

export const FileService = {
    async selectImageFile(): Promise<string | null> {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
            ]
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    },

    async validateFileSize(filePath: string): Promise<boolean> {
        try {
            const stats = await fs.promises.stat(filePath);
            const MAX_SIZE_BYTES = 1048576; // 1MB
            return stats.size <= MAX_SIZE_BYTES;
        } catch (error) {
            console.error('[FileService] Error validating file size:', error);
            throw new Error('Failed to validate file size');
        }
    },

    getVaultPath(): string {
        return path.join(app.getPath('userData'), VAULT_DIR_NAME);
    },

    async ensureVaultDirectories() {
        const vaultPath = this.getVaultPath();
        const subdirs = ['profiles', 'certificates', 'medals', 'clubs', 'branding'];

        try {
            if (!fs.existsSync(vaultPath)) {
                await fs.promises.mkdir(vaultPath, { recursive: true });
            }

            for (const subdir of subdirs) {
                const subdirPath = path.join(vaultPath, subdir);
                if (!fs.existsSync(subdirPath)) {
                    await fs.promises.mkdir(subdirPath, { recursive: true });
                }
            }
        } catch (error) {
            console.error('[FileService] Error ensuring vault directories:', error);
            throw new Error('Failed to initialize document vault');
        }
    },

    async copyToVault(sourcePath: string, type: 'profiles' | 'certificates' | 'medals' | 'clubs' | 'branding', recordId: number | string): Promise<string> {
        try {
            await this.ensureVaultDirectories();

            const ext = path.extname(sourcePath).toLowerCase();
            const fileName = `${recordId}${ext}`;
            const relativePath = path.join(type, fileName); // relative path for DB
            const absoluteDestPath = path.join(this.getVaultPath(), relativePath);

            // For branding, delete any existing logo first (singleton replacement)
            if (type === 'branding') {
                const brandingDir = path.join(this.getVaultPath(), 'branding');
                if (fs.existsSync(brandingDir)) {
                    const existingFiles = await fs.promises.readdir(brandingDir);
                    for (const file of existingFiles) {
                        if (file.startsWith('logo.')) {
                            await fs.promises.unlink(path.join(brandingDir, file));
                        }
                    }
                }
            }

            await fs.promises.copyFile(sourcePath, absoluteDestPath);

            return relativePath;
        } catch (error) {
            console.error('[FileService] Error copying file to vault:', error);
            throw new Error('Failed to save file to vault');
        }
    },

    async getImagePath(type: 'profiles' | 'certificates' | 'medals', recordId: number): Promise<string | null> {
        // This is tricky. We need to find the file with any supported extension.
        // OR we rely on the DB storing the full relative path including extension.
        // The Tech Spec says: "Store relative paths from vault root (e.g., profiles/42.jpg)"
        // So this method might just be resolving the absolute path from the relative path stored in DB.
        // But the UI might request it by ID.
        // Let's implement resolving a relative path to a protocol URL or absolute path.

        // Actually, the Plan says: "Implement getImagePath(type, recordId): Retrieve file path"
        // But if the DB stores the path, we might just need a way to resolve that to a viewable URL.
        // Let's stick to the interface: input relativePath, output absolutePath.
        return null; // Placeholder, logic depends on how we want to retrieve.
    },

    async downloadFile(relativePath: string, defaultName?: string): Promise<boolean> {
        try {
            const vaultPath = this.getVaultPath();
            // Prevent directory traversal
            const safeRelative = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
            const sourcePath = path.join(vaultPath, safeRelative);

            if (!fs.existsSync(sourcePath)) {
                throw new Error('File not found');
            }

            const { filePath } = await dialog.showSaveDialog({
                defaultPath: defaultName || path.basename(sourcePath),
                properties: ['createDirectory', 'showOverwriteConfirmation']
            });

            if (filePath) {
                await fs.promises.copyFile(sourcePath, filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[FileService] Error downloading file:', error);
            throw error;
        }
    },

    async deleteFile(relativePath: string): Promise<boolean> {
        try {
            const vaultPath = this.getVaultPath();
            const safeRelative = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
            const targetPath = path.join(vaultPath, safeRelative);

            if (fs.existsSync(targetPath)) {
                await fs.promises.unlink(targetPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[FileService] Error deleting file:', error);
            // Don't throw for deletion errors, just return false
            return false;
        }
    }
};

export const setupFileHandlers = () => {
    const { ipcMain } = require('electron');

    ipcMain.handle('files:selectImage', async () => {
        return await FileService.selectImageFile();
    });

    ipcMain.handle('files:uploadToVault', async (_: any, sourcePath: string, type: 'profiles' | 'certificates' | 'medals' | 'clubs' | 'branding', recordId: number | string) => {
        const isValid = await FileService.validateFileSize(sourcePath);
        if (!isValid) {
            throw new Error('File is too large (max 1MB)');
        }
        return await FileService.copyToVault(sourcePath, type, recordId);
    });

    ipcMain.handle('files:getImagePath', async (_: any, relativePath: string) => {
        // Return absolute path
        return path.join(FileService.getVaultPath(), relativePath);
    });

    ipcMain.handle('files:downloadVaultFile', async (_: any, relativePath: string, defaultName?: string) => {
        return await FileService.downloadFile(relativePath, defaultName);
    });
};
