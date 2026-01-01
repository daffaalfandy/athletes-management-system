import { getDatabase } from '../db';
import { Promotion, Medal } from '../../shared/schemas';

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
        return stmt.get(id) as Promotion | undefined;
    },

    addMedal: (medal: Medal): Medal => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO medals (athleteId, tournament, date, medal, category, proof_image_path)
            VALUES (@athleteId, @tournament, @date, @medal, @category, @proof_image_path)
        `);
        const info = stmt.run({ ...medal, proof_image_path: medal.proof_image_path || null });
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
        return stmt.get(id) as Medal | undefined;
    },

    updatePromotionProof: (id: number, path: string): void => {
        const db = getDatabase();
        db.prepare('UPDATE promotions SET proof_image_path = ? WHERE id = ?').run(path, id);
    },

    updateMedalProof: (id: number, path: string): void => {
        const db = getDatabase();
        db.prepare('UPDATE medals SET proof_image_path = ? WHERE id = ?').run(path, id);
    }
};
