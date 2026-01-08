# Tech-Spec: Enhanced Belt System (Kyu/Dan)

**Created:** 2026-01-07  
**Status:** Ready for Development  
**Story:** E9.S2 - Enhanced Belt System (Kyu/Dan)  
**Epic:** Epic 9 - Application Refinement & Extended Features

## Overview

### Problem Statement

The current application uses "Rank" terminology throughout the UI, which doesn't align with official Judo grading terminology. Additionally, the system needs to support the full Kyu/Dan grading structure with proper belt color mapping to match international Judo standards.

**Current State:**
- UI displays "Rank" labels instead of "Belt"
- Belt enum values are simple (e.g., "White", "Black (DAN 1)")
- Missing Kyu grade information for colored belts
- Inconsistent with official grading terminology

**Desired State:**
- All UI labels changed from "Rank" to "Belt"
- Belt values include Kyu/Dan grades (e.g., "White (6th Kyu)", "Black (1st Dan)")
- Support for Dan 1-10 for Black belts
- Consistent terminology across the entire application

### Solution

Update the UI layer only (no database schema changes) to:
1. Rename all "Rank" labels to "Belt" in UI components
2. Update the `Rank` enum values to include Kyu/Dan grades
3. Update the `BeltBadge` component to display the new format
4. Update export services to use "Belt" terminology

### Scope (In/Out)

**In Scope:**
- ✅ Update `Rank` enum values in `src/shared/types/domain.ts`
- ✅ Update `BeltBadge` component labels
- ✅ Change all UI labels from "Rank" to "Belt" in:
  - AthleteForm component
  - Timeline component (promotion history)
  - Export services (PDF/Excel headers)
- ✅ Update dropdown options to show new belt format

**Out of Scope:**
- ❌ Database schema changes (column names remain as `rank`)
- ❌ Data migration (user will delete existing data)
- ❌ Backend service logic changes
- ❌ IPC handler modifications
- ❌ Repository layer changes

## Context for Development

### Codebase Patterns

**Type Definitions:**
- Domain types are defined in `src/shared/types/domain.ts` using TypeScript enums
- The `Rank` enum is used throughout the application for type safety

**Component Structure:**
- React functional components with TypeScript
- Tailwind CSS for styling
- Form handling with `react-hook-form` and Zod validation

**Belt Display Pattern:**
- `BeltBadge` component is the single source of truth for belt visualization
- Uses a configuration object mapping rank values to colors and labels
- Displays colored badges with belt names

### Files to Reference

**Core Type Definition:**
```
src/shared/types/domain.ts
```
- Contains the `Rank` enum that needs updating
- Currently has 13 values (White through Dan7)

**UI Components:**
```
src/renderer/components/BeltBadge.tsx
```
- Displays belt badges with colors
- Has `rankConfig` object mapping ranks to display properties

```
src/renderer/features/athletes/AthleteForm.tsx
```
- Line 431: "Current Rank" label
- Line 258: Rank field edit logic
- Line 302-303: Belt badge display

```
src/renderer/features/athletes/history/Timeline.tsx
```
- Line 100: "Rank History" heading
- Line 114: "New Rank" label
- Line 172: Rank display in timeline

**Export Services:**
```
src/main/services/ExportService.ts
```
- Line 383: PDF export "Rank" column header
- Line 649: Excel export "Rank" column header

### Technical Decisions

**Decision 1: UI-Only Changes**
- **Rationale:** User confirmed they can delete existing data, so no migration needed
- **Impact:** Simpler implementation, faster delivery
- **Trade-off:** Existing data will need to be re-entered

**Decision 2: Keep Enum Key Names**
- **Rationale:** Maintain backward compatibility with database values
- **Impact:** Only enum values change, not keys (e.g., `Rank.White` stays the same)
- **Trade-off:** Slight inconsistency between key names and display values

**Decision 3: Extend Dan Grades to Dan 10**
- **Rationale:** Story acceptance criteria specifies "Black (Dan 1-10)"
- **Impact:** Need to add Dan8, Dan9, Dan10 to enum
- **Trade-off:** More options in dropdowns

## Implementation Plan

### Tasks

#### Task 1: Update Rank Enum with Kyu/Dan Grades
**File:** `src/shared/types/domain.ts`

Update the `Rank` enum to include Kyu/Dan information:

