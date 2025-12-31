# Tech-Spec: Story 3.2 - Dynamic Age Category Calculation

**Created:** 2025-12-31  
**Status:** ✅ Complete

## Overview

### Problem Statement
The system currently displays athlete birth years but does not automatically calculate or display their age category (e.g., "U-18", "Seniors") based on the active ruleset. Coaches must manually determine which age category an athlete belongs to, which is error-prone and time-consuming, especially when preparing tournament rosters or filtering athletes.

### Solution
Implement a client-side utility function in `src/shared/judo/` that calculates an athlete's age category based on:
- The athlete's birth date
- The active ruleset's age category definitions (birth year ranges)
- The athlete's gender
- A configurable reference year (current year or specific tournament year)

The calculated age category will be displayed in both the athlete list and the athlete detail modal, updating instantly when the active ruleset changes or when viewing athletes for different tournament years.

### Scope (In/Out)

**In:**
- Utility function for age category calculation in `src/shared/judo/calculateAgeCategory.ts`
- Display age category in the athlete list (alongside birth year)
- Display age category in the athlete detail modal (Profile tab)
- Support for both current year and tournament year calculations
- Gender-based matching (M matches M/MIXED, F matches F/MIXED)
- "Unclassified" display for athletes with no matching category
- Integration with existing `useRulesetStore` to get active ruleset

**Out:**
- Weight category calculation (separate story)
- Storing calculated age categories in the database (calculated on-demand only)
- Age category filtering in the athlete list (future enhancement)
- Historical age category tracking (what category they were in previous years)
- Rank order configuration (Story 3.3)

## Context for Development

### Codebase Patterns
- **Architecture:** Electron + React + SQLite (better-sqlite3) + Zustand
- **Styling:** Tailwind CSS with "Midnight Hybrid" theme
- **State Management:** Zustand stores (`useAthleteStore`, `useRulesetStore`)
- **Business Logic Location:** Shared utilities in `src/shared/judo/` (accessible from both main and renderer processes)
- **Type Safety:** Zod schemas for validation, TypeScript interfaces for type checking

### Files to Reference
- `src/shared/schemas.ts` - Contains `Ruleset`, `AgeCategory`, and `Athlete` types
- `src/renderer/features/settings/useRulesetStore.ts` - Manages ruleset state, provides `getActiveRuleset()`
- `src/renderer/features/athletes/AthleteList.tsx` - Main list view (line 249 shows birth year)
- `src/renderer/features/athletes/AthleteForm.tsx` - Detail modal (Profile tab)
- `src/main/repositories/rulesetRepository.ts` - Backend ruleset data access
- `src/shared/types/domain.ts` - Domain enums (Rank, ActivityStatus, etc.)

### Technical Decisions

1. **Client-Side Calculation:** Age categories will be calculated on-demand in the UI rather than stored in the database. This ensures they always reflect the current active ruleset without requiring data migration.

2. **Shared Utility Location:** The calculation logic will live in `src/shared/judo/calculateAgeCategory.ts` to follow the project's pattern of isolating Judo-specific business rules (as stated in `project-context.md` rule #3).

3. **Gender Matching Logic:**
   - Male athletes match categories with `gender: 'M'` or `gender: 'MIXED'`
   - Female athletes match categories with `gender: 'F'` or `gender: 'MIXED'`
   - Priority: Exact gender match (M/F) takes precedence over MIXED if multiple categories match

4. **Year Calculation:** Birth year is extracted from the athlete's `birthDate` (YYYY-MM-DD format). The reference year (current or tournament year) is compared against the category's `min_year` and `max_year` to determine eligibility.

5. **Tournament Year Context:** A global state or context will be added to allow users to toggle between "Current Year" and a specific "Tournament Year" for age category calculations. This will be useful for planning future tournaments.

## Implementation Plan

### Tasks

#### Phase 1: Core Utility Function
- [x] **Task 1.1:** Create `src/shared/judo/calculateAgeCategory.ts`
  - Export `calculateAgeCategory(birthDate: string, gender: 'male' | 'female', categories: AgeCategory[], referenceYear?: number): string`
  - Extract birth year from `birthDate` (YYYY-MM-DD format)
  - Use `referenceYear` (defaults to current year if not provided)
  - Filter categories by gender (M/F/MIXED matching logic)
  - Find category where `birthYear >= min_year && birthYear <= max_year`
  - Return category name or "Unclassified" if no match
  - Handle edge cases: invalid dates, empty categories array, missing gender

- [x] **Task 1.2:** Create unit tests for `calculateAgeCategory`
  - Test exact gender match (M → M, F → F)
  - Test MIXED gender fallback
  - Test priority (exact gender over MIXED)
  - Test "Unclassified" for no match
  - Test edge cases (invalid date, empty categories)

#### Phase 2: Athlete List Integration
- [x] **Task 2.1:** Update `AthleteList.tsx` to display age category
  - Import `calculateAgeCategory` and `useRulesetStore`
  - In `enhanceAthlete()` function (line 48), add `ageCategory` field
  - Get active ruleset from `useRulesetStore`
  - Call `calculateAgeCategory(athlete.birthDate, athlete.gender, activeRuleset?.categories || [], currentYear)`
  - Update line 249 to display age category alongside birth year (e.g., "U-18 • 2008")

