import { getDatabase } from '../db';
import { Club } from '../../shared/schemas';

export const clubRepository = {
    getAll: (): Club[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM clubs ORDER BY name ASC');
        return stmt.all() as Club[];
    },

    getById: (id: number): Club | undefined => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM clubs WHERE id = ?').get(id) as Club | undefined;
    },

    create: (data: Club): Club => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO clubs (name, logo_path, contact_person, contact_phone, contact_email, location)
            VALUES (@name, @logo_path, @contact_person, @contact_phone, @contact_email, @location)
        `);
        const info = stmt.run({
            name: data.name,
            logo_path: data.logo_path || null,
            contact_person: data.contact_person || null,
            contact_phone: data.contact_phone || null,
            contact_email: data.contact_email || null,
            location: data.location || null,
        });
        const newId = Number(info.lastInsertRowid);
        return clubRepository.getById(newId)!;
    },

    update: (id: number, data: Club): boolean => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE clubs 
            SET name = @name, 
                logo_path = @logo_path, 
                contact_person = @contact_person,
                contact_phone = @contact_phone,
                contact_email = @contact_email,
                location = @location,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `);
        const info = stmt.run({
            id,
            name: data.name,
            logo_path: data.logo_path || null,
            contact_person: data.contact_person || null,
            contact_phone: data.contact_phone || null,
            contact_email: data.contact_email || null,
            location: data.location || null,
        });
        return info.changes > 0;
    },

    delete: (id: number): boolean => {
        const db = getDatabase();
        // Check if any athletes are assigned to this club
        const athleteCount = db.prepare('SELECT COUNT(*) as count FROM athletes WHERE clubId = ?').get(id) as { count: number };
        if (athleteCount.count > 0) {
            throw new Error(`Cannot delete club: ${athleteCount.count} athlete(s) are assigned to this club`);
        }
        const info = db.prepare('DELETE FROM clubs WHERE id = ?').run(id);
        return info.changes > 0;
    },
};
