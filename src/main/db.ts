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
        db.pragma('journal_mode = WAL');

        // Enable Foreign Key support
        db.pragma('foreign_keys = ON');

        console.log('[DB] ✓ Database initialized successfully with WAL and Foreign Keys');

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

export function closeDatabase(): void {
    if (db) {
        console.log('[DB] Closing database connection');
        db.close();
        db = null;
        console.log('[DB] Database closed');
    }
}
