import { getDatabase } from '../db';
import { Ruleset, AgeCategory } from '../../shared/schemas';

export const rulesetRepository = {
    getAll: (): Ruleset[] => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM rulesets ORDER BY created_at DESC');
        const rows = stmt.all() as any[];
        return rows.map(row => ({
            ...row,
            is_active: !!row.is_active
        }));
    },

    getById: (id: number): Ruleset | undefined => {
        const db = getDatabase();
        const ruleset = db.prepare('SELECT * FROM rulesets WHERE id = ?').get(id) as any;
        if (!ruleset) return undefined;

        const categories = db.prepare('SELECT * FROM age_categories WHERE ruleset_id = ?').all(id) as AgeCategory[];

        return {
            ...ruleset,
            is_active: !!ruleset.is_active,
            categories
        };
    },

    create: (data: Ruleset): Ruleset => {
        const db = getDatabase();

        const insertTransaction = db.transaction((ruleset: Ruleset) => {
            const insertRuleset = db.prepare(`
                INSERT INTO rulesets (name, description, is_active)
                VALUES (@name, @description, @is_active)
            `);

            const info = insertRuleset.run({
                name: ruleset.name,
                description: ruleset.description,
                is_active: ruleset.is_active ? 1 : 0
            });
            const newId = Number(info.lastInsertRowid);

            if (ruleset.categories && ruleset.categories.length > 0) {
                const insertCategory = db.prepare(`
                    INSERT INTO age_categories (ruleset_id, name, min_year, max_year, gender)
                    VALUES (@ruleset_id, @name, @min_year, @max_year, @gender)
                `);

                for (const cat of ruleset.categories) {
                    insertCategory.run({ ...cat, ruleset_id: newId });
                }
            }
            return newId;
        });

        const newId = insertTransaction(data);
        return rulesetRepository.getById(newId)!;
    },

    update: (id: number, data: Ruleset): boolean => {
        const db = getDatabase();
        const updateTransaction = db.transaction((ruleset: Ruleset) => {
            const updateRuleset = db.prepare(`
                 UPDATE rulesets 
                 SET name = @name, description = @description, updated_at = CURRENT_TIMESTAMP
                 WHERE id = @id
             `);

            updateRuleset.run({
                id,
                name: ruleset.name,
                description: ruleset.description
            });

            if (ruleset.categories) {
                db.prepare('DELETE FROM age_categories WHERE ruleset_id = ?').run(id);
                const insertCategory = db.prepare(`
                    INSERT INTO age_categories (ruleset_id, name, min_year, max_year, gender)
                    VALUES (@ruleset_id, @name, @min_year, @max_year, @gender)
                `);
                for (const cat of ruleset.categories) {
                    insertCategory.run({ ...cat, ruleset_id: id });
                }
            }
        });

        updateTransaction(data);
        return true;
    },

    delete: (id: number): boolean => {
        const db = getDatabase();
        const info = db.prepare('DELETE FROM rulesets WHERE id = ?').run(id);
        return info.changes > 0;
    },

    setActive: (id: number): boolean => {
        const db = getDatabase();
        const transaction = db.transaction(() => {
            db.prepare('UPDATE rulesets SET is_active = 0').run();
            db.prepare('UPDATE rulesets SET is_active = 1 WHERE id = ?').run(id);
        });
        transaction();
        return true;
    }
};
