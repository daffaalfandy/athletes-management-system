import { getDatabase } from '../db';
import { Athlete } from '../../shared/schemas';

export const athleteRepository = {


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
