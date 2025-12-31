import { Migration } from '../services/MigrationService';
import { initialSchemaMigration } from './001_initial_schema';

export const migrations: Migration[] = [
    initialSchemaMigration
];
