# Tech-Spec: E8.S1 - Automated Tournament History

**Created:** 2026-01-04  
**Status:** Implementation Complete  
**Story:** E8.S1 - Automated Tournament History

## Overview

### Problem Statement

Currently, when coaches add athletes to tournament rosters, there is no automatic tracking of tournament participation history. This creates:
- **Double-entry burden:** Coaches must manually record tournament participation separately
- **Data inconsistency:** Tournament roster data and athlete history are disconnected
- **Missing context:** Athletes' profiles don't show their competition history automatically

### Solution

Implement an automated tournament history system that:
1. **Automatically creates** tournament history entries when athletes are added to tournament rosters
2. **Automatically removes** history entries when athletes are removed from rosters
3. **Displays** tournament history in athlete detail views using a timeline UI (similar to medal/promotion history)
4. **Allows manual entry** of past tournaments for historical data

### Scope

**In Scope:**
- New `tournament_history` database table
- Automatic history creation/deletion triggered by roster changes
- Timeline view component for displaying tournament history
- Manual tournament history entry form
- IPC handlers and repository methods
- Integration with existing athlete detail view

**Out of Scope:**
- Performance/results tracking (future story)
- Tournament statistics/analytics (future story)
- Bulk import of historical tournament data
- Editing auto-generated history entries (only manual entries can be edited)

---

## Context for Development

### Codebase Patterns

**Repository Pattern:**
```typescript
// Pattern: src/main/repositories/{entity}Repository.ts
export const entityRepository = {
    create: (data) => { /* INSERT */ },
    getById: (id) => { /* SELECT */ },
    update: (id, data) => { /* UPDATE */ },
    delete: (id) => { /* DELETE */ }
};
```

**IPC Service Pattern:**
```typescript
// Pattern: src/main/services/{entity}Service.ts
export function setupEntityHandlers() {
    ipcMain.handle('entity:action', async (_, data) => {
        const validated = Schema.parse(data);
        return repository.action(validated);
    });
}
```

**Zod Schema Pattern:**
```typescript
// Pattern: src/shared/schemas.ts
export const EntitySchema = z.object({
    id: z.number().optional(),
    // ... fields
});
export type Entity = z.infer<typeof EntitySchema>;
```

**Frontend Store Pattern (Zustand):**
```typescript
// Pattern: src/renderer/features/{entity}/use{Entity}Store.ts
export const useEntityStore = create<EntityState>((set) => ({
    entities: [],
    loadEntities: async () => { /* ... */ }
}));
```

### Files to Reference

**Database & Backend:**
- `src/main/migrations/001_initial_schema.ts` - Database schema (need new migration for tournament_history)
- `src/main/repositories/historyRepository.ts` - Pattern for promotions/medals
- `src/main/repositories/tournamentRosterRepository.ts` - Roster operations (trigger point)
- `src/main/services/historyService.ts` - IPC handlers pattern
- `src/shared/schemas.ts` - Schema definitions

**Frontend:**
- `src/renderer/features/athletes/AthleteList.tsx` - Shows timeline pattern for medals
- `src/renderer/features/tournaments/TournamentDetail.tsx` - Roster management UI
- `src/shared/types/electron.d.ts` - IPC type definitions

### Technical Decisions

1. **Auto-generation vs Manual Flag:** Use `is_auto_generated` boolean field to distinguish between auto-created and manually-entered history
2. **Deletion Cascade:** When athlete removed from roster, auto-delete corresponding history entry
3. **Data Integrity:** Use foreign keys with CASCADE to maintain referential integrity
4. **Timeline Display:** Reuse existing timeline component pattern from medals/promotions
5. **Weight Class Storage:** Store weight class in history for context (athlete competed in which class)
6. **Age Category Storage:** Store calculated age category at time of tournament for historical accuracy

---

## Implementation Plan

### Phase 1: Database Schema & Migration

