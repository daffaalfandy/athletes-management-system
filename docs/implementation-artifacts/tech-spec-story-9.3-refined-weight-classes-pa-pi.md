# Tech-Spec: Refined Weight Classes (Pa/Pi)

**Created:** 2026-01-08  
**Status:** Implementation Complete  
**Story:** E9.S3 - Refined Weight Classes (Pa/Pi)

## Overview

### Problem Statement

The current weight class system uses generic divisions that don't match the official Pa (Male) and Pi (Female) weight classes used in Indonesian Judo competitions. The filter options need to be updated to provide accurate roster selection with proper gender-specific weight divisions.

Additionally, the current filtering logic is overly simplistic - it only matches athletes whose weight falls exactly within a single weight class, rather than providing range-based filtering that coaches expect.

### Solution

Update the weight class definitions across the application to match official Pa/Pi divisions, add gender labels (Pa/Pi) to weight class displays, implement intelligent auto-filtering that syncs weight class selection with gender filters, and enhance the filtering logic to support range-based weight filtering.

### Scope (In/Out)

**In Scope:**
- Update hardcoded weight class definitions in shared utilities and frontend components
- Add Pa/Pi labels to weight class displays
- Implement auto-sync between weight class and gender filters
- Enhance filtering logic to support range-based weight filtering
- Update weight class calculation in PDF export services
- Update weight class labels in all UI components

**Out of Scope:**
- Database schema changes (weight classes are calculated dynamically)
- Ruleset-based weight class configuration (remaining hardcoded)
- Historical data migration (no stored weight class data)
- Excel export functionality (not currently implemented)

## Context for Development

### Codebase Patterns

**Weight Class Calculation Pattern:**
The application uses a consistent pattern for calculating weight classes:
```typescript
const WEIGHT_DIVISIONS = {
    male: ['-60kg', '-66kg', ...],
    female: ['-48kg', '-52kg', ...]
};

// Iterate through divisions to find matching class
for (const division of divisions) {
    if (division.startsWith('+')) {
        // Handle upper limit (e.g., +100kg)
        const threshold = parseInt(division.substring(1).replace('kg', ''));
        if (weight > threshold) return division;
    } else {
        // Handle upper bound (e.g., -60kg)
        const limit = parseInt(division.substring(1).replace('kg', ''));
        if (weight <= limit) return division;
    }
}
```

**Filter Synchronization Pattern:**
The AthleteList component uses React state hooks with `useMemo` for derived values and filter handlers that update multiple related states.

**Export Service Pattern:**
The ExportService duplicates weight class logic for PDF generation. Both locations must be updated consistently.

### Files to Reference

**Primary Files to Modify:**
1. `src/shared/judo/validateEligibility.ts` - Core weight class definitions and validation logic
2. `src/renderer/features/athletes/AthleteList.tsx` - Frontend weight class filtering and display
3. `src/main/services/ExportService.ts` - PDF export weight class calculation

**Files to Review for Context:**
- `src/shared/schemas.ts` - WeightClass schema (no changes needed)
- `src/renderer/features/tournaments/TournamentDetail.tsx` - Weight class assignment UI
- `src/renderer/components/BeltBadge.tsx` - Example of badge/label component pattern

### Technical Decisions

**Decision 1: Hardcoded vs. Ruleset-Based**
- **Choice:** Remain hardcoded
- **Rationale:** Simpler implementation, faster to develop, matches current architecture pattern
- **Trade-off:** Less flexible for future rule changes, but acceptable for current requirements

**Decision 2: Range-Based Filtering Logic**
- **Choice:** Implement cumulative range filtering
- **Rationale:** Matches coach expectations - selecting "-55kg" should show athletes 50-55kg, not just exactly 55kg
- **Implementation:** Each weight class represents a range from the previous threshold to current threshold

**Decision 3: Pa/Pi Label Display**
- **Choice:** Add gender suffix to all weight class labels
- **Rationale:** Improves clarity, prevents confusion when "All" gender filter is active
- **Format:** "-50kg (Pa)", "-40kg (Pi)"

**Decision 4: Auto-Sync Gender Filter**
- **Choice:** Selecting a Pa weight class auto-sets gender filter to "Male" and vice versa
- **Rationale:** Reduces user clicks, prevents invalid filter combinations
- **Behavior:** Bidirectional sync - gender filter also updates available weight classes

## Implementation Plan

### Phase 1: Update Core Weight Class Definitions

**Task 1.1: Update validateEligibility.ts**
- [x] Replace `WEIGHT_DIVISIONS` constant with new Pa/Pi divisions
- [x] Update `calculateWeightClass()` function to use new divisions
- [x] Ensure validation logic handles new weight ranges correctly

