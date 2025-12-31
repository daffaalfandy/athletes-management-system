import { getDatabase } from '../db';
import { Athlete } from '../../shared/schemas';

export const athleteRepository = {
    initTable: () => {
        const db = getDatabase();

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
    },

    create: (athlete: Athlete): Athlete => {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT INTO athletes (name, birthDate, gender, weight, rank, clubId)
      VALUES (@name, @birthDate, @gender, @weight, @rank, @clubId)
    `);
        const safeAthlete = { ...athlete, clubId: athlete.clubId ?? null };
        const info = stmt.run(safeAthlete);
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
          birthDate = @birthDate,
          gender = @gender,
          weight = @weight,
          rank = @rank,
          clubId = @clubId,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
        const safeAthlete = { ...athlete, clubId: athlete.clubId ?? null };
        const info = stmt.run(safeAthlete);
        return info.changes > 0;
    },

    delete: (id: number): boolean => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM athletes WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};
