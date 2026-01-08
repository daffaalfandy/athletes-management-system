import { Migration } from '../services/MigrationService';
import { initialSchemaMigration } from './001_initial_schema';
import { rulesetMigration } from './002_rulesets';
import { extendedAthleteProfileMigration } from './003_extended_athlete_profile';

export const migrations: Migration[] = [
    initialSchemaMigration,
    rulesetMigration,
    extendedAthleteProfileMigration
];

