import { getDatabase } from '../db';
import { Promotion, Medal } from '../../shared/schemas';

export const historyRepository = {
    initTable: () => {
        const db = getDatabase();
        db.exec(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                rank TEXT NOT NULL,
                date TEXT NOT NULL,
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS medals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athleteId INTEGER NOT NULL,
                tournament TEXT NOT NULL,
                date TEXT NOT NULL,
                medal TEXT NOT NULL,
                category TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_promotions_athleteId ON promotions(athleteId);
            CREATE INDEX IF NOT EXISTS idx_medals_athleteId ON medals(athleteId);
        `);
    },

    addPromotion: (promotion: Promotion): Promotion => {
        const db = getDatabase();
        const insert = db.prepare(`
            INSERT INTO promotions (athleteId, rank, date, notes)
            VALUES (@athleteId, @rank, @date, @notes)
        `);

        const updateAthlete = db.prepare(`
            UPDATE athletes SET rank = @rank, updatedAt = CURRENT_TIMESTAMP WHERE id = @athleteId
        `);

        const transaction = db.transaction((data) => {
            const info = insert.run(data);
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

    addMedal: (medal: Medal): Medal => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO medals (athleteId, tournament, date, medal, category)
            VALUES (@athleteId, @tournament, @date, @medal, @category)
        `);
        const info = stmt.run(medal);
        return { ...medal, id: Number(info.lastInsertRowid) };
    },

    getMedals: (athleteId: number): Medal[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM medals WHERE athleteId = ? ORDER BY date DESC');
        return stmt.all(athleteId) as Medal[];
    }
};
