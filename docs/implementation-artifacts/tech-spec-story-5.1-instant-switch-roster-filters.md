# Tech-Spec: Story 5.1 - Instant-Switch Roster Filters

**Created:** 2026-01-01  
**Status:** ✅ Complete

## Overview

### Problem Statement
Coaches need to quickly filter the athlete pool by Gender, Age Category, and Weight Class to identify tournament-eligible candidates. Currently, the athlete list has basic filtering (name search, rank, club), but lacks the critical filters needed for roster assembly. Manually scanning through hundreds of athletes to find eligible fighters for specific tournament slots is time-consuming and error-prone.

### Solution
Enhance the existing `AthleteList.tsx` component with three additional high-performance filters:
1. **Gender Filter** - Toggle between Male, Female, or All
2. **Age Category Filter** - Multi-select dropdown based on active ruleset categories
3. **Weight Class Filter** - Multi-select dropdown for weight divisions

All filters must update the list in **<100ms** (per PRD performance requirement) and work seamlessly with existing filters (name search, rank, club, tournament year).

### Scope (In/Out)

**In:**
- Gender filter toggle (Male/Female/All) in the control bar
- Age Category multi-select filter based on active ruleset
- Weight Class multi-select filter (using weight divisions from rulesets)
- Performance optimization to ensure <100ms filter response
- Filter state persistence in component state (session-only)
- Visual indicator showing active filters and result count
- Integration with existing filters (name, rank, club, year)

**Out:**
- Saving filter preferences to localStorage (future enhancement)
- Advanced filter combinations (e.g., "Male U-18 AND -60kg")
- Filter presets or saved searches
- Weight class calculation logic (will use placeholder until Story 5.3 implements proper weight categories)
- Roster selection UI (Story 5.2)
- Eligibility conflict detection (Story 5.3)

## Context for Development

### Codebase Patterns
- **Architecture:** Electron + React + SQLite (better-sqlite3) + Zustand
- **Styling:** Tailwind CSS with "Midnight Hybrid" theme
- **State Management:** Zustand stores (`useAthleteStore`, `useRulesetStore`)
- **Performance:** Client-side filtering with `useMemo` for memoization
- **Type Safety:** TypeScript strict mode, Zod schemas for validation

### Files to Reference
- `src/renderer/features/athletes/AthleteList.tsx` - Main list component (lines 84-125 show existing filter logic)
- `src/shared/schemas.ts` - Contains `Athlete`, `AgeCategory`, `Ruleset` types
- `src/shared/judo/calculateAgeCategory.ts` - Age category calculation utility
- `src/renderer/features/settings/useRulesetStore.ts` - Ruleset state management
- `src/shared/types/domain.ts` - Domain enums (Rank, ActivityStatus)

### Technical Decisions

1. **Client-Side Filtering:** All filtering will be done in-memory on the client side using `useMemo` to ensure <100ms performance. With expected athlete pools of <1,000 records, this approach is more than sufficient.

2. **Filter State Management:** Filter state will be stored in local component state (React `useState`) rather than Zustand global state, as filters are view-specific and don't need to persist across navigation.

3. **Multi-Select Pattern:** Age Category and Weight Class filters will use multi-select dropdowns (checkboxes) to allow coaches to select multiple categories at once (e.g., "U-18 AND U-21").

4. **Gender Filter UI:** Simple three-button toggle (Male | Female | All) for quick switching, positioned prominently in the control bar.

5. **Weight Class Placeholder:** Since weight categories aren't fully implemented yet, we'll use a simple weight-based grouping (e.g., "-60kg", "-66kg", "-73kg", etc.) based on common IJF divisions. This will be replaced when proper weight category logic is implemented.

6. **Performance Optimization:** Use `useMemo` for both filter computation and athlete enhancement to prevent unnecessary recalculations. Ensure the `enhanceAthlete` callback is memoized with proper dependencies.

## Implementation Plan

### Tasks

#### Phase 1: Gender Filter
- [x] **Task 1.1:** Add gender filter state
  - Add `genderFilter` state: `useState<'all' | 'male' | 'female'>('all')`
  - Initialize to 'all' (show all athletes)

- [x] **Task 1.2:** Create Gender Toggle Component
  - Create a three-button toggle group in the control bar
  - Use Tailwind for styling (similar to existing filter controls)
  - Buttons: "All" | "Male" | "Female"
  - Active button should have distinct visual state (blue background)
  - Position after the search bar, before rank/club filters

- [x] **Task 1.3:** Integrate gender filter into `filteredAthletes` logic
  - Update the filter logic in `useMemo` (around line 84-93)
  - Add condition: `const matchesGender = genderFilter === 'all' || athlete.gender === genderFilter`
  - Combine with existing filters using AND logic

#### Phase 2: Age Category Filter
- [x] **Task 2.1:** Add age category filter state
  - Add `ageCategoryFilter` state: `useState<string[]>([])`
  - Empty array means "show all categories"

- [x] **Task 2.2:** Extract available age categories from active ruleset
  - Create `useMemo` to get unique age category names from `activeRuleset?.categories`
  - Consider the selected `referenceYear` when determining categories
  - Return array of category names (e.g., ["U-15", "U-18", "U-21", "Seniors"])

- [x] **Task 2.3:** Create Age Category Multi-Select Dropdown
  - Use a custom dropdown component with checkboxes
  - Display category names with count of matching athletes (e.g., "U-18 (12)")
  - "Select All" / "Clear All" buttons at the top
  - Position in the control bar after gender filter

- [x] **Task 2.4:** Integrate age category filter into `filteredAthletes` logic
  - Add condition: `const matchesAgeCategory = ageCategoryFilter.length === 0 || ageCategoryFilter.includes(athlete.ageCategory)`
  - Combine with existing filters

