# Tech-Spec: Story E9.S5 - Advanced Athlete Sorting

**Created:** 2026-01-08  
**Status:** Ready for Development  
**Story Reference:** Epic 9, Story 5 (E9.S5)

## Overview

### Problem Statement

Currently, the athlete list defaults to sorting by name in ascending order. This requires coaches to manually click the "Status" column header to view active athletes first. For efficient roster management, coaches need to immediately see their active athletes at the top of the list when they open the athlete management page.

Additionally, there is a **critical bug** in the status sorting logic (line 211 of `AthleteList.tsx`) where both comparison values reference the same athlete object, preventing proper status-based sorting.

### Solution

Implement default sorting by activity status (Active → Intermittent → Dormant) with secondary sorting by name (alphabetical). The user can override this default by clicking any column header, including the status column to reverse the order or switch to other sorting criteria.

### Scope

**In Scope:**
- Fix the existing bug in status sorting logic (line 211)
- Change default sort configuration from `{ key: 'name', direction: 'asc' }` to `{ key: 'status', direction: 'asc' }`
- Add secondary sorting by name within each status group
- Preserve existing click-to-sort functionality for all columns
- Maintain user's ability to change sorting by clicking column headers

**Out of Scope:**
- Adding new status values beyond Constant/Intermittent/Dormant
- Persisting sort preferences across sessions
- Adding multi-column sort UI indicators
- Changing the activity status field schema or values

## Context for Development

### Codebase Patterns

This application follows these established patterns:

1. **State Management**: Uses Zustand for global state, React `useState` for local component state
2. **Sorting Pattern**: Controlled via `sortConfig` state object with `{ key: SortColumn, direction: SortDirection }`
3. **Filtering & Sorting**: Implemented in a single `useMemo` hook that chains filtering then sorting
4. **Order Constants**: Predefined order mappings (e.g., `RANK_ORDER`, `STATUS_ORDER`) for enum-based sorting

### Files to Reference

**Primary File to Modify:**
- `src/renderer/features/athletes/AthleteList.tsx` (922 lines)
  - Lines 39-43: `STATUS_ORDER` constant (already correct)
  - Lines 65-68: Default `sortConfig` state initialization (needs change)
  - Lines 192-220: Sorting logic in `filteredAthletes` useMemo (has bug + needs enhancement)

**Related Files (Reference Only - No Changes):**
- `src/shared/types/domain.ts` - ActivityStatus enum definition
- `src/shared/schemas.ts` - Athlete schema with activity_status field
- `src/main/migrations/001_initial_schema.ts` - Database schema with activity_status column

### Technical Decisions

1. **Default Sort Priority**: Status (asc) → Name (asc)
   - Rationale: "Active" athletes appear first, followed by "Intermittent", then "Dormant"
   - Within each status group, athletes are alphabetically sorted by name

2. **Preserve User Control**: Clicking any column header overrides the default
   - Clicking "Status" column toggles between asc/desc
   - Clicking other columns switches primary sort to that column
   - This maintains existing UX patterns

3. **Bug Fix Approach**: Simple variable name correction
   - Line 211: Change `STATUS_ORDER[a.status]` to `STATUS_ORDER[b.status]`
   - This is a typo fix, not a logic redesign

4. **Secondary Sort Implementation**: Enhance the sort comparator
   - When primary sort values are equal, fall back to name comparison
   - This ensures consistent, predictable ordering

## Implementation Plan

### Tasks

- [ ] **Task 1**: Fix status sorting bug in comparison logic
  - File: `src/renderer/features/athletes/AthleteList.tsx`
  - Location: Line 211
  - Change: `valB = STATUS_ORDER[a.status] || 0;` → `valB = STATUS_ORDER[b.status] || 0;`

- [ ] **Task 2**: Change default sort configuration to status
  - File: `src/renderer/features/athletes/AthleteList.tsx`
  - Location: Lines 65-68
  - Change: `key: 'name'` → `key: 'status'`
  - Keep: `direction: 'asc'` (unchanged)

- [ ] **Task 3**: Implement secondary sorting by name
  - File: `src/renderer/features/athletes/AthleteList.tsx`
  - Location: Lines 192-220 (sorting logic in `filteredAthletes` useMemo)
  - Enhancement: Add secondary sort by name when primary values are equal
  - Logic: After comparing primary sort values, if equal (`return 0`), compare names alphabetically

### Acceptance Criteria

#### AC1: Default Sort Order
- [ ] **Given** the athlete list page is loaded
- [ ] **When** no user interaction has occurred
- [ ] **Then** athletes should be sorted by status in ascending order: Constant (Active) → Intermittent → Dormant
- [ ] **And** within each status group, athletes should be sorted alphabetically by name (A-Z)

#### AC2: Status Sorting Bug Fixed
- [ ] **Given** the athlete list contains athletes with different statuses
- [ ] **When** the user clicks the "Status" column header
- [ ] **Then** the list should correctly sort by status (not show duplicate/incorrect ordering)
- [ ] **And** clicking again should reverse the order (Dormant → Intermittent → Constant)

#### AC3: User Can Override Default Sort
- [ ] **Given** the default status sort is active
- [ ] **When** the user clicks any other column header (Name, Belt, Club)
- [ ] **Then** the list should re-sort by that column
- [ ] **And** the sort direction indicator (chevron) should appear on the clicked column

