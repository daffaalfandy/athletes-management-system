# Tech-Spec: E8.S2 - Integrated Medal Records

**Created:** 2026-01-05  
**Status:** Ready for Development  
**Story:** E8.S2 - Integrated Medal Records

## Overview

### Problem Statement

Currently, when coaches add medal records to athlete profiles, they manually type the tournament name as free text. This creates several issues:

- **Data Disconnection:** Medal records are not linked to the athlete's tournament history
- **Inconsistent Naming:** Same tournament might be spelled differently across medals
- **No Verification:** Cannot verify if the athlete actually participated in the tournament
- **Limited Context:** Cannot easily see all achievements from a specific tournament
- **Manual Entry Burden:** Coach must type tournament name even if athlete just competed there

### Solution

Enhance the medal recording system to integrate with tournament history by:

1. **Adding an optional foreign key** `tournament_id` to the `medals` table
2. **Providing a dropdown** of tournaments from the athlete's tournament history when adding medals
3. **Allowing manual entry** for tournaments not in the system (historical/external events)
4. **Auto-populating** tournament name and date when selecting from history
5. **Maintaining backward compatibility** with existing medal records

### Scope (In/Out)

**In Scope:**
- Database migration to add `tournament_id` column to `medals` table
- Update `MedalSchema` to include optional `tournament_id`
- Modify `MedalList.tsx` UI to show tournament dropdown
- Fetch athlete's tournament history for dropdown population
- Auto-fill tournament name/date when selecting from dropdown
- Support for manual tournament name entry (existing behavior)
- Backward compatibility with existing medal records

**Out of Scope:**
- Displaying medals within tournament detail view (future enhancement)
- Linking medals to specific weight classes within tournaments
- Medal analytics or statistics dashboard
- Bulk editing of existing medals to link them to tournaments
- Validation that medal date matches tournament date

---

## Context for Development

### Codebase Patterns

**Database Migration Pattern:**
```typescript
// Pattern: src/main/migrations/00X_description.ts
export const migrationName: Migration = {
    version: X,
    name: 'Description',
    up: (db) => {
        db.exec(`ALTER TABLE table_name ADD COLUMN column_name TYPE`);
    }
};
```

**Repository Pattern:**
```typescript
// Pattern: src/main/repositories/{entity}Repository.ts
export const entityRepository = {
    add: (data) => { /* INSERT with all fields */ },
    getById: (id) => { /* SELECT */ },
    update: (id, data) => { /* UPDATE */ }
};
```

**Zod Schema Pattern:**
```typescript
// Pattern: src/shared/schemas.ts
export const EntitySchema = z.object({
    id: z.number().optional(),
    foreign_key_id: z.number().nullable().optional(), // Optional FK
    // ... other fields
});
```

**Frontend Dropdown Pattern:**
```typescript
// Pattern: Controlled select with react-hook-form
<select {...register('fieldName')} onChange={handleChange}>
    <option value="">Manual Entry</option>
    {items.map(item => (
        <option key={item.id} value={item.id}>{item.name}</option>
    ))}
</select>
```

### Files to Reference

**Database & Backend:**
- `src/main/migrations/001_initial_schema.ts` - Current medals table schema
- `src/main/repositories/historyRepository.ts` - Medal CRUD operations
- `src/main/services/historyService.ts` - IPC handlers for medals
- `src/shared/schemas.ts` - MedalSchema definition

**Frontend:**
- `src/renderer/features/athletes/history/MedalList.tsx` - Medal UI component
- `src/renderer/features/athletes/useAthleteStore.ts` - Athlete state management
- `src/renderer/features/athletes/useTournamentHistoryStore.ts` - Tournament history state
- `src/shared/types/electron.d.ts` - IPC type definitions

**Reference Implementation:**
- `src/shared/schemas.ts` - `TournamentHistorySchema` (has optional `tournament_id`)
- `src/renderer/features/athletes/TournamentHistoryTimeline.tsx` - Timeline pattern

### Technical Decisions

1. **Optional Foreign Key:** `tournament_id` is nullable to support:
   - Historical medals from before the system was used
   - External tournaments not tracked in the system
   - Backward compatibility with existing records

