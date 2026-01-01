# Tech-Spec: Story 5.2 - Tournament Roster Assembly

**Created:** 2026-01-01  
**Status:** Ready for Development

## Overview

### Problem Statement
After filtering the athlete pool to find eligible candidates, coaches need a way to select specific athletes and assemble them into a tournament roster. Currently, there's no mechanism to mark athletes as "selected" or to view a consolidated roster for a specific tournament. Coaches must manually track selected athletes outside the system, defeating the purpose of the management tool.

### Solution
Implement a roster selection and assembly system that allows coaches to:
1. **Select Athletes** - Checkbox selection on the athlete list
2. **View Roster** - Dedicated "Roster View" panel showing selected athletes
3. **Manage Selection** - Add/remove athletes from the roster
4. **Roster Summary** - Display count and basic statistics of selected athletes

This feature will integrate seamlessly with the existing filter system (Story 5.1) to enable the workflow: Filter → Select → Review Roster.

### Scope (In/Out)

**In:**
- Checkbox selection UI in the athlete list
- "Select All" / "Deselect All" functionality (respecting current filters)
- Roster state management (selected athlete IDs)
- Roster view panel/modal showing selected athletes
- Roster summary statistics (count, gender breakdown, age category distribution)
- "Clear Roster" functionality
- Visual indication of selected athletes in the main list
- Session-based roster (not persisted to database)

**Out:**
- Saving rosters to the database (future enhancement - "Tournament" entity)
- Multiple named rosters (e.g., "Provincial 2026", "National Trials")
- Roster export to Excel/PDF (Story 6.1, 6.2)
- Eligibility conflict detection (Story 5.3)
- Roster templates or presets
- Historical roster tracking
- Athlete assignment to specific weight divisions within the roster

## Context for Development

### Codebase Patterns
- **Architecture:** Electron + React + SQLite (better-sqlite3) + Zustand
- **Styling:** Tailwind CSS with "Midnight Hybrid" theme
- **State Management:** Zustand stores for global state, React state for component-specific state
- **Type Safety:** TypeScript strict mode, Zod schemas for validation
- **UI Patterns:** Modals for CRUD operations, high-density lists for data display

### Files to Reference
- `src/renderer/features/athletes/AthleteList.tsx` - Main list component (will add checkboxes)
- `src/renderer/features/athletes/useAthleteStore.ts` - Athlete state management
- `src/shared/schemas.ts` - Contains `Athlete` type
- `src/renderer/features/settings/useRulesetStore.ts` - Ruleset state (for age categories)

### Technical Decisions

1. **State Management:** Roster selection will be managed in a new Zustand store (`useRosterStore`) to allow access from multiple components and persist across view changes within the session.

2. **Selection Model:** Store selected athlete IDs (not full athlete objects) to avoid data duplication and ensure roster always reflects current athlete data.

3. **Roster View UI:** Implement as a slide-out panel (drawer) from the right side of the screen, similar to the detail drawer pattern. This allows coaches to keep the main list visible while reviewing the roster.

4. **"Select All" Behavior:** "Select All" will only select athletes currently visible in the filtered list, not the entire database. This allows coaches to filter first, then select all matching athletes.

5. **Roster Persistence:** For MVP, rosters will be session-only (cleared on app restart). Future enhancement will add database persistence with named tournaments.

6. **Visual Feedback:** Selected athletes will have a distinct visual indicator (checkbox checked, row highlight) in the main list to make selection state obvious.

## Implementation Plan

### Tasks

#### Phase 1: Roster Store Setup
- [ ] **Task 1.1:** Create `useRosterStore.ts`
  - Create new Zustand store in `src/renderer/features/athletes/`
  - State: `selectedAthleteIds: number[]`
  - Actions:
    - `addAthlete(id: number)` - Add athlete to roster
    - `removeAthlete(id: number)` - Remove athlete from roster
    - `toggleAthlete(id: number)` - Toggle selection state
    - `addMultiple(ids: number[])` - Add multiple athletes (for "Select All")
    - `clearRoster()` - Clear all selections
    - `isSelected(id: number): boolean` - Check if athlete is selected

