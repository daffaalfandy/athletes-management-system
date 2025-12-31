# Tech-Spec: Rank & Medal History (Story 2.4)

**Created:** 2025-12-31
**Status:** Completed

## Overview

### Problem Statement
Coaches currently lack a historical record of an athlete's progression. The system tracks the *current* rank but forgets when promotions occurred. There is also no structured way to record competitive achievements (medals) linked to specific tournaments and dates. This data is critical for monitoring development and verifying eligibility for advanced categories.

### Status: Completed
**Implementation:** Implemented with `Rank` and `Medal` entities. Includes a `ProofPreview` component for future proof image viewing.

### Solution
We need to implement the "History" tab in the Athlete Profile. This involves:
1.  **Database:** New tables for `promotions` (Rank History) and `medals` (Competition History).
2.  **UI:** A chronological timeline for ranks and a list view for medals.
3.  **State:** Integrating these with the `useAthleteStore`.
4.  **UX Enhancement:** A `ProofPreview` component (currently a high-fidelity placeholder) allows users to click on "Proof" items, preparing the UI for future integration with **Story 4.2 (Certificate Preview)**.
5.  **Rank Timeline**: A chronological log of belt promotions. Adding a promotion automatically updates the athlete's current rank to maintain consistency.
6.  **Medal Cabinet**: A record of tournament results (Gold, Silver, Bronze) with dates and categories.
7.  **Data Integrity**: Backend enforcement using an ACID-compliant transaction to ensure the 'Current Rank' always matches the latest promotion.

### Scope (In/Out)
**IN:**
- SQLite schema for `promotions` and `medals` tables.
- Backend Repositories (`HistoryRepository`) and Services.
- IPC Handlers (`history:*`) for secure frontend access.
- Frontend Store integration (`useAthleteStore`) to fetch/update history.
- UI Components: `Timeline` (Rank History) and `MedalList` (Competition Record).
- Automatic updates to the parent `Athlete` record when a promotion is added.

**OUT:**
- "Dossier" features (file attachments).
- Complex analytics or graphs of medal counts.
- Public sharing or export of history (covered in Export stories).

## Context for Development

### Codebase Patterns
- **Architecture**: Electron (Main) + React (Renderer) with IPC Bridge.
- **State Management**: `zustand` store (`useAthleteStore`).
- **Persistence**: `better-sqlite3` with WAL mode.
- **Validation**: `zod` schemas shared between front/back.

### Files to Reference
- `src/main/migrations/001_initial_schema.ts`: Database schema definitions.
- `src/main/repositories/historyRepository.ts`: CRUD operations.
- `src/renderer/features/athletes/history/Timeline.tsx`: UI for promotions.
- `src/renderer/features/athletes/AthleteForm.tsx`: Container component.

### Technical Decisions
- **Transaction**: The `addPromotion` operation MUST be a transaction. It inserts the promotion record AND updates the `athletes.rank` field in one go to prevent state drift.
- **Lazy Loading**: History data is fetched only when the "History" tab is activated to keep the main list view fast (`loadHistory(id)`).
- **Date Handling**: All dates stored as ISO strings (`YYYY-MM-DD`) for SQLite compatibility.

## Implementation Plan

### Tasks

- [x] **Task 1: Verify & Finalize Database Layer**
    - [x] Confirm `promotions` and `medals` tables exist in `001_initial_schema.ts`.
    - [x] Verify `historyRepository.ts` implements transactional `addPromotion`.
    - [x] Verify `addMedal` logic.

- [x] **Task 2: IPC & Backend Wiring**
    - [x] Ensure `historyService.ts` correctly registers IPC handlers.
    - [x] Verify `preload.ts` exposes `api.history.{addPromotion, getPromotions, ...}`.
    - [x] Validate Zod schema parsing in main process handlers.

- [x] **Task 3: Frontend Store Integration**
    - [x] Review `useAthleteStore.ts` `loadHistory` to ensure it fetches both promotions and medals.
    - [x] Ensure `addPromotion` in store optimistically updates the local athlete list's rank.

- [x] **Task 4: UI Functional Completion**
    - [x] **Timeline Component**: Ensure "Promote" form works, handles loading states, and resets correctly.
    - [x] **MedalList Component**: Verify inputs (Tournament, Date, Medal, Category) and list rendering.
    - [x] **Parent Integration**: Ensure `AthleteForm` switches tabs correctly and triggers data load.

### Acceptance Criteria

- [x] **AC 1: Rank Promotion History**
    - [x] User can add a promotion (Rank + Date + Notes).
    - [x] The record appears immediately in the Timeline (sorted newest first).
    - [x] **CRITICAL**: The athlete's "Current Rank" in the header/profile updates to the new rank immediately.

- [x] **AC 2: Medal Records**
    - [x] User can log a medal win (Tournament Name, Medal Type, Date).
    - [x] List displays records with correct visual styling (Gold/Silver/Bronze colors).
    - [x] Records persist after application restart.

- [x] **AC 3: Data Integrity**
    - [x] Deleting an athlete REMOVES all their history (Cascade Delete).
    - [x] Invalid dates are rejected (Form validation).

## Additional Context

### Testing Strategy
Since existing code is present, "Implementation" effectively means "Verification & Refinement":
1.  **Manual Tour**: Launch app, pick an athlete -> History Tab.
2.  **Promotion Test**: Add "Green Belt". Switch to "Profile" tab -> Verify Rank says "Green". Check DB -> Verify `promotions` row exists.
3.  **Persistence Test**: Restart app. Verify history remains.
4.  **Refactor**: Only if significant bugs or anti-patterns are found.

## Review Notes
- Adversarial review completed
- Findings: 5 total, 5 fixed, 0 skipped
- Resolution approach: auto-fix