2. **No Cascade Delete:** When a tournament is deleted, medals should remain (set `tournament_id` to NULL) to preserve historical records

3. **UI Behavior:** 
   - Dropdown shows tournaments from athlete's history (auto + manual)
   - "Manual Entry" option always available at top
   - Selecting tournament auto-fills name and date fields
   - Manual entry allows free-text tournament name

4. **Data Integrity:** 
   - If `tournament_id` is set, store the tournament name for denormalization (faster queries, resilient to tournament deletion)
   - Medal date can differ from tournament date (e.g., medal awarded later)

5. **Backward Compatibility:**
   - Existing medals have `tournament_id = NULL`
   - All existing functionality continues to work
   - Migration is non-breaking

---

## Implementation Plan

### Phase 1: Database Schema & Migration

#### Task 1.1: Create Migration File
- [ ] Create `src/main/migrations/003_add_tournament_id_to_medals.ts`
- [ ] Add `tournament_id` column to `medals` table:
  ```sql
  ALTER TABLE medals ADD COLUMN tournament_id INTEGER;
  ```
- [ ] Add foreign key constraint with ON DELETE SET NULL:
  ```sql
  -- Note: SQLite doesn't support ADD CONSTRAINT for existing tables
  -- We'll handle this in the migration by recreating the table
  ```