- [ ] **Task 1.2:** Add TypeScript types
  - Define `RosterState` interface
  - Export store type for use in components

#### Phase 2: Selection UI in Athlete List
- [ ] **Task 2.1:** Add checkbox column to athlete list
  - Add new column at the start of the table (before "Athlete Identity")
  - Render checkbox for each row
  - Bind checkbox to `useRosterStore` state
  - Use `toggleAthlete` on checkbox change
  - Add visual highlight to selected rows (e.g., light blue background)

- [ ] **Task 2.2:** Add "Select All" checkbox in table header
  - Add checkbox in the header row of the new column
  - Implement "Select All" logic:
    - If all visible athletes are selected → uncheck all
    - If some/none are selected → select all visible athletes
  - Use indeterminate state when some (but not all) are selected
  - Call `addMultiple` with filtered athlete IDs

- [ ] **Task 2.3:** Add selection count indicator
  - Display count of selected athletes in the control bar
  - Example: "12 athletes selected" with a badge
  - Position near the filter result count
  - Make it clickable to open the Roster View

#### Phase 3: Roster View Panel
- [ ] **Task 3.1:** Create `RosterView.tsx` component
  - Implement as a slide-out drawer from the right
  - Use similar pattern to `AthleteForm` modal
  - Header: "Tournament Roster" with close button
  - Body: List of selected athletes
  - Footer: Summary statistics and actions

- [ ] **Task 3.2:** Display selected athletes in roster view
  - Fetch full athlete data for selected IDs from `useAthleteStore`
  - Display in a compact list format:
    - Name, gender, age category, weight class, rank
    - Remove button for each athlete
  - Sort by name (alphabetically) by default
  - Handle case when no athletes are selected (empty state message)

- [ ] **Task 3.3:** Add roster summary statistics
  - Calculate and display:
    - Total count: "12 athletes selected"
    - Gender breakdown: "8 Male, 4 Female"
    - Age category distribution: "U-18: 5, U-21: 4, Seniors: 3"
  - Display in a card/panel at the top of the roster view
  - Use visual elements (badges, icons) for clarity

- [ ] **Task 3.4:** Add "Clear Roster" button
  - Button in the footer of the roster view
  - Confirmation dialog: "Are you sure you want to clear the roster?"
  - Call `clearRoster()` on confirm
  - Close the roster view after clearing

#### Phase 4: Integration & UX Polish
- [ ] **Task 4.1:** Add toggle button to open/close roster view
  - Add button in the main control bar (top right)
  - Icon: Clipboard or List icon with badge showing selection count
  - Example: "Roster (12)" with a blue badge
  - Toggle roster view visibility on click

- [ ] **Task 4.2:** Implement keyboard shortcuts
  - `Ctrl/Cmd + A` - Select all visible athletes
  - `Ctrl/Cmd + D` - Deselect all
  - `Escape` - Close roster view
  - Ensure shortcuts don't conflict with browser defaults

- [ ] **Task 4.3:** Add visual feedback for selection actions
  - Toast/notification when athletes are added to roster
  - Example: "5 athletes added to roster"
  - Animate checkbox state changes
  - Highlight newly selected rows briefly

- [ ] **Task 4.4:** Handle edge cases
  - What happens when a selected athlete is deleted from the database?
    - Remove from roster automatically
  - What happens when a selected athlete's data changes?
    - Roster view should reflect updated data (reactive)
  - What happens when filters change?
    - Selection state persists, but "Select All" only affects visible athletes

#### Phase 5: Mobile Responsiveness
- [ ] **Task 5.1:** Optimize roster view for smaller screens
  - Make roster view full-screen on mobile (instead of slide-out)
  - Ensure checkboxes are large enough for touch targets
  - Test on various screen sizes

