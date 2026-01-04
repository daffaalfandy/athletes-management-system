import { getDatabase } from '../db';

export interface AppSetting {
    key: string;
    value: string;
}

export const settingsRepository = {
    get: (key: string): string | null => {
        const db = getDatabase();
        const result = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | undefined;
        return result?.value || null;
    },

    set: (key: string, value: string): boolean => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO app_settings (key, value)
            VALUES (@key, @value)
            ON CONFLICT(key) DO UPDATE SET value = @value
        `);
        const info = stmt.run({ key, value });
        return info.changes > 0;
    },

    getAll: (): Record<string, string> => {
        const db = getDatabase();
        const rows = db.prepare('SELECT key, value FROM app_settings').all() as AppSetting[];
        return rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as Record<string, string>);
    }
};