- [ ] Add index on `tournament_id` for performance:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_medals_tournament_id ON medals(tournament_id);
  ```

#### Task 1.2: Register Migration
- [ ] Add migration to `src/main/migrations/index.ts`
- [ ] Ensure migration runs on app startup
- [ ] Test migration on development database

**Migration Implementation Notes:**
- SQLite requires table recreation to add foreign key constraints
- Preserve all existing data during migration
- Handle the migration in a transaction for safety

### Phase 2: Backend - Schema & Repository

#### Task 2.1: Update Zod Schema
- [ ] Modify `src/shared/schemas.ts` - `MedalSchema`:
  ```typescript
  export const MedalSchema = z.object({
      id: z.number().optional(),
      athleteId: z.number(),
      tournament_id: z.number().nullable().optional(), // NEW FIELD
      tournament: z.string().min(1, 'Tournament name is required'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      medal: z.enum(['Gold', 'Silver', 'Bronze']),
      category: z.string().optional(),
      proof_image_path: z.string().optional(),
  });
  ```

#### Task 2.2: Update History Repository
- [ ] Modify `src/main/repositories/historyRepository.ts`
- [ ] Update `addMedal()` method to include `tournament_id`:
  ```typescript
  addMedal: (medal: Medal): Medal => {
      const db = getDatabase();
      const stmt = db.prepare(`
          INSERT INTO medals (athleteId, tournament_id, tournament, date, medal, category, proof_image_path)
          VALUES (@athleteId, @tournament_id, @tournament, @date, @medal, @category, @proof_image_path)
      `);
      const info = stmt.run({ 
          ...medal, 
          tournament_id: medal.tournament_id || null,
          proof_image_path: medal.proof_image_path || null 
      });
      return { ...medal, id: Number(info.lastInsertRowid) };
  }
  ```
- [ ] `getMedals()` already returns all fields, no changes needed
- [ ] `deleteMedal()` no changes needed

#### Task 2.3: Verify IPC Handler
- [ ] Check `src/main/services/historyService.ts`
- [ ] Ensure `history:addMedal` handler passes through `tournament_id`
- [ ] No changes needed (Zod validation handles new field)

### Phase 3: Frontend - State Management

#### Task 3.1: Update TypeScript Definitions
- [ ] Verify `src/shared/types/electron.d.ts` includes updated `Medal` type
- [ ] No changes needed (types are inferred from schemas)

#### Task 3.2: Extend Tournament History Store (Optional)
- [ ] `src/renderer/features/athletes/useTournamentHistoryStore.ts` already loads history
- [ ] No changes needed - we'll use existing `loadHistory` method

### Phase 4: Frontend - UI Enhancement

#### Task 4.1: Update MedalList Component
- [ ] Modify `src/renderer/features/athletes/history/MedalList.tsx`
- [ ] Import tournament history store:
  ```typescript
  import { useTournamentHistoryStore } from '../useTournamentHistoryStore';
  ```
- [ ] Load tournament history when component mounts:
  ```typescript
  const { history, loadHistory } = useTournamentHistoryStore();
  
  React.useEffect(() => {
      loadHistory(athleteId);
  }, [athleteId, loadHistory]);
  ```

#### Task 4.2: Add Tournament Dropdown
- [ ] Add state for selected tournament:
  ```typescript
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  ```
- [ ] Add dropdown field in the form (before tournament name input):
  ```tsx
  <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
          Link to Tournament (Optional)
      </label>
      <select
          value={selectedTournamentId || ''}
          onChange={handleTournamentSelect}
          className="block w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
          <option value="">Manual Entry (Type tournament name below)</option>
          {history.map(th => (
              <option key={th.id} value={th.id}>
                  {th.tournament_name} - {th.tournament_date}
              </option>
          ))}
      </select>
  </div>
  ```

#### Task 4.3: Implement Auto-Fill Logic
- [ ] Create handler for tournament selection:
  ```typescript
  const handleTournamentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tournamentId = e.target.value ? parseInt(e.target.value) : null;
      setSelectedTournamentId(tournamentId);
      
      if (tournamentId) {
          const tournament = history.find(th => th.id === tournamentId);
          if (tournament) {
              setValue('tournament', tournament.tournament_name);
              setValue('date', tournament.tournament_date);
          }
      } else {
          // Manual entry - clear fields
          setValue('tournament', '');
          setValue('date', new Date().toISOString().split('T')[0]);
      }
  };
  ```

#### Task 4.4: Update Form Submission
- [ ] Modify `onAddMedal` to include `tournament_id`:
  ```typescript
  const onAddMedal = async (data: Omit<Medal, 'id'>) => {
      try {
          await addMedal({ 
              ...data, 
              athleteId,
              tournament_id: selectedTournamentId,
              tempFilePath: selectedFile || undefined 
          });
          reset({ 
              athleteId, 
              tournament: '', 
              date: new Date().toISOString().split('T')[0], 
              medal: 'Gold', 
              category: '' 
          });
          setSelectedFile(null);
          setSelectedTournamentId(null); // Reset tournament selection
          setIsAdding(false);
      } catch (error: any) {
          // ... existing error handling
      }
  };
  ```

#### Task 4.5: Visual Indicator for Linked Medals
- [ ] Add visual badge/icon to medal entries that are linked to tournaments
- [ ] In the medal list rendering, add indicator:
  ```tsx
  {sortedMedals.map((medal, index) => (
      <div key={medal.id || index} className="...">
          {/* ... existing content ... */}
          {medal.tournament_id && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  <Link2 size={10} />
                  <span>Linked</span>
              </div>
          )}
      </div>
  ))}
  ```

### Phase 5: Testing & Validation

#### Task 5.1: Test Migration
- [ ] Run migration on test database
- [ ] Verify `tournament_id` column exists
- [ ] Verify existing medals have `tournament_id = NULL`
- [ ] Verify index created successfully

#### Task 5.2: Test Backend
- [ ] Add medal with `tournament_id` → Verify saved correctly
- [ ] Add medal without `tournament_id` → Verify saved with NULL
- [ ] Fetch medals → Verify `tournament_id` included in response
- [ ] Delete tournament → Verify medals remain with `tournament_id = NULL`

#### Task 5.3: Test Frontend UI
- [ ] Open athlete with tournament history → Verify dropdown populated
- [ ] Select tournament from dropdown → Verify name/date auto-filled
- [ ] Submit medal with linked tournament → Verify saved and displayed
- [ ] Select "Manual Entry" → Verify fields cleared for manual input
- [ ] Submit medal without tournament link → Verify saved correctly
- [ ] Verify "Linked" badge appears on linked medals

#### Task 5.4: Test Edge Cases
- [ ] Athlete with no tournament history → Dropdown shows only "Manual Entry"
- [ ] Athlete with 50+ tournaments → Dropdown scrollable and performant
- [ ] Edit existing medal (no tournament_id) → Still works correctly
- [ ] Delete linked tournament → Medal remains, `tournament_id` becomes NULL

---

## Acceptance Criteria

### AC1: Tournament Dropdown Display
**Given** the coach is adding a medal to an athlete's profile  
**When** they open the "Add Medal" form  
**Then** they should see a dropdown field labeled "Link to Tournament (Optional)"  
**And** the dropdown should contain all tournaments from the athlete's tournament history  
**And** the dropdown should have "Manual Entry" as the first option  
**And** each tournament option should display the tournament name and date

### AC2: Auto-Fill on Tournament Selection
**Given** the coach is adding a medal  
**When** they select a tournament from the dropdown  
**Then** the "Tournament Name" field should auto-populate with the tournament's name  
**And** the "Date" field should auto-populate with the tournament's date  
**And** the coach can still modify these fields if needed

### AC3: Manual Entry Support
**Given** the coach is adding a medal  
**When** they select "Manual Entry" from the dropdown  
**Then** the tournament name and date fields should be cleared  
**And** they can type any tournament name manually  
**And** the medal should be saved without a `tournament_id` link

### AC4: Linked Medal Indicator
**Given** an athlete has medals in their record  
**When** the coach views the medal list  
**Then** medals linked to tournaments should display a "Linked" badge or icon  
**And** medals without tournament links should not show the badge

### AC5: Backward Compatibility
**Given** existing medals in the database (before this feature)  
**When** the migration runs  
**Then** all existing medals should remain intact  
**And** they should have `tournament_id = NULL`  
**And** they should display and function normally in the UI

---

## Additional Context

### Dependencies

**NPM Packages (Already Installed):**
- `better-sqlite3` - Database operations
- `zod` - Schema validation
- `zustand` - State management
- `react-hook-form` - Form handling
- `lucide-react` - Icons (add `Link2` icon)

**No New Dependencies Required**

### Testing Strategy

**Manual Testing Checklist:**
1. **Migration Test:**
   - Run app with migration
   - Check database schema with SQLite browser
   - Verify existing medals still load

2. **Add Medal Flow:**
   - Open athlete with tournament history
   - Add medal linked to tournament
   - Verify auto-fill works
   - Verify medal saved with tournament_id

3. **Manual Entry Flow:**
   - Add medal with manual tournament name
   - Verify saved without tournament_id
   - Verify displays correctly

4. **Edge Cases:**
   - Athlete with no tournaments → Only manual entry available
   - Delete tournament → Linked medals still display
   - Edit old medal → No errors

**Database Verification:**
```sql
-- Check migration
PRAGMA table_info(medals);