### Acceptance Criteria

- [ ] **AC 1:** Given the athlete list, when I click the checkbox next to an athlete's name, then that athlete is added to the roster and the checkbox is checked

- [ ] **AC 2:** Given the athlete list with 5 visible athletes (after filtering), when I click "Select All" in the header, then all 5 visible athletes are added to the roster

- [ ] **AC 3:** Given the athlete list with some athletes selected, when I click "Select All" again, then all selected athletes are deselected

- [ ] **AC 4:** Given 12 athletes selected in the roster, when I click the "Roster (12)" button in the control bar, then the Roster View panel opens showing all 12 selected athletes

- [ ] **AC 5:** Given the Roster View is open with 12 selected athletes, when I view the summary statistics, then I see the total count, gender breakdown, and age category distribution

- [ ] **AC 6:** Given the Roster View is open with an athlete in the roster, when I click the "Remove" button next to that athlete, then the athlete is removed from the roster and the checkbox in the main list is unchecked

- [ ] **AC 7:** Given the Roster View is open with 12 athletes, when I click "Clear Roster" and confirm, then all athletes are removed from the roster and the Roster View shows an empty state

- [ ] **AC 8:** Given 5 athletes selected in the roster, when I delete one of those athletes from the database, then the roster automatically updates to show only 4 athletes

- [ ] **AC 9:** Given the athlete list with filters applied (e.g., "Male, U-18"), when I click "Select All", then only the athletes matching the current filters are selected (not the entire database)

## Additional Context

### Dependencies
- **Existing:** `useAthleteStore` (athlete data)
- **Existing:** `useRulesetStore` (age categories for summary)
- **New:** `useRosterStore` (roster selection state)

### Testing Strategy

#### Unit Tests
- Test `useRosterStore` actions:
  - `addAthlete` adds ID to array
  - `removeAthlete` removes ID from array
  - `toggleAthlete` toggles selection state
  - `addMultiple` adds multiple IDs without duplicates
  - `clearRoster` empties the array
  - `isSelected` returns correct boolean

#### Integration Tests
- Manually test in the UI:
  1. Load athlete list with 20+ test athletes
  2. Select individual athletes using checkboxes
  3. Test "Select All" with and without filters
  4. Open Roster View and verify selected athletes are displayed
  5. Remove athletes from roster using the remove button
  6. Verify summary statistics are accurate
  7. Test "Clear Roster" functionality
  8. Delete a selected athlete and verify roster updates
  9. Test keyboard shortcuts
  10. Test on mobile/tablet screen sizes

#### Performance Tests
- Test selection performance with 500+ athletes
- Verify roster view opens quickly even with 50+ selected athletes
- Ensure checkbox state updates are smooth (no lag)

### Notes

- **Future Enhancement - Named Rosters:** In a future story, add the ability to save rosters to the database with names (e.g., "Provincial 2026") and load them later. This will require a new `Tournament` or `Roster` entity.

- **Future Enhancement - Roster Export:** Stories 6.1 and 6.2 will add Excel and PDF export functionality for rosters.

- **Roster Persistence:** For MVP, rosters are session-only. If coaches request persistence, consider adding localStorage as an intermediate solution before implementing full database persistence.

- **Selection Limit:** Consider adding an optional maximum selection limit (e.g., "Max 20 athletes per roster") if tournament rules require it. This can be configured per tournament type.

- **Bulk Actions:** Consider adding bulk actions in the roster view (e.g., "Remove all U-18 athletes", "Remove all females") for advanced roster management.

- **Drag & Drop:** Future enhancement could add drag-and-drop reordering of athletes in the roster view for manual sorting/prioritization.

- **Roster Templates:** Consider adding roster templates (e.g., "Standard Provincial Roster: 2 per weight class") to auto-select athletes based on predefined rules.