#### AC4: Secondary Sort Consistency
- [ ] **Given** multiple athletes share the same primary sort value (e.g., same status)
- [ ] **When** viewing the list
- [ ] **Then** those athletes should be consistently ordered alphabetically by name
- [ ] **And** the order should remain stable when filters are applied

#### AC5: Status Column Click Behavior
- [ ] **Given** the list is sorted by status (default)
- [ ] **When** the user clicks the "Status" column header
- [ ] **Then** the sort direction should toggle to descending (Dormant first)
- [ ] **When** clicked again
- [ ] **Then** it should return to ascending (Constant first)

## Additional Context

### Dependencies

**No new dependencies required.** This is a pure logic fix and configuration change using existing:
- React hooks (`useState`, `useMemo`)
- Existing `STATUS_ORDER` constant
- Existing `sortConfig` state pattern

### Testing Strategy

#### Manual Testing Checklist

1. **Default Behavior Test**
   - Clear browser cache/restart app
   - Navigate to Athlete List
   - Verify athletes appear in order: Constant → Intermittent → Dormant
   - Within each group, verify alphabetical name order

2. **Bug Fix Validation**
   - Create test data with mixed statuses
   - Click "Status" column header
   - Verify correct ascending order (Constant → Intermittent → Dormant)
   - Click again, verify correct descending order (Dormant → Intermittent → Constant)

3. **User Override Test**
   - From default state, click "Name" column
   - Verify list re-sorts alphabetically
   - Click "Belt" column, verify belt-based sorting
   - Click "Club" column, verify club-based sorting

4. **Secondary Sort Test**
   - Ensure multiple athletes have the same status
   - Verify they appear in alphabetical order by name
   - Apply filters, verify order remains consistent

5. **Edge Cases**
   - Empty list (no athletes)
   - Single athlete
   - All athletes same status
   - All athletes different statuses

#### Test Data Recommendations

Create athletes with these characteristics for comprehensive testing:

| Name | Status | Expected Position (Default Sort) |
|------|--------|-----------------------------------|
| Alice | Constant | 1 |
| Charlie | Constant | 2 |
| Bob | Intermittent | 3 |
| Diana | Intermittent | 4 |
| Eve | Dormant | 5 |
| Frank | Dormant | 6 |

### Notes

#### Why This Approach?

1. **Minimal Code Changes**: Only 3 lines modified, reducing regression risk
2. **Preserves UX**: Existing click-to-sort behavior unchanged
3. **Fixes Critical Bug**: Corrects broken status sorting
4. **Improves Default UX**: Active athletes immediately visible

#### Alternative Approaches Considered

**Option A: Multi-Column Sort UI**
- Rejected: Over-engineered for current requirements
- Would require new UI controls and state management

**Option B: Persist Sort Preferences**
- Rejected: Out of scope for this story
- Could be future enhancement (E9.S9 or later)

**Option C: Add Status Filter Instead**
- Rejected: Status filter already exists (line 667)
- Sorting is more efficient for quick scanning

#### Implementation Notes

The sorting logic uses a comparator pattern:
```typescript
return results.sort((a, b) => {
  // 1. Get primary sort values
  // 2. Compare primary values
  // 3. If equal, compare secondary (name)
  // 4. Return -1, 0, or 1 based on direction
});
```

The `STATUS_ORDER` constant maps enum values to numeric priorities:
```typescript
const STATUS_ORDER = {
  [ActivityStatus.Constant]: 1,      // Highest priority
  [ActivityStatus.Intermittent]: 2,
  [ActivityStatus.Dormant]: 3,       // Lowest priority
};
```

When `direction === 'asc'`, lower numbers appear first (Constant → Dormant).
When `direction === 'desc'`, higher numbers appear first (Dormant → Constant).

---

## Code Changes Preview

### Change 1: Fix Status Sorting Bug (Line 211)

**Before:**
```typescript
case 'status':
    valA = STATUS_ORDER[a.status] || 0;
    valB = STATUS_ORDER[a.status] || 0;  // ❌ BUG: Should be b.status
    break;
```

**After:**
```typescript
case 'status':
    valA = STATUS_ORDER[a.status] || 0;
    valB = STATUS_ORDER[b.status] || 0;  // ✅ FIXED
    break;
```

### Change 2: Update Default Sort Config (Lines 65-68)

**Before:**
```typescript
const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection }>({
    key: 'name',
    direction: 'asc',
});
```

**After:**
```typescript
const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection }>({
    key: 'status',
    direction: 'asc',
});
```

### Change 3: Add Secondary Sort by Name (Lines 217-219)

**Before:**
```typescript
if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
return 0;
```

**After:**
```typescript
if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;

// Secondary sort by name when primary values are equal
const nameA = a.name.toLowerCase();
const nameB = b.name.toLowerCase();
if (nameA < nameB) return -1;
if (nameA > nameB) return 1;
return 0;
```

---

## Estimated Effort

- **Development**: 15-30 minutes
- **Testing**: 15-20 minutes
- **Total**: ~30-50 minutes

## Risk Assessment

**Risk Level**: ⚠️ **LOW**

**Risks:**
1. **Regression in existing sort functionality** - Mitigated by minimal code changes
2. **User confusion if expecting name sort** - Mitigated by clear visual indicators (chevron on Status column)
3. **Performance impact on large lists** - Mitigated by existing useMemo optimization

**Mitigation:**
- Test all column sorts after implementation
- Verify chevron indicators update correctly
- Test with 100+ athlete dataset