```typescript
export enum Rank {
    White = 'White (6th Kyu)',
    Yellow = 'Yellow (5th Kyu)',
    Orange = 'Orange (4th Kyu)',
    Green = 'Green (3rd Kyu)',
    Blue = 'Blue (2nd Kyu)',
    Brown = 'Brown (1st Kyu)',
    Dan1 = 'Black (1st Dan)',
    Dan2 = 'Black (2nd Dan)',
    Dan3 = 'Black (3rd Dan)',
    Dan4 = 'Black (4th Dan)',
    Dan5 = 'Black (5th Dan)',
    Dan6 = 'Black (6th Dan)',
    Dan7 = 'Black (7th Dan)',
    Dan8 = 'Black (8th Dan)',
    Dan9 = 'Black (9th Dan)',
    Dan10 = 'Black (10th Dan)',
}
```

**Why:** This is the single source of truth for belt values throughout the application.

---

#### Task 2: Update BeltBadge Component Labels
**File:** `src/renderer/components/BeltBadge.tsx`

Update the `rankConfig` object to reflect new labels:

```typescript
const rankConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  [Rank.White]: { bg: 'bg-white', text: 'text-slate-700', border: 'border-slate-200', label: 'White (6th Kyu)' },
  [Rank.Yellow]: { bg: 'bg-yellow-300', text: 'text-yellow-900', border: 'border-yellow-400', label: 'Yellow (5th Kyu)' },
  [Rank.Orange]: { bg: 'bg-orange-400', text: 'text-white', border: 'border-orange-500', label: 'Orange (4th Kyu)' },
  [Rank.Green]: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700', label: 'Green (3rd Kyu)' },
  [Rank.Blue]: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', label: 'Blue (2nd Kyu)' },
  [Rank.Brown]: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-900', label: 'Brown (1st Kyu)' },
  [Rank.Dan1]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (1st Dan)' },
  [Rank.Dan2]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (2nd Dan)' },
  [Rank.Dan3]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (3rd Dan)' },
  [Rank.Dan4]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (4th Dan)' },
  [Rank.Dan5]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (5th Dan)' },
  [Rank.Dan6]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (6th Dan)' },
  [Rank.Dan7]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (7th Dan)' },
  [Rank.Dan8]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (8th Dan)' },
  [Rank.Dan9]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (9th Dan)' },
  [Rank.Dan10]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Black (10th Dan)' },
};
```

**Why:** The BeltBadge component needs to display the new Kyu/Dan format consistently.

---

#### Task 3: Update AthleteForm UI Labels
**File:** `src/renderer/features/athletes/AthleteForm.tsx`

**Change 1:** Line 431 - Update field label
```typescript
// FROM:
{renderField('rank', 'Current Rank', 'text', Object.values(Rank).map(r => ({ value: r, label: r })))}

// TO:
{renderField('rank', 'Current Belt', 'text', Object.values(Rank).map(r => ({ value: r, label: r })))}
```

**Change 2:** Line 318 - Update helper text
```typescript
// FROM:
Updated via History tab

// TO:
Updated via Belt Promotion in History tab
```

**Why:** Ensures consistency with new "Belt" terminology in the athlete profile form.

---

#### Task 4: Update Timeline Component UI Labels
**File:** `src/renderer/features/athletes/history/Timeline.tsx`

**Change 1:** Line 100 - Update section heading
```typescript
// FROM:
<h3 className="text-lg font-semibold text-slate-800">Rank History</h3>

// TO:
<h3 className="text-lg font-semibold text-slate-800">Belt Promotion History</h3>
```

**Change 2:** Line 114 - Update form label
```typescript
// FROM:
<label className="block text-xs font-semibold text-slate-600 mb-1">New Rank</label>

// TO:
<label className="block text-xs font-semibold text-slate-600 mb-1">New Belt</label>
```

**Why:** The promotion history section should use "Belt" terminology consistently.

---

#### Task 5: Update Export Service Headers
**File:** `src/main/services/ExportService.ts`

**Change 1:** Line 383 - Update PDF column header
```typescript
// FROM:
{ key: 'rank', label: 'Rank', width: 60 }

// TO:
{ key: 'rank', label: 'Belt', width: 60 }
```

**Change 2:** Line 649 - Update Excel column header
```typescript
// FROM:
{ key: 'rank', label: 'Rank', width: 55 },

// TO:
{ key: 'rank', label: 'Belt', width: 55 },
```

**Why:** Exported documents should reflect the new terminology for consistency.

---

#### Task 6: Update AthleteList Rank Order (Optional Enhancement)
**File:** `src/renderer/features/athletes/AthleteList.tsx`

Add Dan8, Dan9, Dan10 to the RANK_ORDER constant (around line 20-30):

