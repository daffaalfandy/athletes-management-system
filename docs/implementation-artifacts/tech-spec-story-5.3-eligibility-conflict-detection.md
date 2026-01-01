# Tech-Spec: Story 5.3 - Eligibility Conflict Detection

**Created:** 2026-01-01  
**Status:** Ready for Development

## Overview

### Problem Statement
When assembling tournament rosters, coaches can accidentally select athletes who don't meet the eligibility criteria for their assigned category. Common conflicts include:
- **Age Mismatch:** Athlete's age doesn't match the tournament's age category requirements
- **Weight Mismatch:** Athlete's current weight exceeds or is below the weight class limit
- **Rank Mismatch:** Athlete's rank doesn't meet minimum requirements for certain divisions

Without automatic conflict detection, these errors are only discovered during tournament registration, leading to rejections, last-minute substitutions, and administrative headaches.

### Solution
Implement an intelligent eligibility validation system that:
1. **Detects Conflicts** - Automatically validates each selected athlete against tournament eligibility rules
2. **Visual Warnings** - Displays red badges/icons next to athletes with conflicts
3. **Conflict Details** - Shows specific reasons for ineligibility (e.g., "Weight exceeds -60kg limit by 3kg")
4. **Prevents Submission** - Optionally blocks roster finalization until conflicts are resolved

The system will validate against:
- Age category rules (based on active ruleset and tournament year)
- Weight class limits (when proper weight categories are implemented)
- Rank requirements (if configured in rulesets)

### Scope (In/Out)

**In:**
- Age category eligibility validation
- Weight class eligibility validation (using placeholder weight divisions from Story 5.1)
- Visual conflict indicators (red badges, warning icons)
- Conflict detail tooltips/popovers
- Conflict summary in Roster View
- Warning persistence until conflict is resolved
- Client-side validation (no database changes)

**Out:**
- Rank-based eligibility rules (future enhancement)
- Custom eligibility rules per tournament type (future enhancement)
- Automatic conflict resolution suggestions (e.g., "Move to -66kg instead")
- Historical conflict tracking
- Email/notification alerts for conflicts
- Eligibility rule configuration UI (will use hardcoded rules for MVP)
- Database persistence of conflict states

## Context for Development

### Codebase Patterns
- **Architecture:** Electron + React + SQLite (better-sqlite3) + Zustand
- **Styling:** Tailwind CSS with "Midnight Hybrid" theme
- **State Management:** Zustand stores (`useAthleteStore`, `useRulesetStore`, `useRosterStore`)
- **Business Logic:** Shared utilities in `src/shared/judo/` for Judo-specific rules
- **Type Safety:** TypeScript strict mode, Zod schemas for validation

### Files to Reference
- `src/renderer/features/athletes/AthleteList.tsx` - Main list component (will add conflict indicators)
- `src/renderer/features/athletes/useRosterStore.ts` - Roster state (from Story 5.2)
- `src/shared/judo/calculateAgeCategory.ts` - Age category calculation
- `src/shared/schemas.ts` - Contains `Athlete`, `AgeCategory` types
- `src/renderer/features/settings/useRulesetStore.ts` - Ruleset state

### Technical Decisions

1. **Validation Logic Location:** Create a new shared utility `src/shared/judo/validateEligibility.ts` to centralize all eligibility validation logic, following the project pattern of isolating Judo rules.

2. **Conflict Data Structure:** Define a `EligibilityConflict` type:
   ```typescript
   type ConflictType = 'age' | 'weight' | 'rank';
   interface EligibilityConflict {
     athleteId: number;
     type: ConflictType;
     severity: 'error' | 'warning';
     message: string;
     details?: string;
   }
   ```

3. **Validation Triggers:** Conflicts will be validated:
   - When an athlete is added to the roster
   - When athlete data changes (weight, birth date, rank)
   - When the active ruleset changes
   - When the tournament year changes

4. **Performance:** Use `useMemo` to cache conflict calculations and only recalculate when dependencies change (athlete data, ruleset, tournament year).

5. **Severity Levels:**
   - **Error (Red):** Hard conflicts that violate tournament rules (e.g., age out of range)
   - **Warning (Yellow):** Soft conflicts that may need review (e.g., weight close to limit)

6. **Weight Class Validation:** For MVP, use the placeholder weight divisions from Story 5.1. When proper weight categories are implemented, this logic will be updated to use ruleset-based weight divisions.

## Implementation Plan

### Tasks

#### Phase 1: Validation Utility
- [ ] **Task 1.1:** Create `validateEligibility.ts`
  - Create new file in `src/shared/judo/`
  - Define `EligibilityConflict` type
  - Export main function: `validateEligibility(athlete: Athlete, ruleset: Ruleset, referenceYear: number): EligibilityConflict[]`

