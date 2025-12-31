import Database from 'better-sqlite3';

export interface Migration {
    version: number;
    name: string;
    up: (db: Database.Database) => void;
}

export class MigrationService {
    private db: Database.Database;
    private migrations: Migration[];

    constructor(db: Database.Database) {
        this.db = db;
        this.migrations = [];
    }

    public register(migrations: Migration[]) {
        this.migrations.push(...migrations);
    }

    public getCurrentVersion(): number {
        const version = this.db.pragma('user_version', { simple: true });
        return version as number;
    }

    public runMigrations() {
        const currentVersion = this.getCurrentVersion();
        console.log(`[Migration] Current DB version: ${currentVersion}`);

        const pendingMigrations = this.migrations
            .filter(m => m.version > currentVersion)
            .sort((a, b) => a.version - b.version);

        if (pendingMigrations.length === 0) {
            console.log('[Migration] No pending migrations.');
            return;
        }

        console.log(`[Migration] Found ${pendingMigrations.length} pending migrations.`);

        for (const migration of pendingMigrations) {
            this.runMigration(migration);
        }
    }

    private runMigration(migration: Migration) {
        console.log(`[Migration] Running migration ${migration.version}: ${migration.name}...`);

        try {
            const runTransaction = this.db.transaction(() => {
                migration.up(this.db);
                this.db.pragma(`user_version = ${migration.version}`);
            });

            runTransaction();
            console.log(`[Migration] Migration ${migration.version} completed successfully.`);
        } catch (error) {
            console.error(`[Migration] Failed to run migration ${migration.version}: ${migration.name}`, error);
            throw error; // Stop further migrations
        }
    }
}
