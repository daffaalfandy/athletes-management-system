# Tech-Spec: Athlete Profile CRUD (Story 1.2)

**Created:** 2025-12-31
**Status:** Ready for Development

## Overview

### Problem Statement
We need to create the core "Athlete" entity in the database and provide a way for Coache's to manage this data. Currently, there is only an empty SQLite connection. We need to implement the full Create, Read, Update, Delete (CRUD) flow, including strictly typed IPC channels and Zod validation.

### Solution
1.  **Database:** Create `athletes` table in SQLite.
2.  **Validation:** Define `AthleteSchema` using Zod (shared).
3.  **Backend:** Implement `AthleteRepository` and IPC Handlers.
4.  **Frontend:** Create `AthleteForm` and `useAthleteList` hook (Zustand).

### Scope (In/Out)
**IN:**
- `athletes` table creation (migration/init).
- IPC Handlers: `createAthlete`, `getAthletes`, `updateAthlete`, `deleteAthlete`.
- Zod validation for inputs.
- Basic "Add Athlete" Modal/Form.

**OUT:**
- "High Density List" UI (Story 1.3).
- Rank History (Future Story).
- Certificate Attachments (Story 1.5).

## Context for Development

### Codebase Patterns
- **Repository Pattern:** All SQL in `src/main/repositories/athleteRepository.ts`.
- **Service Pattern:** IPC handlers in `src/main/services/athleteService.ts`.
- **Feature Structure:** All frontend code in `src/renderer/features/athletes`.

### Files to Reference
- `src/main/db.ts` (DB Connection).
- `src/shared/types/electron.d.ts` (Example IPC).
- `docs/planning-artifacts/epics.md` (FR1, FR2).

## Implementation Plan

### Tasks

- [x] **Task 1: Shared Types & Validation**
    - Create `src/shared/schemas.ts`: Define `AthleteSchema` (id, name, birthYear, gender, weight, rank, clubId).
    - Export `Athlete` type inferred from Zod.

- [x] **Task 2: Database Layer**
    - Create `src/main/repositories/athleteRepository.ts`.
    - Implement `initTable()`: `CREATE TABLE IF NOT EXISTS athletes ...`
    - Implement methods: `create`, `findAll`, `update`, `delete`.
    - Register table init in `src/main/db.ts`.

- [x] **Task 3: IPC & Main Process**
    - Create `src/main/ipc/athleteHandlers.ts`.
    - Validate inputs using Zod before calling Repository.
    - Register handlers in `src/main/main.ts` (`ipcMain.handle`).
    - Expose methods in `src/main/preload.ts` (`window.api.athletes.*`).

- [x] **Task 4: Frontend State & UI**
    - Update `src/renderer/features/athletes` structure.
    - Create `useAthleteStore` (Zustand) with actions calling `window.api`.
    - Create `AthleteForm.tsx` (React Hook Form + Zod Resolver).
    - Basic integration test on `App.tsx` (Add button).

### Acceptance Criteria

- [ ] **AC 1: Data Persistence**
    - Created athlete appears in `athletes` table in SQLite.
    - Data persists after app restart.

- [ ] **AC 2: Validation**
    - Cannot create athlete without Name or Birth Year.
    - Invalid types (e.g., string for weight) rejected by Main process (Zod).

- [ ] **AC 3: Type Safety**
    - `window.api.athletes.create` is fully typed in Renderer.
    - No `any` types in IPC definition.

## Additional Context

### Dependencies
- `better-sqlite3` (Existing)
- `zod` (Existing)
- `zustand` (Existing)
- `react-hook-form` (Install required)

### Testing Strategy
- Manual: Open DevTools, check `window.api` exposure.
- Manual: Create athlete, restart app, verify list loads.

## Review Notes
**Adversarial Review Completed:** 2025-12-31

**Findings:** 10 total (2 High, 4 Medium, 4 Low)

**Resolution:**
- **F1 [HIGH]**: Form reset data loss - ✅ Fixed (Async await added)
- **F2 [HIGH]**: Unsafe updates - ✅ Fixed (Specific Update Schema)
- **F3-F6 [MEDIUM]**: Schema/Arch issues - ✅ Fixed (Index added, Service moved, Unique constraint added)
- **F7-F10 [LOW]**: Minor polish - Skipped for now to focus on core features.

**Status:** Implementation Complete.