- [ ] **Task 1.2:** Implement age category validation
  - Calculate athlete's age category using `calculateAgeCategory`
  - Check if athlete has a valid age category (not "Unclassified")
  - If "Unclassified", create error conflict:
    - Type: 'age'
    - Severity: 'error'
    - Message: "No matching age category"
    - Details: "Athlete age (X) doesn't match any category in the active ruleset"

- [ ] **Task 1.3:** Implement weight class validation
  - Get athlete's weight class using the same logic from Story 5.1
  - Validate weight is within the weight class limits:
    - For "-60kg" class: weight must be ≤ 60kg
    - For "+100kg" class: weight must be > 100kg
    - For ranges (e.g., "-66kg"): weight must be ≤ 66kg
  - If weight exceeds limit, create error conflict:
    - Type: 'weight'
    - Severity: 'error'
    - Message: "Weight exceeds class limit"
    - Details: "Current weight (65kg) exceeds -60kg limit by 5kg"
  - If weight is within 2kg of limit, create warning conflict:
    - Severity: 'warning'
    - Message: "Weight close to limit"
    - Details: "Current weight (59kg) is 1kg below -60kg limit"

- [ ] **Task 1.4:** Add unit tests for validation logic
  - Test age category validation with various scenarios
  - Test weight class validation with edge cases
  - Test multiple conflicts on a single athlete
  - Test empty conflicts (athlete is fully eligible)

#### Phase 2: Conflict State Management
- [ ] **Task 2.1:** Extend `useRosterStore` with conflict tracking
  - Add state: `conflicts: Map<number, EligibilityConflict[]>`
  - Add action: `validateRoster(athletes: Athlete[], ruleset: Ruleset, referenceYear: number)`
  - Add selector: `getConflicts(athleteId: number): EligibilityConflict[]`
  - Add selector: `hasConflicts(athleteId: number): boolean`
  - Add selector: `getAllConflicts(): EligibilityConflict[]`

- [ ] **Task 2.2:** Implement automatic validation
  - Call `validateRoster` whenever:
    - An athlete is added to the roster
    - The active ruleset changes
    - The tournament year changes
  - Use Zustand subscriptions or React effects to trigger validation
  - Store results in the `conflicts` Map

#### Phase 3: Visual Conflict Indicators
- [ ] **Task 3.1:** Add conflict badge to athlete list
  - In `AthleteList.tsx`, check if athlete has conflicts using `hasConflicts(athlete.id)`
  - If conflicts exist, display a red warning icon/badge next to the athlete name
  - Use Lucide icon: `AlertTriangle` or `AlertCircle`
  - Position in the "Athlete Identity" column, near the name

- [ ] **Task 3.2:** Add conflict tooltip/popover
  - On hover over the conflict badge, show a tooltip with conflict details
  - Display all conflicts for that athlete
  - Format: "⚠️ Age Mismatch: No matching age category (Age 25)"
  - Use Tailwind for styling (red background, white text)

- [ ] **Task 3.3:** Add conflict indicator in Roster View
  - In `RosterView.tsx` (from Story 5.2), display conflicts for each selected athlete
  - Show conflict count badge: "2 conflicts"
  - List all conflicts below the athlete's details
  - Use color coding: Red for errors, Yellow for warnings

- [ ] **Task 3.4:** Add conflict summary in Roster View header
  - Calculate total conflicts across all selected athletes
  - Display in the summary statistics section
  - Example: "⚠️ 3 athletes have eligibility conflicts"
  - Make it prominent (red background, bold text)

#### Phase 4: Conflict Resolution UX
- [ ] **Task 4.1:** Add "Show Only Conflicts" filter
  - Add toggle button in Roster View: "Show Only Conflicts"
  - When enabled, filter the roster list to show only athletes with conflicts
  - Helps coaches quickly identify and fix issues

- [ ] **Task 4.2:** Add conflict resolution hints
  - For weight conflicts, suggest: "Consider moving to -66kg class"
  - For age conflicts, suggest: "Update birth date or check ruleset"
  - Display hints in the conflict tooltip/popover

- [ ] **Task 4.3:** Add "Remove Conflicted Athletes" bulk action
  - Add button in Roster View: "Remove All Conflicted Athletes"
  - Confirmation dialog: "Remove 3 athletes with conflicts?"
  - Removes all athletes with error-level conflicts from the roster

- [ ] **Task 4.4:** Optional: Block roster finalization
  - Add a "Finalize Roster" button in Roster View (placeholder for future export)
  - Disable button if any error-level conflicts exist
  - Show tooltip: "Resolve 3 conflicts before finalizing"
  - Allow warnings to be ignored

#### Phase 5: Testing & Polish
- [ ] **Task 5.1:** Add integration tests
  - Test conflict detection with various athlete/ruleset combinations
  - Test conflict updates when athlete data changes
  - Test conflict clearing when athletes are removed from roster

- [ ] **Task 5.2:** Performance optimization
  - Ensure conflict validation doesn't slow down roster operations
  - Use `useMemo` to cache conflict calculations
  - Verify <100ms performance with 50+ athletes in roster

