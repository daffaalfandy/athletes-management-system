# Tech-Spec: Story 1.6 Application Update Mechanism

**Created:** 2025-12-31
**Status:** Implementation Complete

## Overview

### Problem Statement
Currently, the application manages its database schema through ad-hoc `initTable` methods in individual repositories. This creates a risk during application updates: if a new version of the app expects a different database structure (e.g., new columns), the startup logic might fail or cause data inconsistency. Additionally, manual "install-over" updates need to guarantee that the user's data (the SQLite file) is preserved while the application binary is replaced.

### Solution
We will implement a robust **Schema Migration System** directly within the application main process. This system will:
1.  Track the current database version using SQLite's `PRAGMA user_version`.
2.  Execute ordered migration scripts to upgrade the database schema safely during startup.
3.  Ensure backward compatibility and data preservation during the update process.

### Scope (In/Out)
*   **In Scope**:
    *   Creation of a `MigrationService`.
    *   Refactoring existing `initTable` logic into the first initial migration (Release 1.0 baseline).
    *   Mechanism to run migrations on app startup before the window loads.
    *   Documentation validation that the standard installer update process preserves `userData`.
*   **Out of Scope**:
    *   Internet-based auto-update mechanism (updates are manual installer runs).
    *   Downgrade/Rollback migrations (forward-only for this iteration).

## Context for Development

### Codebase Patterns
*   **Persistence**: `better-sqlite3` is used in the main process (`src/main/db.ts`).
*   **Startup**: `src/main/main.ts` currently initializes the DB and calls individual repository init methods.
*   **Bundling**: The app uses Electron Forge + Vite. We must ensure migration logic works correctly within the bundled main process.

### Files to Reference
*   `src/main/db.ts`: Core database connection logic.
*   `src/main/main.ts`: Application entry point.
*   `package.json`: Dependency management.

### Technical Decisions
*   **`PRAGMA user_version`**: We will use this built-in SQLite feature to store the current integer version of the schema. It avoids the need for a separate `_migrations` table.
*   **Code-Based Migrations**: To avoid file-system complexity with bundlers (managing SQL files in `resources`), migrations will be defined as TypeScript functions in a specific registry. This ensures type safety and easy bundling.

## Implementation Plan

### Tasks

- [x] **Task 1: Design Migration Architecture**
    -   Create `src/main/services/MigrationService.ts`.
    -   Define the `Migration` interface: `{ version: number; name: string; up: (db: Database) => void; }`.

- [x] **Task 2: Implement Migration Logic**
    -   Implement `getCurrentVersion(db)` using `PRAGMA user_version`.
    -   Implement `runMigrations(db)`:
        -   Fetch current version.
        -   Filter migrations where `migration.version > currentVersion`.
        -   Sort by version ASC.
        -   Execute each `up()` function inside a transaction.
        -   Update `user_version` after each success.

- [x] **Task 3: Refactor Initial Schema (Baseline)**
    -   Create `src/main/migrations/001_initial_schema.ts`.
    -   Move the schema definition from `athleteRepository.ts` and `historyRepository.ts` into this migration.
    *   Remove `initTable` methods from repositories.

- [x] **Task 4: Integrate with Startup**
    -   Update `src/main/db.ts` or `src/main/main.ts` to execute `MigrationService.runMigrations()` immediately after database connection and before any other operations.

### Acceptance Criteria

- [ ] **AC 1: Schema Versioning**
    -   **Given** a fresh installation,
    -   **When** the app starts,
    -   **Then** the database `user_version` should match the latest migration number (e.g., 1).

- [ ] **AC 2: Data Preservation on Update**
    -   **Given** an existing installation with data (version X),
    -   **When** a new version of the app (version X+1) is installed and run,
    -   **Then** the existing data is preserved, AND new schema changes are applied automatically.

- [ ] **AC 3: Atomic Migrations**
    -   **Given** a migration fails halfway,
    -   **When** the app restarts,
    -   **Then** the database should remain in the previous valid state (transactional DDL), ensuring no partial corruption.

## Additional Context

### Testing Strategy
*   **Manual Update Test**:
    1.  Build version 1.0.0 (with Schema V1).
    2.  Add some data (Athletes).
    3.  Create a "dummy" V2 migration that adds a new table.
    4.  Build version 1.0.1.
    5.  Run the 1.0.1 binary against the existing V1 database.
    6.  Verify the new table exists and old data is still there.

### Notes
*   **Important**: Since SQLite DDL (CREATE TABLE) inside transactions is supported, we can wrap the entire migration in a transaction.

## Review Notes
- Adversarial review completed
- Findings: 2 total, 1 fixed (F1 - Manual Import of Migrations), 1 found invalid (F2 - Broken references)
- Resolution approach: Auto-fix