- [x] **Task 2.2:** Add visual styling for age category
  - Use a badge or pill component to highlight the age category
  - Consider color coding (e.g., youth categories in blue, seniors in green)
  - Ensure "Unclassified" is visually distinct (gray/muted)

#### Phase 3: Athlete Form Integration
- [x] **Task 3.1:** Update `AthleteForm.tsx` to display age category
  - Add a read-only field in the Profile tab showing calculated age category
  - Position it near the birth date field (around line 259)
  - Use the same `calculateAgeCategory` utility
  - Display as a non-editable badge/pill with label "Current Age Category"

- [x] **Task 3.2:** Add tournament year toggle (optional enhancement)
  - Add a dropdown in the athlete list header to switch between "Current Year" and future tournament years
  - Add a year selector in the athlete detail modal's age category display
  - Store selected year in local component state
  - Pass selected year to `calculateAgeCategory` as `referenceYear`
  - Update all age category displays when year changes
  - Year options: Current year + next 3 years

#### Phase 4: Store Integration
- [x] **Task 4.1:** Extend `useRulesetStore` with helper method
  - Add `getActiveRuleset()` selector that returns the active ruleset
  - Ensure it returns `undefined` if no active ruleset exists
  - This will be used by both `AthleteList` and `AthleteForm`

- [x] **Task 4.2:** Handle ruleset changes reactively
  - Ensure age categories update when the active ruleset changes
  - Use Zustand's reactive subscriptions to trigger re-renders
  - Test switching between rulesets in Settings and verifying list updates

#### Phase 5: Bug Fix
- [x] **Task 5.1:** Fix `rulesetRepository.getAll()` to load categories
  - Updated `getAll()` to load age categories for each ruleset
  - Previously only `getById()` loaded categories, causing "Unclassified" for all athletes

### Acceptance Criteria

- [x] **AC 1:** Given an athlete with `birthDate: "2008-05-15"` and `gender: "male"`, and an active ruleset with category "U-18 Cadets" (min_age: 15, max_age: 17, gender: M), when viewing the athlete list in 2025, then the age category displays as "U-18 Cadets" (athlete is 17 years old on Jan 1, 2025)

- [x] **AC 2:** Given an athlete with `birthDate: "2010-03-20"` and `gender: "female"`, and an active ruleset with no matching female categories for age 15, when viewing the athlete list, then the age category displays as "Unclassified"

- [x] **AC 3:** Given an athlete with `birthDate: "2000-12-01"` and `gender: "male"`, and an active ruleset with both "Seniors (M)" (min_age: 21, max_age: 125) and "Open (MIXED)" (min_age: 18, max_age: 125), when calculating age category for 2025, then "Seniors (M)" is selected (exact gender match priority, athlete is 25 years old)

- [x] **AC 4:** When viewing the athlete detail modal (Profile tab), then the calculated age category is displayed as a read-only field near the birth date

- [x] **AC 5:** When the active ruleset is changed in Settings, then all displayed age categories in the athlete list update immediately without requiring a page refresh

- [x] **AC 6:** When toggling between "Current Year (2025)" and "Tournament Year 2026", then age categories recalculate based on the selected reference year. Example: Athlete born 2008 shows "U-18 Cadets" in 2025 (age 17) and "U-21 Juniors" in 2026 (age 18)

- [x] **AC 7:** Given an athlete list with 50+ athletes, when age categories are calculated, then the list renders in under 100ms (performance requirement from architecture)

## Additional Context

### Dependencies
- **Existing:** `useRulesetStore` (already implemented in Story 3.1)
- **Existing:** `Ruleset` and `AgeCategory` schemas (already defined)
- **New:** None - uses existing dependencies

### Testing Strategy

#### Unit Tests
- Create `src/shared/judo/__tests__/calculateAgeCategory.test.ts`
- Test all gender matching scenarios
- Test boundary conditions (min_year, max_year edges)
- Test "Unclassified" scenarios
- Test invalid inputs

#### Integration Tests
- Manually test in the UI:
  1. Create a test ruleset with categories: "U-15" (2010-2012, M), "U-18" (2007-2009, F), "Seniors" (1990-2006, MIXED)
  2. Create test athletes with various birth dates and genders
  3. Verify correct age category displays in both list and detail views
  4. Switch active ruleset and verify updates
  5. Test with no active ruleset (should show "Unclassified")

#### Performance Tests
- Load 100+ athletes and verify list renders quickly
- Use React DevTools Profiler to ensure no unnecessary re-renders
- Verify `useMemo` is used in `AthleteList` to cache calculations

### Notes

- **Reactive Updates:** The age category calculation is pure (no side effects), so it will automatically recalculate when dependencies change (athlete data, active ruleset, reference year)

- **Future Enhancement:** Consider adding a filter dropdown in the athlete list to filter by age category (e.g., "Show only U-18 athletes"). This would be a separate story.

- **Tournament Year Persistence:** If implementing the tournament year toggle, consider whether to persist the selected year in localStorage or keep it as session-only state.

- **Localization:** Age category names come directly from the ruleset, so they can be in any language. No additional localization needed.

- **Edge Case - Multiple Matches:** If an athlete matches multiple categories (e.g., overlapping year ranges), the first exact gender match is returned. If no exact match, the first MIXED match is returned. This is a design decision that may need refinement based on real-world usage.