- [ ] **Task 5.3:** Accessibility improvements
  - Ensure conflict indicators are keyboard-accessible
  - Add ARIA labels for screen readers
  - Use semantic HTML for conflict messages

### Acceptance Criteria

- [ ] **AC 1:** Given an athlete with birth date "2010-05-15" (age 15 in 2025) and an active ruleset with no matching category for age 15, when the athlete is added to the roster, then a red conflict badge is displayed next to the athlete's name with message "No matching age category"

- [ ] **AC 2:** Given an athlete with weight 65kg assigned to the "-60kg" weight class, when the athlete is added to the roster, then a red conflict badge is displayed with message "Weight exceeds class limit by 5kg"

- [ ] **AC 3:** Given an athlete with weight 59kg assigned to the "-60kg" weight class, when the athlete is added to the roster, then a yellow warning badge is displayed with message "Weight close to limit (1kg below)"

- [ ] **AC 4:** Given an athlete with multiple conflicts (age + weight), when I hover over the conflict badge, then a tooltip displays all conflicts for that athlete

- [ ] **AC 5:** Given a roster with 12 athletes where 3 have conflicts, when I open the Roster View, then the summary shows "⚠️ 3 athletes have eligibility conflicts"

- [ ] **AC 6:** Given a roster with conflicts, when I toggle "Show Only Conflicts", then only athletes with conflicts are displayed in the Roster View

- [ ] **AC 7:** Given a roster with 3 athletes having error-level conflicts, when I click "Remove All Conflicted Athletes" and confirm, then those 3 athletes are removed from the roster

- [ ] **AC 8:** Given an athlete in the roster with a weight conflict, when I update the athlete's weight to a valid value, then the conflict badge disappears automatically

- [ ] **AC 9:** Given a roster with error-level conflicts, when I attempt to finalize the roster, then the "Finalize Roster" button is disabled with a tooltip explaining the conflicts must be resolved

## Additional Context

### Dependencies
- **Existing:** `useAthleteStore` (athlete data)
- **Existing:** `useRulesetStore` (ruleset data)
- **Existing:** `useRosterStore` (roster selection - from Story 5.2)
- **Existing:** `calculateAgeCategory` (age calculation)
- **New:** `validateEligibility` utility (eligibility validation)

### Testing Strategy

#### Unit Tests
- Create `src/shared/judo/__tests__/validateEligibility.test.ts`
- Test age category validation:
  - Valid age category → no conflicts
  - "Unclassified" age → error conflict
  - Edge cases (age exactly at min/max)
- Test weight class validation:
  - Weight within limit → no conflicts
  - Weight exceeds limit → error conflict
  - Weight close to limit → warning conflict
  - Edge cases (weight exactly at limit)
- Test multiple conflicts on a single athlete

#### Integration Tests
- Manually test in the UI:
  1. Create test athletes with various conflicts:
     - Athlete A: Age 25, no matching category
     - Athlete B: Weight 65kg, assigned to -60kg class
     - Athlete C: Weight 59kg, assigned to -60kg class (warning)
     - Athlete D: Valid age and weight (no conflicts)
  2. Add all athletes to roster
  3. Verify conflict badges appear correctly
  4. Hover over badges and verify tooltips
  5. Open Roster View and verify conflict summary
  6. Test "Show Only Conflicts" filter
  7. Update Athlete B's weight to 58kg and verify conflict clears
  8. Test "Remove All Conflicted Athletes"
  9. Test "Finalize Roster" button state

#### Performance Tests
- Load roster with 50+ athletes (mix of conflicted and valid)
- Measure conflict validation time
- Verify <100ms performance requirement
- Test conflict updates when changing ruleset or tournament year

### Notes

- **Future Enhancement - Custom Rules:** Add UI to configure custom eligibility rules per tournament type (e.g., "Provincial requires minimum Green belt").

- **Future Enhancement - Rank Validation:** Extend validation to check rank requirements when rulesets support rank-based eligibility.

- **Future Enhancement - Auto-Fix:** Add "Auto-Fix" button that automatically adjusts athlete assignments to resolve conflicts (e.g., move athlete to next weight class up).

- **Weight Class Placeholder:** This story uses the placeholder weight divisions from Story 5.1. When proper weight categories are implemented in rulesets, update the validation logic to use ruleset-based weight divisions.

- **Conflict Persistence:** Conflicts are calculated on-demand and not persisted to the database. They are recalculated whenever dependencies change.

- **Severity Levels:** For MVP, only two severity levels (error, warning) are implemented. Future enhancements could add "info" level for informational messages.

- **Conflict History:** Consider adding conflict history tracking (e.g., "This athlete had a weight conflict on 2025-12-15") for audit purposes.

- **Batch Validation:** For large rosters, consider implementing batch validation with progress indicator to avoid UI freezing.

- **Conflict Export:** When implementing roster export (Stories 6.1, 6.2), include conflict information in the exported files for review.