**Task 1.1: Create Migration File**
- [ ] Create `src/main/migrations/002_tournament_history.ts`
- [ ] Define `tournament_history` table with fields:
  - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  - `athlete_id` (INTEGER NOT NULL, FK to athletes)
  - `tournament_id` (INTEGER, FK to tournaments, nullable for manual entries)
  - `tournament_name` (TEXT NOT NULL)
  - `tournament_date` (TEXT NOT NULL, format: YYYY-MM-DD)
  - `tournament_location` (TEXT, optional)
  - `weight_class` (TEXT, optional)
  - `age_category` (TEXT, optional)
  - `is_auto_generated` (INTEGER DEFAULT 0, 0=manual, 1=auto)
  - `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)
- [ ] Add indexes on `athlete_id` and `tournament_id`
- [ ] Add foreign key constraints with ON DELETE CASCADE

**Task 1.2: Register Migration**
- [ ] Add migration to `src/main/migrations/index.ts`
- [ ] Test migration runs successfully on app startup

### Phase 2: Backend - Repository Layer

**Task 2.1: Create Tournament History Repository**
- [ ] Create `src/main/repositories/tournamentHistoryRepository.ts`
- [ ] Implement methods:
  - `addHistory(data)` - Insert tournament history entry
  - `getHistoryByAthlete(athleteId)` - Get all history for an athlete, ordered by date DESC
  - `deleteHistory(id)` - Delete a specific history entry
  - `deleteAutoGeneratedByTournamentAndAthlete(tournamentId, athleteId)` - Delete auto-generated entry
  - `updateHistory(id, data)` - Update manual history entry (only if not auto-generated)

**Task 2.2: Extend Tournament Roster Repository**
- [ ] Update `src/main/repositories/tournamentRosterRepository.ts`
- [ ] Modify `addAthlete()` to:
  1. Insert into `tournament_rosters`
  2. Fetch tournament details (name, date, location)
  3. Calculate age category from athlete birth date + tournament date
  4. Insert auto-generated history entry
- [ ] Modify `removeAthlete()` to:
  1. Delete from `tournament_rosters`
  2. Delete corresponding auto-generated history entry
- [ ] Modify `saveRoster()` to handle batch operations with history creation/deletion

### Phase 3: Backend - Schema & IPC Layer

**Task 3.1: Define Zod Schema**
- [ ] Add to `src/shared/schemas.ts`:
```typescript
export const TournamentHistorySchema = z.object({
    id: z.number().optional(),
    athlete_id: z.number(),
    tournament_id: z.number().nullable().optional(),
    tournament_name: z.string().min(1, 'Tournament name is required'),
    tournament_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    tournament_location: z.string().optional(),
    weight_class: z.string().optional(),
    age_category: z.string().optional(),
    is_auto_generated: z.boolean().optional(),
    created_at: z.string().optional(),
});

