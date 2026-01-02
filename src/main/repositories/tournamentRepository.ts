import Database from 'better-sqlite3';
import { Tournament } from '../../shared/schemas';

export class TournamentRepository {
    constructor(private db: Database.Database) { }

    create(tournament: Omit<Tournament, 'id' | 'created_at'>): Tournament {
        const stmt = this.db.prepare(`
            INSERT INTO tournaments (name, date, location, ruleset_snapshot)
            VALUES (@name, @date, @location, @ruleset_snapshot)
        `);

        const info = stmt.run({
            name: tournament.name,
            date: tournament.date,
            location: tournament.location || null,
            ruleset_snapshot: tournament.ruleset_snapshot,
        });

        return {
            ...tournament,
            id: Number(info.lastInsertRowid),
        };
    }

    findAll(): Tournament[] {
        const stmt = this.db.prepare(`
            SELECT * FROM tournaments
            ORDER BY date DESC
        `);

        return stmt.all() as Tournament[];
    }

    findById(id: number): Tournament | undefined {
        const stmt = this.db.prepare(`
            SELECT * FROM tournaments
            WHERE id = ?
        `);

        return stmt.get(id) as Tournament | undefined;
    }

    update(id: number, data: Partial<Omit<Tournament, 'id' | 'created_at' | 'ruleset_snapshot'>>): boolean {
        const fields: string[] = [];
        const values: any = {};

        if (data.name !== undefined) {
            fields.push('name = @name');
            values.name = data.name;
        }
        if (data.date !== undefined) {
            fields.push('date = @date');
            values.date = data.date;
        }
        if (data.location !== undefined) {
            fields.push('location = @location');
            values.location = data.location;
        }

        if (fields.length === 0) return false;

        const stmt = this.db.prepare(`
            UPDATE tournaments
            SET ${fields.join(', ')}
            WHERE id = @id
        `);

        const info = stmt.run({ ...values, id });
        return info.changes > 0;
    }

    delete(id: number): boolean {
        const stmt = this.db.prepare('DELETE FROM tournaments WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
}