**New Weight Divisions:**
```typescript
const WEIGHT_DIVISIONS = {
    male: ['-50kg', '-55kg', '-60kg', '-66kg', '-73kg', '-81kg', '+81kg', '-90kg', '-100kg', '+100kg'],
    female: ['-40kg', '-44kg', '-48kg', '-52kg', '-57kg', '-63kg', '+63kg', '-70kg', '-78kg', '+78kg'],
};
```

**Task 1.2: Update ExportService.ts**
- [x] Locate weight class calculation in `generateAthleteSummaryPDF()` (lines 557-579)
- [x] Replace hardcoded divisions with new Pa/Pi divisions
- [x] Ensure PDF exports reflect updated weight classes

### Phase 2: Enhance Frontend Filtering Logic

**Task 2.1: Update Weight Class Display with Pa/Pi Labels**
- [x] Create helper function to add gender labels to weight classes
- [x] Update `availableWeightClasses` useMemo to include labels
- [x] Format: `"-50kg (Pa)"`, `"-40kg (Pi)"`

**Task 2.2: Implement Range-Based Filtering**
- [x] Modify `enhanceAthlete()` to calculate weight class using new divisions
- [x] Update filtering logic in `filteredAthletes` useMemo to support range-based matching
- [x] Implement logic:
  - `-50kg (Pa)`: Show athletes with weight ≤ 50kg
  - `-55kg (Pa)`: Show athletes with 50kg < weight ≤ 55kg
  - `+100kg (Pa)`: Show athletes with weight > 100kg

**Task 2.3: Implement Auto-Sync Gender Filter**
- [x] Create new handler `handleWeightClassToggle()` that:
  - Detects if selected weight class is Pa or Pi
  - Auto-sets `genderFilter` to 'male' or 'female' accordingly
- [x] Update `toggleWeightClass()` to call this handler
- [x] Ensure bidirectional sync: changing gender filter clears incompatible weight class selections

### Phase 3: Update UI Components

**Task 3.1: Update MultiSelectDropdown Options**
- [x] Modify weight class options to include Pa/Pi labels
- [x] Ensure labels are displayed consistently in dropdown and active filter badges

**Task 3.2: Update Active Filter Display**
- [x] Verify weight class labels show correctly in active filter indicators
- [x] Test with both single and multiple weight class selections

**Task 3.3: Update Athlete List Display**
- [x] Ensure weight class badge/label in athlete rows shows Pa/Pi suffix
- [x] Verify display in both list view and detail view

### Phase 4: Testing & Validation

**Task 4.1: Unit Testing**
- [x] Test weight class calculation with edge cases (exactly on threshold, between ranges)
- [x] Test filter sync logic (Pa → Male, Pi → Female)
- [x] Test range-based filtering for each weight class

**Task 4.2: Integration Testing**
- [x] Test PDF export with new weight classes
- [x] Test filter combinations (gender + weight + age category)
- [x] Test with "All" gender filter (should show both Pa and Pi classes)

**Task 4.3: UI/UX Testing**
- [x] Verify labels are clear and not truncated
- [x] Test responsive behavior of filter dropdowns
- [x] Verify active filter badges display correctly

## Acceptance Criteria

### AC 1: Weight Class Definitions Updated
**Given** the application is running  
**When** an athlete's weight is calculated  
**Then** it should use the new Pa/Pi weight divisions:
- Male (Pa): -50kg, -55kg, -60kg, -66kg, -73kg, -81kg, +81kg, -90kg, -100kg, +100kg
- Female (Pi): -40kg, -44kg, -48kg, -52kg, -57kg, -63kg, +63kg, -70kg, -78kg, +78kg

### AC 2: Pa/Pi Labels Display Correctly
**Given** the weight class filter dropdown is open  
**When** the user views the options  
**Then** each weight class should include the gender label (Pa or Pi)  
**And** the format should be clear (e.g., "-50kg (Pa)", "-40kg (Pi)")

### AC 3: Auto-Sync Gender Filter
**Given** the user selects a Pa weight class (e.g., "-50kg (Pa)")  
**When** the selection is made  
**Then** the gender filter should automatically change to "Male"  
**And** vice versa for Pi weight classes

### AC 4: Range-Based Filtering - Lower Bound
**Given** the user selects "-50kg (Pa)"  
**When** the filter is applied  
**Then** all male athletes with weight ≤ 50kg should be displayed

### AC 5: Range-Based Filtering - Mid Range
**Given** the user selects "-55kg (Pa)"  
**When** the filter is applied  
**Then** all male athletes with 50kg < weight ≤ 55kg should be displayed

