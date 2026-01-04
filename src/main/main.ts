import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import * as path from 'path';
import started from 'electron-squirrel-startup';
import { initializeDatabase } from './db';
import { MigrationService } from './services/MigrationService';
import { migrations } from './migrations';
import { setupAthleteHandlers } from './services/athleteService';
import { athleteRepository } from './repositories/athleteRepository';
import { historyRepository } from './repositories/historyRepository';
import { setupHistoryHandlers } from './services/historyService';
import { setupBackupHandlers } from './services/BackupService';
import { setupRulesetHandlers } from './services/rulesetService';
import { setupFileHandlers } from './services/FileService';
import { setupTournamentHandlers } from './services/tournamentService';
import { setupClubHandlers } from './services/clubService';
import { setupExportHandlers } from './services/ExportService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    console.log('[MAIN] App is ready, initializing database...');

    // Story 1.6: Register 'dossier' protocol for secure local file access
    protocol.handle('dossier', (request) => {
        const url = request.url.replace('dossier://', '');
        const vaultPath = path.join(app.getPath('userData'), 'dossier');
        const filePath = path.join(vaultPath, decodeURIComponent(url));
        return net.fetch('file://' + filePath);
    });

    try {
        const db = initializeDatabase();

        // Initialize and run migrations
        const migrationService = new MigrationService(db);
        migrationService.register(migrations);
        migrationService.runMigrations();

        console.log('[MAIN] Database initialization completed');
    } catch (error) {
        console.error('[MAIN] Database initialization failed:', error);
    }

    // Setup IPC handlers
    ipcMain.handle('ping', () => 'pong');
    setupAthleteHandlers();
    setupHistoryHandlers();
    setupBackupHandlers();
    setupRulesetHandlers();
    setupFileHandlers();
    setupTournamentHandlers();
    setupClubHandlers();
    setupExportHandlers();

    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
