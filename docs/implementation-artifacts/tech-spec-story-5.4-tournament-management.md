# Tech-Spec: Story 5.4 - Tournament Management & History

**Created:** 2026-01-01  
**Completed:** 2026-01-02  
**Status:** ✅ Completed

## Overview

### Problem Statement

Coaches currently face critical limitations in tournament preparation:

1. **No Tournament Context**: The roster selection system (Story 5.2) is session-based and not tied to specific tournaments
2. **Missing Weight Class Assignment**: Judo tournaments require athletes to be assigned to specific weight classes (e.g., U-18 -55kg, -60kg, -66kg), but the current system doesn't support this categorization
3. **Lost Work**: Coaches lose their carefully assembled tournament rosters if they close the app
4. **No Historical Record**: Past tournament rosters cannot be reviewed or referenced
5. **Ruleset Confusion**: When federation rules change, historical tournament data becomes ambiguous (which rules applied? which weight classes?)
6. **Weight Validation Gap**: No warnings when an athlete's current weight exceeds their assigned weight class limit
7. **Scattered Workflow**: Roster selection happens separately from tournament creation, creating a disjointed user experience

The core issue: **Tournaments need to be first-class entities with embedded roster management and weight class assignment, not an afterthought to athlete filtering.**

### Solution

Implement a **dedicated Tournament Management page** that treats tournaments as the primary workflow:

1. **Tournament-Centric Workflow** - Dedicated page for creating/editing tournaments with embedded roster selection
2. **Weight Class Definition** - Define weight classes per age category within each tournament (e.g., U-18: -55kg, -60kg, -66kg, etc.)
3. **Weight Class Assignment** - Assign each athlete in the roster to a specific weight class within their age category
4. **Weight Validation** - Display warnings when athlete's current weight exceeds their assigned class limit
5. **Ruleset + Weight Class Snapshotting** - Freeze both age categories AND weight classes at tournament creation
6. **Persistent Roster Storage** - Save athletes with their weight class assignments to the database
7. **Simplified Athlete List** - Remove roster selection from athlete list page (roster management only happens in tournament context)

**Workflow:**
```
Coach Flow:
1. Navigate to Tournaments page
2. Click "Create Tournament"
3. Enter tournament info (Name, Date, Location, select Ruleset)
4. Customize weight classes (optional - defaults from ruleset)
5. Select athletes from available pool
6. Assign each athlete to a weight class
7. See weight warnings (if athlete weight > class limit)
8. Save tournament with roster
```

All in one cohesive interface.

### Scope (In/Out)

**In Scope:**
- ✅ Dedicated Tournament Management page (list, create, edit, delete)
- ✅ Tournament metadata: Name, Date, Location
- ✅ **Weight Class Definition** - Define weight classes per tournament (not stored in global ruleset)
- ✅ **Weight Class Customization** - Each tournament can have different weight classes for the same age category
- ✅ Ruleset + Weight Class snapshot as JSON blob (freeze age categories AND weight classes)
- ✅ **Embedded Roster Selection** - Select athletes within tournament detail page
- ✅ **Weight Class Assignment** - Assign each athlete to a specific weight class
- ✅ **Weight Validation** - Warning when athlete's weight > assigned class limit
- ✅ Roster persistence with weight class assignments to `tournament_rosters` table
- ✅ Tournament list view with roster summary (e.g., "12 athletes across 5 weight classes")
- ✅ **Remove roster selection from Athlete List page** - Clean up `AthleteList.tsx`, remove checkboxes
- ✅ Extend `001_initial_schema.ts` with tournament tables (no new migration)
- ✅ Historical tournament view (read-only past tournaments with frozen weight classes)

**Out of Scope:**
- ❌ Club Management (deferred to Story E5.S5)
- ❌ Active tournament selection (no longer needed - tournaments are self-contained)
- ❌ Top-bar tournament selector (no longer needed - dedicated page workflow)
- ❌ Session-only rosters (all rosters are tournament-specific now)
- ❌ Tournament templates or presets
- ❌ Export to Excel/PDF (Epic 6 - Stories 6.1, 6.2)
- ❌ Tournament status workflow (e.g., "Draft", "Completed", "Archived")
- ❌ Automatic weight class suggestion based on athlete weight
- ❌ Weight class conflict resolution (e.g., two athletes in same class)
- ❌ Tournament history analytics or reporting
- ❌ Sharing/importing tournaments between installations

## Context for Development

### Codebase Patterns

**Architecture:**
- **Backend:** Electron Main Process + SQLite (better-sqlite3) + Repository Pattern
- **Frontend:** React + TypeScript + Zustand (state management) + Tailwind CSS
- **IPC Bridge:** Typed IPC handlers via `preload.ts` and `electron.d.ts`
- **Validation:** Zod schemas for runtime type safety
- **Database:** SQLite with WAL mode, transactional operations for data integrity

