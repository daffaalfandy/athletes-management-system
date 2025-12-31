import { Migration } from '../services/MigrationService';
import { initialSchemaMigration } from './001_initial_schema';

import { rulesetMigration } from './002_rulesets';

export const migrations: Migration[] = [
    initialSchemaMigration,
    rulesetMigration
];
