import { Migration } from '../services/MigrationService';

export const extendedAthleteProfileMigration: Migration = {
    version: 3,
    name: 'Extended Athlete Profile',
    up: (db) => {
        // Add new profile fields and official document paths
        // Note: SQLite doesn't support adding UNIQUE columns via ALTER TABLE
        db.exec(`
            ALTER TABLE athletes ADD COLUMN member_id TEXT;
            ALTER TABLE athletes ADD COLUMN first_joined_date TEXT;
            ALTER TABLE athletes ADD COLUMN school_name TEXT;
            ALTER TABLE athletes ADD COLUMN nisn TEXT;
            ALTER TABLE athletes ADD COLUMN nik TEXT;
            ALTER TABLE athletes ADD COLUMN kk_document_path TEXT;
            ALTER TABLE athletes ADD COLUMN ktp_kia_document_path TEXT;
            ALTER TABLE athletes ADD COLUMN birth_cert_document_path TEXT;
        `);

        // Create indexes for searchable fields (including UNIQUE index for member_id)
        db.exec(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_athletes_member_id ON athletes(member_id);
            CREATE INDEX IF NOT EXISTS idx_athletes_nisn ON athletes(nisn);
            CREATE INDEX IF NOT EXISTS idx_athletes_nik ON athletes(nik);
        `);
    }
};
