import { Migration } from '../services/MigrationService';

export const rulesetMigration: Migration = {
    version: 2,
    name: 'Rulesets and Age Categories',
    up: (db) => {
        // Rulesets Table
        db.exec(`
      CREATE TABLE IF NOT EXISTS rulesets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Age Categories Table
        db.exec(`
      CREATE TABLE IF NOT EXISTS age_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ruleset_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        min_year INTEGER NOT NULL,
        max_year INTEGER NOT NULL,
        gender TEXT CHECK(gender IN ('M', 'F', 'MIXED')) NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE
      );
    `);

        db.exec(`
      CREATE INDEX IF NOT EXISTS idx_age_categories_ruleset_id ON age_categories(ruleset_id);
    `);

        // Seed Data
        const count = db.prepare('SELECT COUNT(*) as count FROM rulesets').get() as { count: number };
        if (count.count === 0) {
            const insertRuleset = db.prepare(`
        INSERT INTO rulesets (name, description, is_active)
        VALUES (@name, @description, @is_active)
      `);

            const insertCategory = db.prepare(`
        INSERT INTO age_categories (ruleset_id, name, min_year, max_year, gender)
        VALUES (@ruleset_id, @name, @min_year, @max_year, @gender)
      `);

            const info = insertRuleset.run({
                name: 'IJF Standard 2025',
                description: 'Standard International Judo Federation rules for 2025 (Estimates)',
                is_active: 1
            });
            const rulesetId = info.lastInsertRowid;

            const categories = [
                // Males
                { name: 'U18 Cadets (M)', min_year: 2008, max_year: 2010, gender: 'M' },
                { name: 'U21 Juniors (M)', min_year: 2005, max_year: 2007, gender: 'M' },
                { name: 'Seniors (M)', min_year: 1900, max_year: 2004, gender: 'M' },
                // Females
                { name: 'U18 Cadets (F)', min_year: 2008, max_year: 2010, gender: 'F' },
                { name: 'U21 Juniors (F)', min_year: 2005, max_year: 2007, gender: 'F' },
                { name: 'Seniors (F)', min_year: 1900, max_year: 2004, gender: 'F' },
            ];

            for (const cat of categories) {
                insertCategory.run({ ...cat, ruleset_id: rulesetId });
            }
        }
    }
};
