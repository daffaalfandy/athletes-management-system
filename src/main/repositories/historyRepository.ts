import { getDatabase } from '../db';
import { Promotion, Medal } from '../../shared/schemas';
import { FileService } from '../services/FileService';

export const historyRepository = {


    addPromotion: (promotion: Promotion): Promotion => {
        const db = getDatabase();
        const insert = db.prepare(`
            INSERT INTO promotions (athleteId, rank, date, notes, proof_image_path)
            VALUES (@athleteId, @rank, @date, @notes, @proof_image_path)
        `);

        const updateAthlete = db.prepare(`
            UPDATE athletes SET rank = @rank, updatedAt = CURRENT_TIMESTAMP WHERE id = @athleteId
        `);

        const transaction = db.transaction((data) => {
            const info = insert.run({ ...data, proof_image_path: data.proof_image_path || null });
            updateAthlete.run({ rank: data.rank, athleteId: data.athleteId });
            return info;
        });

        const info = transaction(promotion);
        return { ...promotion, id: Number(info.lastInsertRowid) };
    },

    getPromotions: (athleteId: number): Promotion[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM promotions WHERE athleteId = ? ORDER BY date DESC');
        return stmt.all(athleteId) as Promotion[];
    },

    deletePromotion: (id: number): Promotion | undefined => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM promotions WHERE id = ? RETURNING *');
        const deleted = stmt.get(id) as Promotion | undefined;

        // Queue cleanup of proof image
        FileService.queueFileCleanup(deleted?.proof_image_path);

        return deleted;
    },

    addMedal: (medal: Medal): Medal => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO medals (athleteId, tournament_id, tournament, date, medal, category, proof_image_path)
            VALUES (@athleteId, @tournament_id, @tournament, @date, @medal, @category, @proof_image_path)
        `);
        const info = stmt.run({
            ...medal,
            tournament_id: medal.tournament_id || null,
            proof_image_path: medal.proof_image_path || null
        });
        return { ...medal, id: Number(info.lastInsertRowid) };
    },

    getMedals: (athleteId: number): Medal[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM medals WHERE athleteId = ? ORDER BY date DESC');
        return stmt.all(athleteId) as Medal[];
    },

    deleteMedal: (id: number): Medal | undefined => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM medals WHERE id = ? RETURNING *');
        const deleted = stmt.get(id) as Medal | undefined;

        // Queue cleanup of proof image
        FileService.queueFileCleanup(deleted?.proof_image_path);

        return deleted;
    },

    updatePromotionProof: (id: number, path: string): void => {
        const db = getDatabase();

        // Get old proof path before updating
        const old = db.prepare('SELECT proof_image_path FROM promotions WHERE id = ?').get(id) as { proof_image_path: string | null } | undefined;

        db.prepare('UPDATE promotions SET proof_image_path = ? WHERE id = ?').run(path, id);

        // Queue cleanup of old proof if it was replaced
        if (old?.proof_image_path && old.proof_image_path !== path) {
            FileService.queueFileCleanup(old.proof_image_path);
        }
    },

    updateMedalProof: (id: number, path: string): void => {
        const db = getDatabase();

        // Get old proof path before updating
        const old = db.prepare('SELECT proof_image_path FROM medals WHERE id = ?').get(id) as { proof_image_path: string | null } | undefined;

        db.prepare('UPDATE medals SET proof_image_path = ? WHERE id = ?').run(path, id);

        // Queue cleanup of old proof if it was replaced
        if (old?.proof_image_path && old.proof_image_path !== path) {
            FileService.queueFileCleanup(old.proof_image_path);
        }
    },

    getMedalCountsByYear: (year?: number): {
        gold: number;
        silver: number;
        bronze: number;
    } => {
        const db = getDatabase();

        let query = `
            SELECT 
                SUM(CASE WHEN medal = 'Gold' THEN 1 ELSE 0 END) as gold,
                SUM(CASE WHEN medal = 'Silver' THEN 1 ELSE 0 END) as silver,
                SUM(CASE WHEN medal = 'Bronze' THEN 1 ELSE 0 END) as bronze
            FROM medals
        `;

        if (year) {
            query += ` WHERE substr(date, 1, 4) = '${year}'`;
        }

        const result = db.prepare(query).get() as { gold: number | null; silver: number | null; bronze: number | null };

        return {
            gold: result.gold || 0,
            silver: result.silver || 0,
            bronze: result.bronze || 0,
        };
    },

    getAvailableMedalYears: (): number[] => {
        const db = getDatabase();

        const years = db.prepare(`
            SELECT DISTINCT substr(date, 1, 4) as year 
            FROM medals 
            ORDER BY year DESC
        `).all() as { year: string }[];

        return years.map(y => parseInt(y.year, 10)).filter(y => !isNaN(y));
    }
};
