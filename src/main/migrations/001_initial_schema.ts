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
            profile_photo_path TEXT,
            
            -- Detailed information fields for tournament registration
            birth_place TEXT,
            region TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            parent_guardian TEXT,
            parent_phone TEXT,
            
            -- Activity Status (Story 7.2)
            activity_status TEXT DEFAULT 'Constant' CHECK(activity_status IN ('Constant', 'Intermittent', 'Dormant')),
            
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_athlete_name_dob UNIQUE (name, birthDate)
          );
    
          CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
          CREATE INDEX IF NOT EXISTS idx_athletes_birth_place ON athletes(birth_place);
          CREATE INDEX IF NOT EXISTS idx_athletes_region ON athletes(region);
          CREATE INDEX IF NOT EXISTS idx_athletes_clubId ON athletes(clubId);
          CREATE INDEX IF NOT EXISTS idx_athletes_activity_status ON athletes(activity_status);
        `);

        // Clubs Table
        db.exec(`
          CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            logo_path TEXT,
            contact_person TEXT,
            contact_phone TEXT,
            contact_email TEXT,
            location TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
        `);

        // Promotions and Medals Tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                rank TEXT NOT NULL,
                date TEXT NOT NULL,
                notes TEXT,
                proof_image_path TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS medals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                tournament_id INTEGER,
                tournament TEXT NOT NULL,
                date TEXT NOT NULL,
                medal TEXT NOT NULL,
                category TEXT,
                proof_image_path TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE,
                FOREIGN KEY (tournament_id) REFERENCES tournament_history(id) ON DELETE SET NULL
            );
            
            CREATE INDEX IF NOT EXISTS idx_promotions_athleteId ON promotions(athleteId);
            CREATE INDEX IF NOT EXISTS idx_medals_athleteId ON medals(athleteId);
            CREATE INDEX IF NOT EXISTS idx_medals_tournament_id ON medals(tournament_id);
        `);

        // Tournaments Table
        db.exec(`
            CREATE TABLE IF NOT EXISTS tournaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                location TEXT,
                ruleset_snapshot TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
        `);

        // Tournament Rosters Table with Weight Class
        db.exec(`
            CREATE TABLE IF NOT EXISTS tournament_rosters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                athlete_id INTEGER NOT NULL,
                weight_class TEXT NOT NULL,
                added_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
                UNIQUE(tournament_id, athlete_id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_tournament_rosters_tournament ON tournament_rosters(tournament_id);
        `);

        // Tournament History Table
        db.exec(`
            CREATE TABLE IF NOT EXISTS tournament_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athlete_id INTEGER NOT NULL,
                tournament_id INTEGER,
                tournament_name TEXT NOT NULL,
                tournament_date TEXT NOT NULL,
                tournament_location TEXT,
                weight_class TEXT,
                age_category TEXT,
                is_auto_generated INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_tournament_history_athlete ON tournament_history(athlete_id);
            CREATE INDEX IF NOT EXISTS idx_tournament_history_tournament ON tournament_history(tournament_id);
            CREATE INDEX IF NOT EXISTS idx_tournament_history_date ON tournament_history(tournament_date);
        `);

        // App Settings Table - Key-Value store for system-wide configuration
        db.exec(`
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // Seed default branding settings
        const settingsCount = db.prepare('SELECT COUNT(*) as count FROM app_settings').get() as { count: number };
        if (settingsCount.count === 0) {
            const insertSetting = db.prepare(`
                INSERT INTO app_settings (key, value)
                VALUES (@key, @value)
            `);

            insertSetting.run({ key: 'kabupaten_name', value: 'Kabupaten Bantul' });
            insertSetting.run({ key: 'kabupaten_logo_path', value: '' });
        }
    }
};