-- Check existing medals
SELECT id, tournament_id, tournament FROM medals LIMIT 10;

-- Check linked medals
SELECT m.id, m.tournament, t.name 
FROM medals m 
LEFT JOIN tournaments t ON m.tournament_id = t.id 
WHERE m.tournament_id IS NOT NULL;
```

### Notes

**Design Rationale:**

1. **Why Optional FK?**
   - Supports historical medals from before system usage
   - Allows recording medals from external/untracked tournaments
   - Maintains flexibility for coaches

2. **Why Denormalize Tournament Name?**
   - Faster queries (no JOIN required for display)
   - Resilient to tournament deletion
   - Preserves historical accuracy

3. **Why ON DELETE SET NULL?**
   - Medals are permanent records of achievement
   - Deleting a tournament shouldn't delete medals
   - Setting NULL preserves the medal with its manually-entered name

**Future Enhancements (Out of Scope):**
- Display all medals won at a tournament in tournament detail view
- Medal statistics by tournament
- Bulk linking of existing medals to tournaments
- Validation warnings if medal date differs significantly from tournament date
- Export tournament report including all medals won

**Performance Considerations:**
- Index on `tournament_id` ensures fast lookups
- Dropdown limited to single athlete's history (typically <100 tournaments)
- No N+1 query issues (tournament history loaded once)

**Migration Safety:**
- Migration is additive (new column only)
- No data transformation required
- Existing records get NULL value (safe default)
- Can be rolled back by dropping column (if needed)
