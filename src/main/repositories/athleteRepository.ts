import { getDatabase } from '../db';
import { Athlete } from '../../shared/schemas';

export const athleteRepository = {


  create: (athlete: Athlete): Athlete => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO athletes (name, birthDate, gender, weight, rank, clubId, profile_photo_path, birth_place, region, address, phone, email, parent_guardian, parent_phone)
      VALUES (@name, @birthDate, @gender, @weight, @rank, @clubId, @profile_photo_path, @birth_place, @region, @address, @phone, @email, @parent_guardian, @parent_phone)
    `);
    const safeAthlete = {
      ...athlete,
      clubId: athlete.clubId ?? null,
      profile_photo_path: athlete.profile_photo_path || null,
      birth_place: athlete.birth_place || '',
      region: athlete.region || '',
      address: athlete.address || '',
      phone: athlete.phone || '',
      email: athlete.email || '',
      parent_guardian: athlete.parent_guardian || '',
      parent_phone: athlete.parent_phone || '',
    };
    const info = stmt.run(safeAthlete);
    return { ...athlete, id: Number(info.lastInsertRowid) };
  },

  findAll: (): Athlete[] => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM athletes ORDER BY name ASC');
    return stmt.all() as Athlete[];
  },

  findByIds: (ids: number[]): Athlete[] => {
    if (ids.length === 0) return [];
    // Validate all IDs are numbers to prevent SQL injection
    const validIds = ids.filter(id => typeof id === 'number' && !isNaN(id) && id > 0);
    if (validIds.length === 0) return [];

    const db = getDatabase();
    const placeholders = validIds.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM athletes WHERE id IN (${placeholders})`);
    return stmt.all(...validIds) as Athlete[];
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
          profile_photo_path = @profile_photo_path,
          birth_place = @birth_place,
          region = @region,
          address = @address,
          phone = @phone,
          email = @email,
          parent_guardian = @parent_guardian,
          parent_phone = @parent_phone,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    const safeAthlete = {
      ...athlete,
      clubId: athlete.clubId ?? null,
      profile_photo_path: athlete.profile_photo_path || null,
      birth_place: athlete.birth_place || '',
      region: athlete.region || '',
      address: athlete.address || '',
      phone: athlete.phone || '',
      email: athlete.email || '',
      parent_guardian: athlete.parent_guardian || '',
      parent_phone: athlete.parent_phone || '',
    };
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