#### Phase 3: Weight Class Filter
- [x] **Task 3.1:** Add weight class filter state
  - Add `weightClassFilter` state: `useState<string[]>([])`
  - Empty array means "show all weight classes"

- [x] **Task 3.2:** Define weight class divisions (placeholder)
  - Create constant array of common IJF weight divisions:
    - Male: ["-60kg", "-66kg", "-73kg", "-81kg", "-90kg", "-100kg", "+100kg"]
    - Female: ["-48kg", "-52kg", "-57kg", "-63kg", "-70kg", "-78kg", "+78kg"]
  - Use gender-specific divisions based on athlete gender

- [x] **Task 3.3:** Enhance `enhanceAthlete` to calculate weight class
  - Update the `weightClass` calculation (currently line 69)
  - Map athlete weight to the appropriate division
  - Example: weight=65 → "-66kg" for males, "-70kg" for females
  - Handle edge cases (weight=0 or missing → "Unclassified")

- [x] **Task 3.4:** Create Weight Class Multi-Select Dropdown
  - Similar to age category dropdown with checkboxes
  - Display weight class with count (e.g., "-60kg (8)")
  - Filter divisions by current gender filter (if active)
  - Position in the control bar after age category filter

- [x] **Task 3.5:** Integrate weight class filter into `filteredAthletes` logic
  - Add condition: `const matchesWeightClass = weightClassFilter.length === 0 || weightClassFilter.includes(athlete.weightClass)`
  - Combine with existing filters

#### Phase 4: UI Polish & Performance
- [x] **Task 4.1:** Add active filter indicators
  - Show visual badges for active filters (e.g., "Gender: Male", "Age: U-18, U-21")
  - Add "Clear All Filters" button when any filter is active
  - Position below the control bar or integrate into the result count area

- [x] **Task 4.2:** Optimize filter performance
  - Verify `useMemo` dependencies are correct to prevent unnecessary recalculations
  - Use React DevTools Profiler to measure filter performance
  - Ensure <100ms response time with 500+ athletes
  - Consider using `useCallback` for filter handlers

- [x] **Task 4.3:** Add filter result summary
  - Update the "Showing X of Y" text to include filter context
  - Example: "Showing 12 of 150 (Filtered: Male, U-18, -60kg)"
  - Make it clear when filters are active vs. showing all

- [x] **Task 4.4:** Improve mobile responsiveness
  - Ensure filter controls wrap gracefully on smaller screens
  - Consider collapsible filter panel for mobile
  - Test on various screen sizes

### Acceptance Criteria

- [x] **AC 1:** Given the athlete list with 50+ athletes, when I click the "Male" gender filter, then only male athletes are displayed in <100ms

- [x] **AC 2:** Given the athlete list, when I select "U-18" from the age category filter, then only athletes in the U-18 category (based on the selected reference year) are displayed

- [x] **AC 3:** Given the athlete list, when I select multiple age categories (e.g., "U-18" AND "U-21"), then athletes from both categories are displayed

- [x] **AC 4:** Given the athlete list with gender filter set to "Male", when I open the weight class filter, then only male weight divisions are shown in the dropdown

- [x] **AC 5:** Given the athlete list with active filters (Gender: Male, Age: U-18), when I click "Clear All Filters", then all filters reset and the full athlete list is displayed

- [x] **AC 6:** Given the athlete list with 500+ athletes and multiple active filters, when I change any filter, then the list updates in <100ms (performance requirement)

- [x] **AC 7:** Given the athlete list with active filters, when I view the result count, then it clearly indicates which filters are active (e.g., "Showing 12 of 150 - Male, U-18, -60kg")

- [x] **AC 8:** Given the athlete list, when I combine all filters (name search, gender, age category, weight class, rank, club), then all filters work together correctly with AND logic

## Additional Context

### Dependencies
- **Existing:** `useAthleteStore` (athlete data)
- **Existing:** `useRulesetStore` (age categories)
- **Existing:** `calculateAgeCategory` utility (age calculation)
- **New:** None - uses existing dependencies

### Testing Strategy

#### Unit Tests
- Test filter logic in isolation:
  - Gender filter with various athlete datasets
  - Age category filter with multiple selections
  - Weight class filter with edge cases (missing weight, 0 weight)
  - Combined filters (all filters active)

#### Integration Tests
- Manually test in the UI:
  1. Load athlete list with 50+ test athletes (various genders, ages, weights)
  2. Test each filter individually
  3. Test filter combinations
  4. Test "Clear All Filters" functionality
  5. Verify result count accuracy
  6. Test with no active ruleset (age categories should show "Unclassified")

#### Performance Tests
- Load 500+ athletes and measure filter response time
- Use browser DevTools Performance tab to profile filter operations
- Verify <100ms requirement is met
- Test on lower-end hardware if possible

### Notes

- **Filter Persistence:** Currently filters reset on component unmount. Consider adding localStorage persistence in a future enhancement if coaches request it.

- **Weight Class Placeholder:** The weight class divisions used in this story are placeholders. When proper weight category logic is implemented (with ruleset-based weight divisions), this will need to be refactored to use the same pattern as age categories.

- **Multi-Select UX:** Consider using a library like `react-select` or building a custom multi-select component with checkboxes for better UX. The current implementation will use a simple custom dropdown.

- **Filter Combinations:** All filters use AND logic (e.g., "Male AND U-18 AND -60kg"). OR logic within a filter type (e.g., "U-18 OR U-21") is supported via multi-select.

- **Accessibility:** Ensure all filter controls are keyboard-accessible and have proper ARIA labels for screen readers.

- **Future Enhancement:** Consider adding filter presets (e.g., "Save Current Filters as 'Tournament 2026 Males'") for frequently used filter combinations.
