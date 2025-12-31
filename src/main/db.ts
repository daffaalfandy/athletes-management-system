import Database from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import { DATABASE } from '../shared/constants';

let db: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
    if (db) {
        console.log('[DB] Database already initialized');
        return db;
    }

    try {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, DATABASE.NAME);

        console.log('[DB] Initializing database at:', dbPath);

        db = new Database(dbPath);

        // Enable WAL mode for better concurrency
        const walResult = db.pragma('journal_mode = WAL');
        console.log('[DB] WAL mode enabled:', walResult);

        console.log('[DB] ✓ Database initialized successfully');

        return db;
    } catch (error) {
        console.error('[DB] Failed to initialize database:', error);
        throw error;
    }
}

export function getDatabase(): Database.Database {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