### AC 6: Range-Based Filtering - Upper Bound
**Given** the user selects "+100kg (Pa)"  
**When** the filter is applied  
**Then** all male athletes with weight > 100kg should be displayed

### AC 7: PDF Export Reflects New Weight Classes
**Given** an athlete summary PDF is generated  
**When** the PDF is opened  
**Then** the weight class column should show the new Pa/Pi divisions  
**And** calculations should be accurate

### AC 8: Multiple Weight Class Selection
**Given** the user selects multiple weight classes (e.g., "-50kg (Pa)" and "-55kg (Pa)")  
**When** the filter is applied  
**Then** athletes matching ANY of the selected ranges should be displayed  
**And** the ranges should be cumulative (e.g., ≤50kg OR 50-55kg = ≤55kg)

## Additional Context

### Dependencies

**No New Dependencies Required**
- All changes use existing libraries and patterns
- React hooks, TypeScript, and existing utility functions

### Testing Strategy

**Manual Testing Checklist:**
1. Create test athletes with weights at exact thresholds (50kg, 55kg, 100kg, etc.)
2. Create test athletes with weights between thresholds (52kg, 67kg, etc.)
3. Test each weight class filter individually
4. Test combinations of weight class filters
5. Test auto-sync behavior with gender filter
6. Generate PDF exports and verify weight class labels
7. Test with "All" gender filter to ensure both Pa and Pi classes appear

**Edge Cases to Test:**
- Athlete with weight = 0 (should show "Unclassified")
- Athlete with weight exactly on threshold (e.g., 50.0kg)
- Athlete with weight slightly above threshold (e.g., 50.1kg)
- Multiple weight class selections with overlapping ranges
- Switching between gender filters with active weight class selections

### Implementation Notes

**Range Calculation Logic:**
```typescript
// Helper to get weight range for a division
function getWeightRange(division: string, allDivisions: string[]): { min: number; max: number } {
    const currentIndex = allDivisions.indexOf(division);
    
    if (division.startsWith('+')) {
        // Upper limit: e.g., +100kg means > 100
        const threshold = parseInt(division.substring(1).replace('kg', ''));
        return { min: threshold, max: Infinity };
    } else {
        // Upper bound: e.g., -55kg means <= 55
        const max = parseInt(division.substring(1).replace('kg', ''));
        
        // Find previous threshold
        let min = 0;
        if (currentIndex > 0) {
            const prevDivision = allDivisions[currentIndex - 1];
            if (prevDivision.startsWith('+')) {
                min = parseInt(prevDivision.substring(1).replace('kg', ''));
            } else {
                min = parseInt(prevDivision.substring(1).replace('kg', ''));
            }
        }
        
        return { min, max };
    }
}

// Filter logic
const matchesWeightClass = weightClassFilter.length === 0 || weightClassFilter.some(selectedClass => {
    const range = getWeightRange(selectedClass, WEIGHT_DIVISIONS[athlete.gender]);
    return athlete.weight > range.min && athlete.weight <= range.max;
});
```

**Gender Label Helper:**
```typescript
function addGenderLabel(weightClass: string, gender: 'male' | 'female'): string {
    const label = gender === 'male' ? 'Pa' : 'Pi';
    return `${weightClass} (${label})`;
}
```

**Auto-Sync Handler:**
```typescript
const handleWeightClassToggle = (weightClass: string) => {
    // Extract gender from label
    const isPa = weightClass.includes('(Pa)');
    const isPi = weightClass.includes('(Pi)');
    
    // Auto-sync gender filter
    if (isPa && genderFilter !== 'male') {
        setGenderFilter('male');
    } else if (isPi && genderFilter !== 'female') {
        setGenderFilter('female');
    }
    
    // Toggle weight class
    toggleWeightClass(weightClass);
};
```

### Notes

- **Backward Compatibility:** No database changes means existing data continues to work
- **Performance:** Range-based filtering is still O(n) per athlete, no performance impact
- **UX Improvement:** Auto-sync reduces clicks and prevents invalid filter states
- **Future Enhancement:** If weight classes need to become configurable, this hardcoded approach can be migrated to ruleset-based configuration later

---

## Files to Modify Summary

| File | Changes | Complexity |
|------|---------|------------|
| `src/shared/judo/validateEligibility.ts` | Update WEIGHT_DIVISIONS constant | Low |
| `src/renderer/features/athletes/AthleteList.tsx` | Update divisions, add labels, implement range filtering, auto-sync | Medium |
| `src/main/services/ExportService.ts` | Update WEIGHT_DIVISIONS in PDF generation | Low |

**Estimated Effort:** 3-4 hours  
**Risk Level:** Low (no database changes, isolated to filtering logic)
