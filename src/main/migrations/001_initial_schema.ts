import { Migration } from '../services/MigrationService';

export const initialSchemaMigration: Migration = {
    version: 1,
    name: 'Initial Schema',
    up: (db) => {
        // Athletes Table
        db.exec(`
          CREATE TABLE IF NOT EXISTS athletes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            birthDate TEXT NOT NULL,
            gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
            weight REAL NOT NULL,
            rank TEXT NOT NULL,
            clubId INTEGER,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_athlete_name_dob UNIQUE (name, birthDate)
          );
    
          CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
        `);

        // Promotions and Medals Tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                rank TEXT NOT NULL,
                date TEXT NOT NULL,
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS medals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                tournament TEXT NOT NULL,
                date TEXT NOT NULL,
                medal TEXT NOT NULL,
                category TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_promotions_athleteId ON promotions(athleteId);
            CREATE INDEX IF NOT EXISTS idx_medals_athleteId ON medals(athleteId);
        `);
    }
};
