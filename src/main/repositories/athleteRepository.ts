import { getDatabase } from '../db';
import { Athlete } from '../../shared/schemas';
import { FileService } from '../services/FileService';
import { generateMemberId } from '../utils/memberIdGenerator';

export const athleteRepository = {


  create: (athlete: Athlete): Athlete => {
    const db = getDatabase();

    // Generate member ID before insert
    const memberId = generateMemberId(athlete.clubId ?? null);

    const stmt = db.prepare(`
      INSERT INTO athletes (
        name, birthDate, gender, weight, rank, clubId, profile_photo_path, 
        birth_place, region, address, phone, email, parent_guardian, parent_phone, activity_status,
        member_id, first_joined_date, school_name, nisn, nik,
        kk_document_path, ktp_kia_document_path, birth_cert_document_path
      )
      VALUES (
        @name, @birthDate, @gender, @weight, @rank, @clubId, @profile_photo_path,
        @birth_place, @region, @address, @phone, @email, @parent_guardian, @parent_phone, @activity_status,
        @member_id, @first_joined_date, @school_name, @nisn, @nik,
        @kk_document_path, @ktp_kia_document_path, @birth_cert_document_path
      )
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
      activity_status: athlete.activity_status || 'Constant',
      member_id: memberId,
      first_joined_date: athlete.first_joined_date || null,
      school_name: athlete.school_name || null,
      nisn: (athlete.nisn && athlete.nisn.trim() !== '') ? athlete.nisn : null,
      nik: (athlete.nik && athlete.nik.trim() !== '') ? athlete.nik : null,
      kk_document_path: athlete.kk_document_path || null,
      ktp_kia_document_path: athlete.ktp_kia_document_path || null,
      birth_cert_document_path: athlete.birth_cert_document_path || null,
    };
    const info = stmt.run(safeAthlete);
    return { ...athlete, id: Number(info.lastInsertRowid), member_id: memberId };
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

    // Get old file paths before updating (profile photo + 3 documents)
    const old = db.prepare(`
      SELECT profile_photo_path, kk_document_path, ktp_kia_document_path, birth_cert_document_path 
      FROM athletes 
      WHERE id = ?
    `).get(athlete.id) as {
      profile_photo_path: string | null;
      kk_document_path: string | null;
      ktp_kia_document_path: string | null;
      birth_cert_document_path: string | null;
    } | undefined;

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
          activity_status = @activity_status,
          first_joined_date = @first_joined_date,
          school_name = @school_name,
          nisn = @nisn,
          nik = @nik,
          kk_document_path = @kk_document_path,
          ktp_kia_document_path = @ktp_kia_document_path,
          birth_cert_document_path = @birth_cert_document_path,
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
      activity_status: athlete.activity_status || 'Constant',
      first_joined_date: athlete.first_joined_date || null,
      school_name: athlete.school_name || null,
      nisn: (athlete.nisn && athlete.nisn.trim() !== '') ? athlete.nisn : null,
      nik: (athlete.nik && athlete.nik.trim() !== '') ? athlete.nik : null,
      kk_document_path: athlete.kk_document_path || null,
      ktp_kia_document_path: athlete.ktp_kia_document_path || null,
      birth_cert_document_path: athlete.birth_cert_document_path || null,
    };
    const info = stmt.run(safeAthlete);

    // Queue cleanup of old files if they were replaced with different ones
    if (info.changes > 0 && old) {
      // Profile photo cleanup
      if (old.profile_photo_path && athlete.profile_photo_path && old.profile_photo_path !== athlete.profile_photo_path) {
        FileService.queueFileCleanup(old.profile_photo_path);
      }

      // Document cleanups
      if (old.kk_document_path && athlete.kk_document_path && old.kk_document_path !== athlete.kk_document_path) {
        FileService.queueFileCleanup(old.kk_document_path);
      }
      if (old.ktp_kia_document_path && athlete.ktp_kia_document_path && old.ktp_kia_document_path !== athlete.ktp_kia_document_path) {
        FileService.queueFileCleanup(old.ktp_kia_document_path);
      }
      if (old.birth_cert_document_path && athlete.birth_cert_document_path && old.birth_cert_document_path !== athlete.birth_cert_document_path) {
        FileService.queueFileCleanup(old.birth_cert_document_path);
      }
    }

    return info.changes > 0;
  },

  delete: (id: number): boolean => {
    const db = getDatabase();

    // Get athlete data to find all associated files before deletion
    const athlete = db.prepare(`
      SELECT profile_photo_path, kk_document_path, ktp_kia_document_path, birth_cert_document_path 
      FROM athletes 
      WHERE id = ?
    `).get(id) as {
      profile_photo_path: string | null;
      kk_document_path: string | null;
      ktp_kia_document_path: string | null;
      birth_cert_document_path: string | null;
    } | undefined;

    // Delete the database record
    const stmt = db.prepare('DELETE FROM athletes WHERE id = ?');
    const info = stmt.run(id);

    // Queue cleanup of all files if deletion was successful
    if (info.changes > 0 && athlete) {
      FileService.queueFileCleanup(athlete.profile_photo_path);
      FileService.queueFileCleanup(athlete.kk_document_path);
      FileService.queueFileCleanup(athlete.ktp_kia_document_path);
      FileService.queueFileCleanup(athlete.birth_cert_document_path);
    }

    return info.changes > 0;
  },

  getStatistics: (): {
    totalPool: number;
    competitivePool: number;
    maleCount: number;
    femaleCount: number;
  } => {
    const db = getDatabase();

    const totalPool = db.prepare('SELECT COUNT(*) as count FROM athletes').get() as { count: number };

    const competitivePool = db.prepare(`
      SELECT COUNT(*) as count 
      FROM athletes 
      WHERE activity_status IN ('Constant', 'Intermittent')
    `).get() as { count: number };

    const maleCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM athletes 
      WHERE gender = 'male'
    `).get() as { count: number };

    const femaleCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM athletes 
      WHERE gender = 'female'
    `).get() as { count: number };

    return {
      totalPool: totalPool.count,
      competitivePool: competitivePool.count,
      maleCount: maleCount.count,
      femaleCount: femaleCount.count,
    };
  }
};
