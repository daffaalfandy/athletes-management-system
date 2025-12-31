# Tech-Spec: Technical Rank & Medal History (Story 1.4)

**Created:** 2025-12-31
**Status:** Draft

## Overview

### Problem Statement
Currently, the system only stores the *current* rank of an athlete. There is no historical record of when they were promoted or what medals they have won. Coaches need to track this progression over time to monitor development and eligibility.

### Solution
1.  **Database:** precise `promotions` and `medals` tables linked to `athletes`.
2.  **Logic:**
    - "Promotion" action: Inserts into `promotions` table AND updates `athletes.rank`.
    - "Add Medal" action: Inserts into `medals` table.
3.  **UI:**
    - Add a "History" section (Tab) to the Athlete details view (currently the Edit Modal).
    - specialized lists for "Rank History" and "Competition Record".

### Scope (In/Out)
**IN:**
- SQLite schema for `promotions` and `medals`.
- Zod schemas for validation.
- IPC Handlers for `addPromotion`, `getPromotions`, `addMedal`, `getMedals`.
- UI: "History" Tab in Athlete Edit Modal (Temporary home until Dossier Drawer in 1.6).
- Automatic Rank Analysis (adding a promotion updates the current rank).

**OUT:**
- "Dossier Drawer" (Story 1.6).
- Certificate Image Hosting (Story 1.5).
- Complex Graphs/Charts of progress.

## Context for Development

### Codebase Patterns
- **Database:** `better-sqlite3` with `src/main/database/repositories`.
- **IPC:** `src/main/ipc` handlers defined in `src/shared/ipc-channels.ts`.
- **State:** Extend `useAthleteStore` to fetch details on demand.

### Files to Reference
- `src/shared/types/domain.ts` (Rank Enum).
- `src/renderer/features/athletes/AthleteForm.tsx` (Will need tabs).
- `src/shared/schemas.ts` (Zod definitions).

## Implementation Plan

### Tasks

- [ ] **Task 1: Database & Backend**
    - Create `promotions` table (id, athlete_id, rank, date, notes).
    - Create `medals` table (id, athlete_id, tournament, date, medal_type, category).
    - Implement `HistoryRepository` in `src/main/database/repositories/historyRepository.ts`.
    - Add IPC Handlers in `src/main/ipc/historyParams.ts`.

- [ ] **Task 2: Shared Types & Schemas**
    - Update `src/shared/domain.ts` with `Promotion` and `Medal` interfaces.
    - Update `src/shared/schemas.ts` with Zod validators.

- [ ] **Task 3: Frontend Store & Logic**
    - Update `useAthleteStore` to fetch history for a selected ID.
    - Implement `promoteAthlete(id, rank, date)` action.

- [ ] **Task 4: UI Implementation**
    - Update `AthleteForm.tsx` to include tabs: "Profile" and "History".
    - Build `Timeline` component for Rank History.
    - Build `MedalList` component for Competition Record.

### Acceptance Criteria

- [ ] **AC 1: Promotion Tracking**
    - When a coach adds a promotion (e.g., to Green Belt on 2025-01-01), it is saved.
    - The Athlete's "Current Rank" field updates to "Green" automatically.
    - Backdating is allowed.

- [ ] **AC 2: Medal Records**
    - Can add a medal (Gold, Silver, Bronze) with Tournament Name and Date.
    - List displays in reverse chronological order (newest first).

- [ ] **AC 3: Data Integrity**
    - Deleting an athlete deletes their history (Foreign Key Cascade).
    - Dates must be valid ISO strings.

## Additional Context

### Testing Strategy
- Seed data with an athlete having 3 past promotions.
- Verify the "Current Rank" matches the latest promotion.
