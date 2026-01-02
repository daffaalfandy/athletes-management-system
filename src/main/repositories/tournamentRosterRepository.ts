import Database from 'better-sqlite3';
import { TournamentRosterEntry } from '../../shared/schemas';

export class TournamentRosterRepository {
    constructor(private db: Database.Database) { }

    addAthlete(tournamentId: number, athleteId: number, weightClass: string): void {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO tournament_rosters (tournament_id, athlete_id, weight_class)
            VALUES (?, ?, ?)
        `);

        stmt.run(tournamentId, athleteId, weightClass);
    }

    removeAthlete(tournamentId: number, athleteId: number): boolean {
        const stmt = this.db.prepare(`
            DELETE FROM tournament_rosters
            WHERE tournament_id = ? AND athlete_id = ?
        `);

        const info = stmt.run(tournamentId, athleteId);
        return info.changes > 0;
    }

    getRoster(tournamentId: number): TournamentRosterEntry[] {
        const stmt = this.db.prepare(`
            SELECT * FROM tournament_rosters
            WHERE tournament_id = ?
            ORDER BY added_at ASC
        `);

        return stmt.all(tournamentId) as TournamentRosterEntry[];
    }

    clearRoster(tournamentId: number): boolean {
        const stmt = this.db.prepare(`
            DELETE FROM tournament_rosters
            WHERE tournament_id = ?
        `);

        const info = stmt.run(tournamentId);
        return info.changes > 0;
    }

    saveRoster(tournamentId: number, entries: Array<{ athleteId: number; weightClass: string }>): void {
        const transaction = this.db.transaction(() => {
            // Clear existing roster
            this.clearRoster(tournamentId);

            // Insert new entries
            const stmt = this.db.prepare(`
                INSERT INTO tournament_rosters (tournament_id, athlete_id, weight_class)
                VALUES (?, ?, ?)
            `);

            for (const entry of entries) {
                stmt.run(tournamentId, entry.athleteId, entry.weightClass);
            }
        });

        transaction();
    }
}