```typescript
const RANK_ORDER: Record<string, number> = {
    [Rank.White]: 1,
    [Rank.Yellow]: 2,
    [Rank.Orange]: 3,
    [Rank.Green]: 4,
    [Rank.Blue]: 5,
    [Rank.Brown]: 6,
    [Rank.Dan1]: 7,
    [Rank.Dan2]: 8,
    [Rank.Dan3]: 9,
    [Rank.Dan4]: 10,
    [Rank.Dan5]: 11,
    [Rank.Dan6]: 12,
    [Rank.Dan7]: 13,
    [Rank.Dan8]: 14,
    [Rank.Dan9]: 15,
    [Rank.Dan10]: 16,
};
```

**Why:** Ensures proper sorting when athletes have the new Dan grades.

### Acceptance Criteria

- [x] **AC1:** Given any display of "Rank" in the UI, Then it should be renamed to "Belt"
  - **Verification:** Check AthleteForm, Timeline, and all UI components
  
- [x] **AC2:** Given the belt selection dropdown, When a user views the options, Then they should see the format "Color (Nth Kyu)" or "Black (Nth Dan)"
  - **Verification:** Open athlete form and check dropdown options
  
- [x] **AC3:** Given the Rank enum, When viewing the values, Then it should include:
  - White (6th Kyu)
  - Yellow (5th Kyu)
  - Orange (4th Kyu)
  - Green (3rd Kyu)
  - Blue (2nd Kyu)
  - Brown (1st Kyu)
  - Black (1st Dan through 10th Dan)
  - **Verification:** Check `src/shared/types/domain.ts`

- [x] **AC4:** Given an athlete profile, When viewing their belt, Then it should display in the format "White (6th Kyu)" with appropriate color badge
  - **Verification:** View athlete details and check BeltBadge rendering

- [x] **AC5:** Given the promotion history timeline, When viewing the section, Then the heading should say "Belt Promotion History" instead of "Rank History"
  - **Verification:** Navigate to History tab in athlete profile

- [x] **AC6:** Given exported PDF/Excel files, When viewing column headers, Then they should show "Belt" instead of "Rank"
  - **Verification:** Export a roster and check headers

## Additional Context

### Dependencies

**No New Dependencies Required:**
- All changes are UI-only modifications
- Uses existing React, TypeScript, and Tailwind CSS setup

### Testing Strategy

**Manual Testing Checklist:**

1. **Enum Values Test:**
   - [ ] Verify `Rank` enum in `domain.ts` has all 16 values with correct Kyu/Dan format
   - [ ] Confirm enum keys remain unchanged (e.g., `Rank.White`, `Rank.Dan1`)

2. **UI Display Test:**
   - [ ] Create new athlete and verify belt dropdown shows new format
   - [ ] Edit existing athlete and verify belt displays with Kyu/Dan
   - [ ] Check BeltBadge component renders correctly with new labels

3. **Promotion History Test:**
   - [ ] Navigate to History tab
   - [ ] Verify heading says "Belt Promotion History"
   - [ ] Add new promotion and verify "New Belt" label
   - [ ] Verify timeline displays belt with Kyu/Dan format

4. **Export Test:**
   - [ ] Export roster to PDF and verify "Belt" column header
   - [ ] Export to Excel and verify "Belt" column header
   - [ ] Verify belt values in exports show full Kyu/Dan format

5. **Sorting Test:**
   - [ ] Create athletes with different belts including Dan8-10
   - [ ] Sort by belt and verify correct order

**Build Verification:**
```bash
npm run build
```
- Application should compile without TypeScript errors
- No runtime errors in console

### Notes

**Data Cleanup Required:**
- User confirmed they will delete existing database before applying changes
- No migration script needed
- Fresh start with new belt format

**Future Considerations:**
- If database schema needs to be updated later, consider renaming `rank` column to `belt`
- Could add a migration script to convert old rank values to new format
- Consider adding belt color visualization in more places (dashboard, reports)

**Design Consistency:**
- The format "Color (Nth Kyu/Dan)" follows international Judo standards
- Maintains visual belt color coding for quick recognition
- Provides detailed grade information for official documentation

---

## Implementation Checklist

- [ ] Task 1: Update Rank enum with Kyu/Dan grades
- [ ] Task 2: Update BeltBadge component labels
- [ ] Task 3: Update AthleteForm UI labels
- [ ] Task 4: Update Timeline component UI labels
- [ ] Task 5: Update Export Service headers
- [ ] Task 6: Update AthleteList rank order
- [ ] Run `npm run build` to verify no errors
- [ ] Manual testing of all acceptance criteria
- [ ] Delete existing database
- [ ] Test with fresh data

---

**Estimated Effort:** 1-2 hours  
**Complexity:** Low (UI-only changes, no logic modifications)  
**Risk Level:** Low (no database or backend changes)