export type TournamentHistory = z.infer<typeof TournamentHistorySchema>;
```

**Task 3.2: Create IPC Handlers**
- [ ] Create `src/main/services/tournamentHistoryService.ts`
- [ ] Implement handlers:
  - `tournamentHistory:getByAthlete` - Fetch history for athlete
  - `tournamentHistory:addManual` - Add manual tournament entry
  - `tournamentHistory:update` - Update manual entry (validate not auto-generated)
  - `tournamentHistory:delete` - Delete manual entry (validate not auto-generated)
- [ ] Register handlers in `src/main/main.ts`

**Task 3.3: Update TypeScript Definitions**
- [ ] Add to `src/shared/types/electron.d.ts`:
```typescript
tournamentHistory: {
    getByAthlete: (athleteId: number) => Promise<TournamentHistory[]>;
    addManual: (data: Omit<TournamentHistory, 'id' | 'is_auto_generated'>) => Promise<TournamentHistory>;
    update: (id: number, data: Partial<TournamentHistory>) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
}
```
- [ ] Expose in `src/main/preload.ts`

### Phase 4: Frontend - State Management

**Task 4.1: Create Tournament History Store**
- [ ] Create `src/renderer/features/athletes/useTournamentHistoryStore.ts`
- [ ] Implement Zustand store with:
  - `history: TournamentHistory[]`
  - `loadHistory: (athleteId: number) => Promise<void>`
  - `addManualHistory: (data) => Promise<void>`
  - `deleteHistory: (id: number) => Promise<void>`
  - `updateHistory: (id: number, data) => Promise<void>`

### Phase 5: Frontend - UI Components

**Task 5.1: Create Tournament History Timeline Component**
- [ ] Create `src/renderer/features/athletes/TournamentHistoryTimeline.tsx`
- [ ] Design similar to medal/promotion timeline:
  - Chronological list (most recent first)
  - Each entry shows:
    - Tournament name (bold)
    - Date and location
    - Weight class and age category (if available)
    - Badge indicating "Auto" vs "Manual"
    - Edit/Delete buttons (only for manual entries)
- [ ] Add "Add Manual Entry" button at top
- [ ] Handle empty state with helpful message

**Task 5.2: Create Manual Entry Form Modal**
- [ ] Create `src/renderer/features/athletes/AddTournamentHistoryModal.tsx`
- [ ] Form fields:
  - Tournament Name (required, text input)
  - Date (required, date picker)
  - Location (optional, text input)
  - Weight Class (optional, dropdown or text)
  - Age Category (optional, dropdown or text)
- [ ] Validation using Zod schema
- [ ] Submit handler calls `addManualHistory`

**Task 5.3: Integrate into Athlete Detail View**
- [ ] Update `src/renderer/features/athletes/AthleteForm.tsx` (or create AthleteDetail.tsx if needed)
- [ ] Add new section: "Tournament History"
- [ ] Render `TournamentHistoryTimeline` component
- [ ] Load history when athlete detail view opens

### Phase 6: Integration & Testing

**Task 6.1: Test Auto-Generation Flow**
- [ ] Add athlete to tournament roster → Verify history entry created
- [ ] Remove athlete from roster → Verify history entry deleted
- [ ] Bulk roster save → Verify all history entries updated correctly

**Task 6.2: Test Manual Entry Flow**
- [ ] Add manual tournament history → Verify saved and displayed
- [ ] Edit manual entry → Verify updates persist
- [ ] Delete manual entry → Verify removed
- [ ] Attempt to edit/delete auto-generated entry → Verify blocked

**Task 6.3: Test UI/UX**
- [ ] Timeline displays correctly with mixed auto/manual entries
- [ ] Badges clearly distinguish auto vs manual
- [ ] Empty state shows helpful message
- [ ] Form validation works correctly
- [ ] Loading states display properly

---

## Acceptance Criteria

### AC1: Automatic History Creation
**Given** a coach is managing a tournament roster  
**When** they add an athlete to the roster with a specific weight class  
**Then** a tournament history entry should be automatically created for that athlete  
**And** the entry should include tournament name, date, location, weight class, and calculated age category  
**And** the entry should be marked as `is_auto_generated = true`

### AC2: Automatic History Deletion
**Given** an athlete has an auto-generated tournament history entry  
**When** the coach removes that athlete from the tournament roster  
**Then** the corresponding history entry should be automatically deleted  
**And** manual history entries should remain untouched

### AC3: Timeline Display
**Given** an athlete has tournament history (both auto and manual)  
**When** the coach views the athlete's detail page  
**Then** they should see a "Tournament History" section  
**And** entries should be displayed in chronological order (most recent first)  
**And** each entry should show tournament name, date, location, weight class, age category  
**And** auto-generated entries should have a visual badge/indicator

### AC4: Manual Entry Addition
**Given** a coach is viewing an athlete's tournament history  
**When** they click "Add Manual Entry" and fill in the form (name, date, optional location)  
**Then** the entry should be saved with `is_auto_generated = false`  
**And** it should appear in the timeline immediately

### AC5: Manual Entry Editing/Deletion
**Given** an athlete has a manually-entered tournament history  
**When** the coach clicks edit or delete on that entry  
**Then** they should be able to modify or remove it  
**And** auto-generated entries should NOT have edit/delete buttons

---

## Additional Context

### Dependencies

**NPM Packages (Already Installed):**
- `better-sqlite3` - Database
- `zod` - Schema validation
- `zustand` - State management
- `lucide-react` - Icons

**No New Dependencies Required**

### Testing Strategy

**Unit Tests (Optional but Recommended):**
- Repository methods (add, delete, get)
- Auto-generation logic in roster repository

**Integration Tests:**
- Full flow: Add to roster → Check history created
- Full flow: Remove from roster → Check history deleted
- Manual entry CRUD operations

**Manual Testing:**
1. Create new tournament
2. Add 3 athletes to roster with different weight classes
3. Verify 3 history entries created
4. Remove 1 athlete
5. Verify 1 history entry deleted
6. Add manual history for past tournament
7. Verify manual entry appears with correct badge
8. Attempt to edit auto-generated entry → Should be disabled

### Notes

**Design Considerations:**
- **Why separate table?** Keeps tournament_rosters focused on active roster management while tournament_history is a permanent record
- **Why store tournament_name separately?** Allows manual entries for tournaments not in the system
- **Why nullable tournament_id?** Supports manual entries for past tournaments that weren't tracked in the system

**Future Enhancements (Out of Scope):**
- Link medals to specific tournament history entries (Story E8.S2)
- Add performance/results field (placement, points)
- Export tournament history as PDF
- Statistics dashboard showing participation trends

**Migration Safety:**
- Migration is additive (new table only)
- No data migration needed
- Safe to run on existing databases

**Performance:**
- Indexes on `athlete_id` and `tournament_id` ensure fast queries
- Timeline queries will be fast even with 100+ tournaments per athlete
- Batch roster operations wrapped in transactions for atomicity
