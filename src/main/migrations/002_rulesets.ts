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
        min_age INTEGER NOT NULL,
        max_age INTEGER NOT NULL,
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
        INSERT INTO age_categories (ruleset_id, name, min_age, max_age, gender)
        VALUES (@ruleset_id, @name, @min_age, @max_age, @gender)
      `);

      const info = insertRuleset.run({
        name: 'IJF Standard 2025',
        description: 'Standard International Judo Federation rules for 2025',
        is_active: 1
      });
      const rulesetId = info.lastInsertRowid;

      const categories = [
        // Males - Age ranges based on age as of January 1st
        { name: 'U-15 Cadets (M)', min_age: 13, max_age: 14, gender: 'M' },
        { name: 'U-18 Cadets (M)', min_age: 15, max_age: 17, gender: 'M' },
        { name: 'U-21 Juniors (M)', min_age: 18, max_age: 20, gender: 'M' },
        { name: 'Seniors (M)', min_age: 21, max_age: 125, gender: 'M' },
        // Females - Age ranges based on age as of January 1st
        { name: 'U-15 Cadets (F)', min_age: 13, max_age: 14, gender: 'F' },
        { name: 'U-18 Cadets (F)', min_age: 15, max_age: 17, gender: 'F' },
        { name: 'U-21 Juniors (F)', min_age: 18, max_age: 20, gender: 'F' },
        { name: 'Seniors (F)', min_age: 21, max_age: 125, gender: 'F' },
      ];

      for (const cat of categories) {
        insertCategory.run({ ...cat, ruleset_id: rulesetId });
      }
    }
  }
};