**Established Patterns:**
1. **Repository Pattern:** `{entity}Repository.ts` with CRUD methods (create, findAll, update, delete)
2. **Service Layer:** `{entity}Service.ts` sets up IPC handlers, validates with Zod, calls repository
3. **Zustand Stores:** `use{Entity}Store.ts` for frontend state management with async actions
4. **IPC Convention:** `{entity}:{action}` (e.g., `tournaments:create`, `tournaments:getAll`)
5. **Schema Definition:** Zod schemas in `src/shared/schemas.ts`, exported types via `z.infer`
6. **Transactions:** Use `db.transaction()` for multi-step operations

### Files to Reference

**Backend (Main Process):**
- `src/main/migrations/001_initial_schema.ts` - **MODIFY**: Add tournament tables, extend age_categories
- `src/main/repositories/athleteRepository.ts` - **REFERENCE**: Repository pattern example
- `src/main/repositories/rulesetRepository.ts` - **REFERENCE**: Transaction usage, JSON handling
- `src/main/services/athleteService.ts` - **REFERENCE**: IPC handler setup pattern

**Frontend (Renderer Process):**
- `src/renderer/features/athletes/AthleteList.tsx` - **MODIFY**: Remove roster selection UI
- `src/renderer/features/athletes/useRosterStore.ts` - **DEPRECATE/MODIFY**: May be repurposed or removed
- `src/renderer/features/settings/useRulesetStore.ts` - **REFERENCE**: Zustand store pattern

**Shared:**
- `src/shared/schemas.ts` - **MODIFY**: Add Tournament, WeightClass, TournamentRoster schemas
- `src/shared/types/electron.d.ts` - **MODIFY**: Add tournament IPC types
- `src/main/preload.ts` - **MODIFY**: Expose tournament IPC methods

### Technical Decisions

#### 1. Weight Classes are Tournament-Specific

**Decision:** Weight classes are NOT stored in the global ruleset. They are defined per tournament only.

**Rationale:**
- Different tournaments using the same ruleset can have different weight classes
- Example: "Provincial 2026" and "National 2026" both use "IJF 2026" ruleset, but Provincial has 7 weight classes while National has 10
- Simpler ruleset schema - no need to extend `age_categories` table
- More flexible - coaches define weight classes based on tournament requirements, not federation rules
- Weight classes are part of the tournament snapshot, not the global ruleset

**Implementation:**
- Weight classes are defined in the tournament creation/edit UI
- Stored in `tournaments.ruleset_snapshot` JSON (along with age categories from ruleset)
- No changes needed to `age_categories` table

#### 2. Tournament Ruleset Snapshot with Weight Classes

**Decision:** Store complete ruleset configuration INCLUDING weight classes as JSON blob in `tournaments.ruleset_snapshot`.

**Rationale:**
- Tournaments are read-heavy (display historical data) vs. write-heavy
- Weight classes can be customized per tournament, so they must be part of the snapshot
- Simpler schema - no duplicate rows with tournament foreign keys
- Atomic snapshot - entire ruleset state (age categories + weight classes) captured in one field
- Historical accuracy - even if global ruleset changes, tournament preserves original rules

**Snapshot Structure:**
```json
{
  "ruleset_id": 1,
  "ruleset_name": "IJF 2026",
  "description": "International Judo Federation 2026 Rules",
  "age_categories": [
    {
      "id": 1,
      "name": "U-18",
      "min_age": 15,
      "max_age": 17,
      "gender": "M",
      "weight_classes": [
        {"limit": 55, "label": "-55kg"},
        {"limit": 60, "label": "-60kg"},
        {"limit": 66, "label": "-66kg"},
        {"limit": 73, "label": "-73kg"},
        {"limit": 81, "label": "-81kg"},
        {"limit": 90, "label": "-90kg"},
        {"limit": 999, "label": "+90kg"}
      ]
    }
  ]
}
```

