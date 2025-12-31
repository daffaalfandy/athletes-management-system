import { getDatabase } from '../db';
import { Athlete } from '../../shared/schemas';

export const athleteRepository = {
    initTable: () => {
        const db = getDatabase();
        db.exec(`
      CREATE TABLE IF NOT EXISTS athletes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthYear INTEGER NOT NULL,
        gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
        weight REAL NOT NULL,
        rank TEXT NOT NULL,
        clubId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_athlete_name_year UNIQUE (name, birthYear)
        -- Foreign Key for clubId will be enforced when Clubs table exists
        -- FOREIGN KEY (clubId) REFERENCES clubs(id)
      );

      CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
    `);
    },

    create: (athlete: Athlete): Athlete => {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT INTO athletes (name, birthYear, gender, weight, rank, clubId)
      VALUES (@name, @birthYear, @gender, @weight, @rank, @clubId)
    `);
        const info = stmt.run(athlete);
        return { ...athlete, id: Number(info.lastInsertRowid) };
    },

    findAll: (): Athlete[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM athletes ORDER BY name ASC');
        return stmt.all() as Athlete[];
    },

    update: (athlete: Athlete): boolean => {
        const db = getDatabase();
        const stmt = db.prepare(`
      UPDATE athletes
      SET name = @name,
          birthYear = @birthYear,
          gender = @gender,
          weight = @weight,
          rank = @rank,
          clubId = @clubId,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
        const info = stmt.run(athlete);
        return info.changes > 0;
    },

    delete: (id: number): boolean => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM athletes WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};