**Weight Class Definition Flow:**
1. Coach creates tournament, selects ruleset (e.g., "IJF 2026")
2. System loads ruleset age categories (NO weight classes - they don't exist in ruleset)
3. Coach defines weight classes for each age category in this tournament
4. Weight classes are saved in tournament snapshot (not in global ruleset)

#### 3. Weight Class Assignment in Roster

**Decision:** Add `weight_class` TEXT column to `tournament_rosters` table.

**Rationale:**
- Each athlete in a tournament roster must be assigned to a specific weight class
- Weight class is tournament-specific (can vary between tournaments)
- Storing as string (e.g., "-55kg") is simpler than foreign key to weight class table
- Allows historical accuracy even if weight class definitions change

**Schema:**
```sql
CREATE TABLE tournament_rosters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  athlete_id INTEGER NOT NULL,
  weight_class TEXT NOT NULL,  -- e.g., "-55kg", "-60kg"
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
  UNIQUE(tournament_id, athlete_id)
);
```

**Validation:**
- When assigning athlete to weight class, validate against snapshot's weight classes for their age category
- Display warning if athlete's current weight > weight class limit

#### 4. Dedicated Tournament Page Architecture

**Decision:** Create dedicated Tournament Management page with embedded roster selection.

**Rationale:**
- **Workflow Alignment:** Tournament preparation is a discrete task, not a background context
- **Complexity Management:** Weight class assignment requires focused UI, not a sidebar panel
- **User Mental Model:** Coaches think "I'm preparing for Provincial 2026" (task-oriented)
- **Simplified Athlete List:** Removing roster selection keeps it focused on athlete CRUD

**Page Structure:**
```
Tournament List Page (/tournaments):
┌─────────────────────────────────────────────────────────┐
│ Tournaments                          [Create Tournament]│
├─────────────────────────────────────────────────────────┤
│ Name              Date       Location    Roster   Actions│
│ Provincial 2026   2026-03-15 Bandung    12/7     Edit│Del│
│ National Trials   2026-05-20 Jakarta    8/5      Edit│Del│
└─────────────────────────────────────────────────────────┘

Tournament Detail/Edit Page (/tournaments/:id):
┌─────────────────────────────────────────────────────────┐
│ ← Back to Tournaments                    [Save] [Cancel]│
├─────────────────────────────────────────────────────────┤
│ Tournament Information                                   │
│ Name: [Provincial 2026____________]                      │
│ Date: [2026-03-15]  Location: [Bandung__]               │
│ Ruleset: [IJF 2026 ▼] (frozen after creation)           │
├─────────────────────────────────────────────────────────┤
│ Weight Classes (Customizable)                            │
│ U-18 Male: -55kg -60kg -66kg -73kg -81kg -90kg +90kg    │
│            [+ Add] [✎ Edit] [🗑 Remove]                  │
├─────────────────────────────────────────────────────────┤
│ Roster Selection                                         │
│ Available Athletes        │ Selected Athletes (by class) │
│ [Filter: Age▼ Gender▼]   │ -55kg: Athlete A (54kg) ✓    │
│ □ Athlete A (U-18, 54kg) │ -60kg: Athlete B (62kg) ⚠️   │
│ □ Athlete B (U-18, 62kg) │ -66kg: Athlete C (65kg) ✓    │
│ □ Athlete C (U-18, 65kg) │                               │
│ [Select →]                │ [← Remove]                    │
└─────────────────────────────────────────────────────────┘
```

**Navigation:**
- Sidebar link: "Tournaments" (icon: 🏆)
- Clicking "Edit" on tournament list → Tournament Detail page
- "Create Tournament" → Tournament Detail page (empty form)

#### 5. Remove Roster Selection from Athlete List

**Decision:** Remove all roster selection UI from `AthleteList.tsx`.

**Rationale:**
- **Single Responsibility:** Athlete List focuses on athlete CRUD only
- **Reduced Complexity:** No need for session-only roster state or checkboxes
- **Clearer UX:** Coaches know exactly where to go for tournament preparation
- **Cleaner Codebase:** Remove `useRosterStore` integration from athlete list

**Changes:**
- Remove checkboxes from athlete list table
- Remove "Select All" functionality
- Remove roster panel/drawer
- Remove `useRosterStore` imports and usage
- Keep athlete list focused on: View, Create, Edit, Delete athletes

#### 6. Weight Validation: Warning, Not Blocking

**Decision:** Display warnings when athlete's weight exceeds assigned class limit, but allow saving.

**Rationale:**
- Athletes can cut weight before tournaments (current weight may be higher than competition weight)
- Blocking would prevent coaches from planning ahead
- Warnings provide visibility without restricting workflow
- Coach has final authority on roster decisions

**UI Implementation:**
- Yellow warning badge next to athlete in roster: "⚠️ Weight: 62kg (Class: -60kg)"
- Tooltip: "Athlete's current weight exceeds class limit. Ensure weight cut before tournament."
- Summary warning at top: "2 athletes exceed their weight class limits"

**No Validation:**
- Do NOT prevent saving roster with weight warnings
- Do NOT auto-assign athletes to weight classes based on current weight

## Implementation Plan

### Tasks

#### Phase 1: Database Schema Extension

**Task 1.1: Create Tournaments Table**
- [ ] In `001_initial_schema.ts`, add `tournaments` table after `medals` table:
  ```sql
  CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    ruleset_snapshot TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
  ```
- [ ] Test: Verify table creation with correct schema

**Task 1.2: Create Tournament Rosters Table with Weight Class**
- [ ] In `001_initial_schema.ts`, add `tournament_rosters` table:
  ```sql
  CREATE TABLE IF NOT EXISTS tournament_rosters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    weight_class TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, athlete_id)
  );
  CREATE INDEX IF NOT EXISTS idx_tournament_rosters_tournament ON tournament_rosters(tournament_id);
  ```
- [ ] Test: Verify table creation and constraints

#### Phase 2: Shared Schemas & Types

**Task 2.1: Create Weight Class Schema**
- [ ] Open `src/shared/schemas.ts`
- [ ] Add `WeightClassSchema`:
  ```typescript
  export const WeightClassSchema = z.object({
    limit: z.number().positive(),
    label: z.string().min(1),
  });
  export type WeightClass = z.infer<typeof WeightClassSchema>;
  ```
- [ ] Test: Import and validate sample weight class data

**Task 2.2: Extend Age Category Schema (Optional Weight Classes)**
- [ ] In `src/shared/schemas.ts`, modify `AgeCategorySchema` to optionally include weight classes:
  ```typescript
  export const AgeCategorySchema = z.object({
    id: z.number().optional(),
    ruleset_id: z.number().optional(),
    name: z.string().min(1),
    min_age: z.number().int().min(0),
    max_age: z.number().int().max(150),
    gender: z.enum(['M', 'F', 'MIXED']),
    weight_classes: z.array(WeightClassSchema).optional(), // Only used in tournament snapshots
  });
  ```
- [ ] Note: `weight_classes` is NOT stored in database `age_categories` table, only in tournament snapshots
- [ ] Test: Validate age category with and without weight classes

**Task 2.3: Create Tournament Schemas**
- [ ] In `src/shared/schemas.ts`, add `TournamentSchema`:
  ```typescript
  export const TournamentSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Tournament name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    location: z.string().optional(),
    ruleset_snapshot: z.string(), // JSON string
    created_at: z.string().optional(),
  });
  export type Tournament = z.infer<typeof TournamentSchema>;
  ```
- [ ] Add `TournamentRosterEntrySchema`:
  ```typescript
  export const TournamentRosterEntrySchema = z.object({
    id: z.number().optional(),
    tournament_id: z.number(),
    athlete_id: z.number(),
    weight_class: z.string().min(1),
    added_at: z.string().optional(),
  });
  export type TournamentRosterEntry = z.infer<typeof TournamentRosterEntrySchema>;
  ```
- [ ] Test: Validate sample tournament and roster entry data

#### Phase 3: Backend Repositories

**Task 3.1: Create Tournament Repository**
- [ ] Create `src/main/repositories/tournamentRepository.ts`
- [ ] Implement `create(tournament: Tournament): Tournament`:
  - Accept tournament with `ruleset_snapshot` as JSON string (already serialized)
  - Insert into `tournaments` table
  - Return created tournament with ID
- [ ] Implement `findAll(): Tournament[]`:
  - Query all tournaments ordered by `date DESC`
  - Return array of tournaments
- [ ] Implement `findById(id: number): Tournament | undefined`:
  - Query single tournament by ID
  - Return tournament or undefined
- [ ] Implement `update(id: number, data: Partial<Tournament>): boolean`:
  - Update name, date, location (NOT ruleset_snapshot - frozen on creation)
  - Return true if changes > 0
- [ ] Implement `delete(id: number): boolean`:
  - Delete tournament (CASCADE deletes roster entries)
  - Return true if changes > 0
- [ ] Test: Create, read, update, delete tournaments

**Task 3.2: Create Tournament Roster Repository**
- [ ] Create `src/main/repositories/tournamentRosterRepository.ts`
- [ ] Implement `addAthlete(tournamentId: number, athleteId: number, weightClass: string): void`:
  - Insert into `tournament_rosters`
  - Handle UNIQUE constraint (ignore if duplicate)
- [ ] Implement `removeAthlete(tournamentId: number, athleteId: number): boolean`:
  - Delete from `tournament_rosters`
  - Return true if changes > 0
- [ ] Implement `getRoster(tournamentId: number): TournamentRosterEntry[]`:
  - Query all roster entries for tournament
  - Return array of entries with athlete_id and weight_class
- [ ] Implement `clearRoster(tournamentId: number): boolean`:
  - Delete all entries for tournament
  - Return true if changes > 0
- [ ] Implement `saveRoster(tournamentId: number, entries: Array<{athleteId: number, weightClass: string}>): void`:
  - Transaction: clear existing roster → insert all entries
  - Use prepared statement for batch insert
- [ ] Test: Add, remove, get, clear, save roster entries

#### Phase 4: IPC Layer & Service

**Task 4.1: Create Tournament Service**
- [ ] Create `src/main/services/tournamentService.ts`
- [ ] Import repositories and schemas
- [ ] Set up IPC handlers:
  - `tournaments:create` → validate with `TournamentSchema`, call `tournamentRepository.create`
  - `tournaments:getAll` → call `tournamentRepository.findAll`
  - `tournaments:getById` → validate ID, call `tournamentRepository.findById`
  - `tournaments:update` → validate data, call `tournamentRepository.update`
  - `tournaments:delete` → validate ID, call `tournamentRepository.delete`
  - `tournaments:saveRoster` → validate entries, call `tournamentRosterRepository.saveRoster`
  - `tournaments:getRoster` → validate ID, call `tournamentRosterRepository.getRoster`
- [ ] Export `setupTournamentHandlers()` function
- [ ] Test: Invoke IPC handlers via Electron DevTools

**Task 4.2: Register Tournament Service**
- [ ] Open `src/main/main.ts`
- [ ] Import `setupTournamentHandlers`
- [ ] Call `setupTournamentHandlers()` after other service setups
- [ ] Test: Verify no errors on app start

**Task 4.3: Update Preload Script**
- [ ] Open `src/main/preload.ts`
- [ ] Add `tournaments` section to `api` object:
  ```typescript
  tournaments: {
    create: (data) => ipcRenderer.invoke('tournaments:create', data),
    getAll: () => ipcRenderer.invoke('tournaments:getAll'),
    getById: (id) => ipcRenderer.invoke('tournaments:getById', id),
    update: (data) => ipcRenderer.invoke('tournaments:update', data),
    delete: (id) => ipcRenderer.invoke('tournaments:delete', id),
    saveRoster: (tournamentId, entries) => ipcRenderer.invoke('tournaments:saveRoster', tournamentId, entries),
    getRoster: (tournamentId) => ipcRenderer.invoke('tournaments:getRoster', tournamentId),
  }
  ```
- [ ] Test: TypeScript compilation passes

**Task 4.4: Update TypeScript Definitions**
- [ ] Open `src/shared/types/electron.d.ts`
- [ ] Add `tournaments` interface to `IElectronAPI`:
  ```typescript
  tournaments: {
    create: (data: Tournament) => Promise<Tournament>;
    getAll: () => Promise<Tournament[]>;
    getById: (id: number) => Promise<Tournament | undefined>;
    update: (data: Partial<Tournament> & { id: number }) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
    saveRoster: (tournamentId: number, entries: Array<{athleteId: number, weightClass: string}>) => Promise<void>;
    getRoster: (tournamentId: number) => Promise<TournamentRosterEntry[]>;
  }
  ```
- [ ] Test: Verify `window.api.tournaments` is typed correctly

#### Phase 5: Frontend State Management

**Task 5.1: Create Tournament Store**
- [ ] Create `src/renderer/features/tournaments/useTournamentStore.ts`
- [ ] Define `TournamentState` interface:
  ```typescript
  interface TournamentState {
    tournaments: Tournament[];
    loading: boolean;
    error: string | null;
    loadTournaments: () => Promise<void>;
    createTournament: (data: Tournament) => Promise<void>;
    updateTournament: (data: Tournament) => Promise<void>;
    deleteTournament: (id: number) => Promise<void>;
  }
  ```
- [ ] Implement Zustand store following `useRulesetStore` pattern
- [ ] Test: Import store, verify state updates

**Task 5.2: Create Tournament Roster Store (Local State)**
- [ ] Create `src/renderer/features/tournaments/useTournamentRosterStore.ts`
- [ ] Define state for managing roster within tournament detail page:
  ```typescript
  interface TournamentRosterState {
    selectedAthletes: Map<number, string>; // athleteId -> weightClass
    addAthlete: (athleteId: number, weightClass: string) => void;
    removeAthlete: (athleteId: number) => void;
    clearRoster: () => void;
    loadRoster: (entries: TournamentRosterEntry[]) => void;
    getRosterEntries: () => Array<{athleteId: number, weightClass: string}>;
  }
  ```
- [ ] Implement Zustand store
- [ ] Test: Add, remove, clear athletes with weight classes

#### Phase 6: UI Components - Tournament List

**Task 6.1: Create Tournament List Page**
- [ ] Create `src/renderer/features/tournaments/TournamentList.tsx`
- [ ] Implement table view:
  - Columns: Name, Date, Location, Roster Count, Actions
  - Actions: Edit (navigate to detail page), Delete (with confirmation)
  - Sort by date descending
- [ ] Add "Create Tournament" button (navigates to detail page with empty form)
- [ ] Use `useTournamentStore` to fetch and display tournaments
- [ ] Handle delete: show confirmation dialog, call `deleteTournament`
- [ ] Style with Tailwind CSS (high-density table, Midnight Hybrid theme)
- [ ] Test: CRUD operations, verify list updates

**Task 6.2: Add Tournaments Route**
- [ ] Open routing configuration (likely `src/renderer/App.tsx` or router file)
- [ ] Add route: `/tournaments` → `TournamentList` component
- [ ] Test: Navigate to `/tournaments`, verify page renders

**Task 6.3: Add Tournaments Link to Sidebar**
- [ ] Open sidebar navigation component
- [ ] Add "Tournaments" link (icon: 🏆 or trophy SVG)
- [ ] Route to `/tournaments`
- [ ] Position after "Athletes" and before "Settings"
- [ ] Test: Click link, verify navigation

#### Phase 7: UI Components - Tournament Detail Page

**Task 7.1: Create Tournament Detail Page Structure**
- [ ] Create `src/renderer/features/tournaments/TournamentDetail.tsx`
- [ ] Implement page layout with 3 sections:
  1. Tournament Information (Name, Date, Location, Ruleset)
  2. Weight Class Customization
  3. Roster Selection
- [ ] Add route: `/tournaments/:id` (id = "new" for creation)
- [ ] Fetch tournament data if editing (id !== "new")
- [ ] Test: Navigate to detail page, verify layout renders

**Task 7.2: Implement Tournament Information Section**
- [ ] Add form fields:
  - Name (text input, required)
  - Date (date picker, required)
  - Location (text input, optional)
  - Ruleset (dropdown, populated from `useRulesetStore`, required)
- [ ] If editing existing tournament, display ruleset as read-only (frozen)
- [ ] If creating new tournament, allow ruleset selection
- [ ] Load selected ruleset's age categories when ruleset selected (NO weight classes - they come from ruleset)
- [ ] Test: Fill form, verify validation

**Task 7.3: Implement Weight Class Definition Section**
- [ ] Display age categories from selected ruleset
- [ ] For each age category, show empty weight classes list (start from scratch)
- [ ] Allow adding new weight class: input for limit (number) and label (text)
- [ ] Allow editing existing weight class (change limit/label)
- [ ] Allow removing weight class
- [ ] Store weight classes in local state (will be saved in tournament snapshot)
- [ ] Provide common presets as quick-add buttons (e.g., "IJF Standard", "Provincial Standard")
- [ ] Test: Add, edit, remove weight classes

**Task 7.4: Implement Roster Selection Section - Available Athletes**
- [ ] Display list of available athletes (from `useAthleteStore`)
- [ ] Add filters:
  - Age Category (dropdown, based on tournament's age categories)
  - Gender (dropdown: Male, Female, All)
  - Weight (range slider or input)
- [ ] Filter athletes based on selected criteria
- [ ] Display athlete cards with: Name, Age, Gender, Weight, Current Rank
- [ ] Add "Add to Roster" button for each athlete
- [ ] Test: Filter athletes, verify list updates

**Task 7.5: Implement Roster Selection Section - Selected Athletes**
- [ ] Display selected athletes grouped by weight class
- [ ] For each athlete, show:
  - Name, Weight, Assigned Weight Class
  - Weight validation warning (if weight > class limit)
  - Remove button
- [ ] Allow assigning/changing weight class via dropdown
- [ ] Display summary: "12 athletes across 5 weight classes"
- [ ] Display warning summary: "2 athletes exceed weight class limits"
- [ ] Test: Add athletes, assign weight classes, verify warnings

**Task 7.6: Implement Save/Cancel Actions**
- [ ] Add "Save" button:
  - Validate all required fields
  - Validate that each age category has at least one weight class defined
  - Create ruleset snapshot (serialize ruleset age categories + tournament-specific weight classes to JSON)
  - If creating new tournament: call `createTournament`
  - If editing: call `updateTournament` (metadata only, not ruleset snapshot)
  - Save roster: call `window.api.tournaments.saveRoster` with athlete IDs and weight classes
  - Navigate back to tournament list on success
- [ ] Add "Cancel" button: navigate back without saving
- [ ] Test: Create tournament with roster, verify saved to database

#### Phase 8: Cleanup - Remove Roster Selection from Athlete List

**Task 8.1: Remove Roster UI from Athlete List**
- [ ] Open `src/renderer/features/athletes/AthleteList.tsx`
- [ ] Remove checkbox column from table
- [ ] Remove "Select All" checkbox from header
- [ ] Remove selection count indicator
- [ ] Remove `useRosterStore` imports and usage
- [ ] Test: Verify athlete list still works for CRUD operations

**Task 8.2: Remove Roster View Component (Optional)**
- [ ] If `RosterView.tsx` is no longer used, delete the file
- [ ] OR repurpose it for tournament detail page roster section
- [ ] Remove any imports/references to `RosterView` from athlete list
- [ ] Test: Verify no broken imports

**Task 8.3: Deprecate or Repurpose useRosterStore**
- [ ] Evaluate if `useRosterStore` is still needed
- [ ] Option A: Delete if fully replaced by `useTournamentRosterStore`
- [ ] Option B: Repurpose for tournament-specific roster state
- [ ] Update any remaining references
- [ ] Test: Verify no broken functionality

#### Phase 9: Integration & Polish

**Task 9.1: Load Tournaments on App Start**
- [ ] Open main app initialization (likely `App.tsx`)
- [ ] Add `useEffect` to load tournaments:
  ```tsx
  useEffect(() => {
    useTournamentStore.getState().loadTournaments();
  }, []);
  ```
- [ ] Test: Restart app, verify tournaments load

**Task 9.2: Handle Edge Cases**
- [ ] **Deleted Athlete in Roster:**
  - CASCADE delete removes athlete from `tournament_rosters` automatically
  - When loading roster, filter out any athlete IDs that no longer exist
- [ ] **No Active Ruleset:**
  - Disable "Create Tournament" if no active ruleset
  - Show warning: "Set an active ruleset before creating tournaments"
- [ ] **Empty Weight Classes:**
  - If age category has no weight classes, show warning
  - Allow manual addition of weight classes
- [ ] Test: Delete athlete in roster, verify graceful handling

**Task 9.3: Add Visual Feedback (Toasts)**
- [ ] Tournament created → Success toast: "Tournament '[Name]' created"
- [ ] Tournament updated → Success toast: "Tournament '[Name]' updated"
- [ ] Tournament deleted → Success toast: "Tournament deleted"
- [ ] Roster saved → Success toast: "Roster saved (12 athletes)"
- [ ] Use consistent toast library (likely already in project)
- [ ] Test: Verify toasts appear for all actions

**Task 9.4: Add Confirmation Dialogs**
- [ ] Delete tournament → Confirmation: "Delete '[Name]'? This will remove all roster data."
- [ ] Cancel tournament edit with unsaved changes → Confirmation: "Discard changes?"
- [ ] Test: Verify confirmations prevent accidental data loss

**Task 9.5: Responsive Design**
- [ ] Test tournament list on mobile/tablet screen sizes
- [ ] Tournament list table should scroll horizontally on mobile
- [ ] Tournament detail page should stack sections vertically on mobile
- [ ] Weight class customization should be touch-friendly
- [ ] Test: Resize browser, verify all components adapt

### Acceptance Criteria

**AC 1: Create Tournament with Ruleset Snapshot**
- **Given** the coach is on the Tournaments page
- **When** they click "Create Tournament", enter Name="Provincial 2026", Date="2026-03-15", Location="Bandung", select Ruleset="IJF 2026"
- **Then** the tournament is created with a frozen ruleset snapshot (JSON blob containing all age categories and weight classes)
- **And** the tournament appears in the tournament list

**AC 2: Define Weight Classes for Tournament**
- **Given** the coach is creating a new tournament with "IJF 2026" ruleset
- **When** they navigate to the Weight Class Definition section
- **Then** they see age categories from the ruleset with NO weight classes (empty list)
- **When** they add weight classes "-55kg", "-60kg", "-66kg" to U-18 category
- **Then** the weight classes are saved in the tournament snapshot (NOT in global ruleset)
- **And** another tournament using "IJF 2026" can have completely different weight classes

**AC 3: Assign Athletes to Weight Classes**
- **Given** the coach is editing a tournament
- **When** they select "Athlete A" (weight: 54kg) and assign to "-55kg" weight class
- **Then** the athlete is added to the roster with weight class assignment
- **And** no weight warning is shown (54kg < 55kg)

**AC 4: Weight Validation Warning**
- **Given** the coach is editing a tournament
- **When** they assign "Athlete B" (weight: 62kg) to "-60kg" weight class
- **Then** a yellow warning badge appears: "⚠️ Weight: 62kg (Class: -60kg)"
- **And** the roster can still be saved (warning, not blocking)

**AC 5: Roster Persistence with Weight Classes**
- **Given** the coach has assigned 5 athletes to various weight classes
- **When** they click "Save"
- **Then** the roster is saved to `tournament_rosters` table with athlete IDs and weight classes
- **And** a success toast appears: "Roster saved (5 athletes)"

**AC 6: Load Tournament with Roster**
- **Given** a tournament "Provincial 2026" has a saved roster of 5 athletes with weight class assignments
- **When** the coach clicks "Edit" on the tournament
- **Then** the tournament detail page loads with all 5 athletes displayed in their assigned weight classes

**AC 7: Roster Persistence Across App Restarts**
- **Given** a tournament has a saved roster
- **When** the coach closes and reopens the application
- **Then** navigating to the tournament detail page shows the saved roster

**AC 8: Ruleset Snapshot Immutability**
- **Given** a tournament "Provincial 2026" was created with "IJF 2026" ruleset and weight classes (-55kg, -60kg, -66kg for U-18)
- **When** the coach later edits the global "IJF 2026" ruleset to change U-18 age range from 15-17 to 16-18
- **Then** viewing "Provincial 2026" still shows the original snapshot (U-18: ages 15-17)
- **And** the ruleset snapshot is NOT updated (frozen at creation time)
- **And** weight classes remain unchanged (they were never part of the global ruleset)

**AC 9: Athlete List Simplified**
- **Given** the coach is on the Athlete List page
- **When** they view the list
- **Then** there are NO checkboxes, NO "Select All" button, NO roster panel
- **And** the list focuses on athlete CRUD operations only

**AC 10: Tournament Deletion Clears Roster**
- **Given** a tournament "Provincial 2026" has a roster
- **When** the coach deletes the tournament (with confirmation)
- **Then** the roster is cleared (CASCADE delete removes `tournament_rosters` entries)
- **And** a toast appears: "Tournament deleted"

## Additional Context

### Dependencies

**Existing Dependencies:**
- `useAthleteStore` - Athlete data for roster selection
- `useRulesetStore` - Rulesets with age categories (now includes weight classes)
- `athleteRepository` - Validate athlete IDs in roster
- `rulesetRepository` - Fetch ruleset for snapshotting

**New Dependencies:**
- `tournamentRepository` - Tournament CRUD operations
- `tournamentRosterRepository` - Roster persistence with weight classes
- `useTournamentStore` - Tournament state management
- `useTournamentRosterStore` - Local roster state for tournament detail page

### Testing Strategy

#### Unit Tests

**Repository Tests:**
- `tournamentRepository.create` creates tournament with JSON snapshot
- `tournamentRepository.findAll` returns all tournaments
- `tournamentRosterRepository.saveRoster` clears old roster and inserts new entries with weight classes
- `tournamentRosterRepository.getRoster` returns athlete IDs with weight classes

**Store Tests:**
- `useTournamentStore.createTournament` calls IPC and updates state
- `useTournamentRosterStore.addAthlete` adds athlete with weight class
- `useTournamentRosterStore.getRosterEntries` returns correct format

#### Integration Tests

**Manual Testing Workflow:**
1. Create ruleset with age categories and default weight classes
2. Create tournament "Provincial 2026", select ruleset
3. Customize weight classes (add/remove/edit)
4. Select 5 athletes, assign to different weight classes
5. Verify weight warnings for athletes exceeding class limits
6. Save tournament
7. Navigate back to tournament list, verify tournament appears
8. Edit tournament, verify roster loads with weight class assignments
9. Modify roster (add/remove athletes, change weight classes)
10. Save changes, verify persistence
11. Restart app, verify tournament and roster persist
12. Delete tournament, verify roster cleared

**Edge Case Testing:**
- Create tournament with no active ruleset (should fail gracefully)
- Delete athlete in a tournament roster (should CASCADE delete)
- Create tournament with empty weight classes (should allow manual addition)
- Assign athlete to non-existent weight class (should validate)

#### Performance Tests

- Load 50 tournaments, verify list renders quickly (<100ms)
- Load tournament with 50+ athletes in roster, verify <100ms load time
- Create tournament with large ruleset snapshot (20+ categories), verify no lag

### Notes

**Future Enhancements:**

1. **Tournament Status Workflow** (Post-MVP):
   - Add `status` field: "Draft", "Active", "Completed", "Archived"
   - Prevent editing completed tournaments
   - Archive old tournaments to reduce clutter

2. **Weight Class Conflict Resolution** (Post-MVP):
   - Detect when two athletes are assigned to same weight class
   - Suggest alternative weight classes
   - Allow manual override

3. **Automatic Weight Class Suggestion** (Post-MVP):
   - When adding athlete to roster, suggest weight class based on current weight
   - Coach can accept or override suggestion

4. **Tournament Templates** (Post-MVP):
   - Save tournament as template (e.g., "Standard Provincial Format")
   - Auto-populate weight classes and settings from template

5. **Export Integration** (Epic 6):
   - Export tournament roster to Excel (Story 6.1)
   - Generate PDF roster sheet grouped by weight class (Story 6.2)
   - Include tournament metadata in exports

6. **Tournament History Analytics** (Epic 8):
   - Link medals to specific tournaments (Story 8.2)
   - Track athlete participation across tournaments
   - Generate tournament history reports

**Migration to Production:**

Once the app is deployed to production:
- Switch from extending `001_initial_schema.ts` to creating incremental migrations
- Use `MigrationService` to handle schema versioning
- Test migration path on copy of production database before deploying

**Data Integrity:**

- The `UNIQUE(tournament_id, athlete_id)` constraint prevents duplicate roster entries
- `CASCADE DELETE` ensures orphaned roster entries are cleaned up
- JSON validation ensures weight classes are well-formed

**UX Considerations:**

- Dedicated tournament page provides focused workflow
- Weight validation warnings guide coaches without blocking
- Clear visual indicators (badges, warnings) improve usability
- Confirmation dialogs prevent accidental data loss

**Performance Optimization:**

- Index on `tournaments.date` speeds up tournament list sorting
- Index on `tournament_rosters.tournament_id` speeds up roster queries
- JSON snapshot avoids JOIN queries for historical data
