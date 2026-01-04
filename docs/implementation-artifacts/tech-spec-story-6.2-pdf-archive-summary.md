# Tech-Spec: Story E6.S2 - PDF Archive Summary

**Created:** 2026-01-04  
**Status:** Ready for Development  
**Story:** E6.S2 - PDF Archive Summary

## Overview

### Problem Statement

Coaches need a way to generate a comprehensive PDF summary of their athlete pool for offline reference, sharing with other coaches/administrators, and archival purposes. Currently, the only export option is the tournament-specific roster PDF (E6.S1), which is limited to athletes in a specific tournament and grouped by competition categories.

The coach should be able to:
- Select specific athletes from the filtered list
- Export them to a professional PDF document
- Include all athlete data fields for complete reference
- Maintain the current sort order from the UI

### Solution

Implement a multi-select mechanism in the Athlete List page that allows coaches to:
1. Select individual athletes via checkboxes
2. Select all filtered athletes with a single action
3. Export selected athletes to a PDF with a comprehensive data table
4. Generate a PDF that respects the current page order and includes all athlete fields

The PDF will be a simple, readable table format (not grouped by categories) suitable for offline study, sharing, and archival.

### Scope (In/Out)

**In Scope:**
- Multi-select checkbox UI in Athlete List
- "Select All" functionality for filtered athletes
- "Export Selected PDF" button (visible when athletes are selected)
- Backend IPC handler for athlete summary PDF generation
- PDF generation with all athlete fields in table format
- File save dialog with default filename
- Maintain current sort order from UI

**Out of Scope:**
- Exporting ALL athletes without selection (can use "Select All" for this)
- Custom column selection (include all fields by default)
- PDF grouping/categorization (simple table only)
- Excel/CSV export (separate story if needed)
- Printing directly to printer (PDF only)

## Context for Development

### Codebase Patterns

1. **IPC Communication Pattern:**
   ```typescript
   // Main Process Handler
   ipcMain.handle('namespace:methodName', async (event, ...args) => {
     try {
       // Logic
       return { success: true, data: result };
     } catch (error) {
       return { success: false, error: error.message };
     }
   });
   
   // Preload Exposure
   export: {
     methodName: (args) => ipcRenderer.invoke('namespace:methodName', args)
   }
   
   // Type Definition
   export: {
     methodName: (args: Type) => Promise<{ success: boolean; data?: Type; error?: string }>
   }
   ```

2. **PDF Generation Pattern (from E6.S1):**
   - Use PDFKit with A4 landscape layout
   - Use `dialog.showSaveDialog()` for save location
   - Generate default filename: `{context}_{date}.pdf`
   - Return file path on success
   - Handle pagination automatically
   - Use professional table rendering with headers

3. **State Management:**
   - Use React `useState` for local component state (selection)
   - Use Zustand stores for global data (athletes, clubs, rulesets)
   - Compute derived data in `useMemo` hooks

4. **Data Enhancement:**
   - Athletes from DB have base fields only
   - `enhanceAthlete()` adds computed fields: `weightClass`, `ageCategory`, `clubName`
   - These enhanced fields should be included in PDF

### Files to Reference

**Existing Implementation (E6.S1):**
- `src/main/services/ExportService.ts` - PDF generation patterns, table rendering
- `src/shared/types/electron.d.ts` - IPC type definitions
- `src/main/preload.ts` - IPC exposure patterns

**Component to Modify:**
- `src/renderer/features/athletes/AthleteList.tsx` - Add selection UI

**Repositories:**
- `src/main/repositories/athleteRepository.ts` - Has `findByIds()` method
- `src/main/repositories/clubRepository.ts` - For club name lookup

### Technical Decisions

1. **Selection State Management:**
   - Use local component state (`useState`) for selected athlete IDs
   - Store as `Set<number>` for O(1) lookup performance
   - Convert to array when passing to backend

2. **Data Flow:**
   - Frontend: User selects athletes → clicks export → passes athlete IDs + sort order
   - Backend: Receives IDs → fetches athletes → enhances data → generates PDF
   - Return: File path or error

3. **Sort Order Preservation:**
   - Pass ordered athlete IDs array from frontend to backend
   - Backend uses this order for PDF rendering (don't re-sort)

4. **PDF Layout:**
   - A4 Landscape orientation (more columns fit)
   - Single table with all fields
   - Professional header with title and metadata
   - Automatic pagination
   - Alternating row colors for readability

5. **Column Set:**
   Include all athlete fields:
   - Name, Birth Date, Birth Place, Region
   - Gender, Age Category (computed), Weight, Weight Class (computed)
   - Rank, Club
   - Address, Phone, Email
   - Parent/Guardian, Parent Phone

## Implementation Plan

### Tasks

#### Task 1: Add Multi-Select UI to Athlete List
**File:** `src/renderer/features/athletes/AthleteList.tsx`

- [ ] Add selection state: `const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<number>>(new Set())`
- [ ] Add checkbox column header with "Select All" functionality
- [ ] Add checkbox to each athlete row
- [ ] Implement toggle handlers:
  - `handleToggleAthlete(id: number)` - Toggle individual athlete
  - `handleSelectAll()` - Select all filtered athletes
  - `handleClearSelection()` - Clear all selections
- [ ] Add "Export Selected PDF" button to toolbar (visible when `selectedAthleteIds.size > 0`)
- [ ] Add selection count indicator: "X athletes selected"
- [ ] Implement export handler that calls IPC method with ordered athlete IDs

**UI Placement:**
- Checkbox column: First column in table (before "Athlete Identity")
- Export button: In top toolbar, next to filter controls
- Selection count: Near export button

#### Task 2: Update IPC Type Definitions
**File:** `src/shared/types/electron.d.ts`

- [ ] Add new method to `export` namespace:
  ```typescript
  export: {
    generateRosterPDF: (...) => Promise<...>;
    generateAthleteSummaryPDF: (
      athleteIds: number[]
    ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  }
  ```

#### Task 3: Expose IPC Method in Preload
**File:** `src/main/preload.ts`

- [ ] Add new export method:
  ```typescript
  export: {
    generateRosterPDF: (tournamentId, options) => 
      ipcRenderer.invoke('export:generateRosterPDF', tournamentId, options),
    generateAthleteSummaryPDF: (athleteIds) =>
      ipcRenderer.invoke('export:generateAthleteSummaryPDF', athleteIds)
  }
  ```

#### Task 4: Implement Backend Export Handler
**File:** `src/main/services/ExportService.ts`

- [ ] Add new IPC handler: `ipcMain.handle('export:generateAthleteSummaryPDF', ...)`
- [ ] Implement `getDefaultSummaryFilename()` helper:
  - Format: `Athlete_Summary_{date}.pdf`
  - Example: `Athlete_Summary_2026-01-04.pdf`
- [ ] Implement `generateAthleteSummaryPDF(athleteIds: number[])` function:
  - Validate input (non-empty array, all valid IDs)
  - Fetch athletes using `athleteRepository.findByIds(athleteIds)`
  - Preserve order from input array
  - Fetch clubs for club name lookup
  - Enhance athlete data (add clubName, ageCategory, weightClass)
  - Call PDF generation function
- [ ] Implement `createSummaryPDF(athletes, savePath)` function:
  - Create PDFDocument (A4 landscape)
  - Render header: "Athlete Pool Summary" + generation date
  - Render comprehensive data table with all columns
  - Handle pagination
  - Return promise that resolves when PDF is written

**Column Definitions:**
```typescript
const columns = [
  { key: 'name', label: 'Name', width: 100 },
  { key: 'birthDate', label: 'Birth Date', width: 70 },
  { key: 'birth_place', label: 'Birth Place', width: 80 },
  { key: 'region', label: 'Region', width: 70 },
  { key: 'gender', label: Gender', width: 45 },
  { key: 'ageCategory', label: 'Age Cat.', width: 60 },
  { key: 'weight', label: 'Weight', width: 50 },
  { key: 'weightClass', label: 'Class', width: 50 },
  { key: 'rank', label: 'Rank', width: 60 },
  { key: 'clubName', label: 'Club', width: 80 },
  { key: 'phone', label: 'Phone', width: 80 },
  { key: 'email', label: 'Email', width: 100 },
  { key: 'parent_guardian', label: 'Parent', width: 80 },
  { key: 'parent_phone', label: 'Parent Phone', width: 80 }
];
```

#### Task 5: Handle Edge Cases & Validation

- [ ] Frontend validation: Disable export button if no athletes selected
- [ ] Backend validation: Return error if athlete IDs array is empty
- [ ] Backend validation: Return error if no athletes found for given IDs
- [ ] Handle missing data gracefully (empty strings for optional fields)
- [ ] Handle active ruleset not found (use empty categories array)
- [ ] Add loading state to export button during PDF generation

### Acceptance Criteria

- [ ] **AC1:** Given the Athlete List page is loaded, when I view the table, then I see a checkbox column as the first column with a "Select All" checkbox in the header

- [ ] **AC2:** Given athletes are displayed, when I click an individual checkbox, then that athlete is selected and the selection count updates

- [ ] **AC3:** Given multiple athletes are displayed, when I click "Select All" in the header, then all currently filtered athletes are selected

- [ ] **AC4:** Given some athletes are selected, when I click "Select All" again, then all athletes are deselected

- [ ] **AC5:** Given at least one athlete is selected, when I view the toolbar, then I see an "Export Selected PDF" button

- [ ] **AC6:** Given no athletes are selected, when I view the toolbar, then the export button is not visible

- [ ] **AC7:** Given I have selected athletes and applied filters, when I click "Export Selected PDF", then a file save dialog appears with default filename "Athlete_Summary_YYYY-MM-DD.pdf"

- [ ] **AC8:** Given I select a save location, when the PDF is generated, then it contains all selected athletes in the same order as displayed on the page

- [ ] **AC9:** Given the PDF is generated, when I open it, then I see a professional table with all athlete fields: name, birth date, birth place, region, gender, age category, weight, weight class, rank, club, phone, email, parent/guardian, parent phone

- [ ] **AC10:** Given the PDF contains many athletes, when it exceeds one page, then pagination works correctly and the table header repeats on each page

- [ ] **AC11:** Given I have sorted athletes by rank, when I export to PDF, then the PDF maintains the same rank-based order

- [ ] **AC12:** Given the export fails (e.g., disk full), when the error occurs, then I see a user-friendly error message

## Additional Context

### Dependencies

**Existing:**
- `pdfkit` - Already installed for E6.S1
- `@types/pdfkit` - TypeScript definitions
- `electron` - For dialog and IPC
- `better-sqlite3` - Database access

**No new dependencies required.**

### Testing Strategy

**Manual Testing:**
1. **Selection Functionality:**
   - Test individual checkbox selection
   - Test "Select All" with various filter combinations
   - Test selection persistence when changing filters
   - Test selection count accuracy

2. **Export Functionality:**
   - Test export with 1 athlete
   - Test export with 10 athletes
   - Test export with 100+ athletes (pagination)
   - Test export with different sort orders
   - Test export with athletes from different clubs
   - Test export with missing optional fields

3. **Edge Cases:**
   - Test with no active ruleset
   - Test with athletes without clubs
   - Test with very long names/addresses
   - Test canceling save dialog
   - Test saving to read-only location (error handling)

**Integration Testing:**
- Verify IPC communication works correctly
- Verify PDF file is created at selected location
- Verify PDF opens in standard PDF readers
- Verify all data is accurate and complete

### Notes

**Design Considerations:**

1. **Why Multi-Select Instead of "Export All"?**
   - Gives users control over what to export
   - Allows exporting specific subsets without changing filters
   - Consistent with tournament roster selection UX
   - Can still export all by using "Select All"

2. **Why Pass IDs Instead of Full Data?**
   - Keeps IPC payload small
   - Ensures backend fetches fresh data from DB
   - Maintains single source of truth
   - Simplifies frontend logic

3. **Why Include All Fields?**
   - User story says "full summary" and "all athlete list data"
   - Offline reference should be comprehensive
   - Landscape orientation provides enough space
   - Users can print/crop as needed

4. **Order Preservation:**
   - Frontend passes ordered array of IDs
   - Backend maintains this order (no re-sorting)
   - Respects user's chosen sort column/direction
   - Provides predictable output

**Performance Considerations:**

- Selection state uses `Set<number>` for O(1) lookup
- PDF generation is async (doesn't block UI)
- Loading state prevents duplicate exports
- Efficient database query with `findByIds()`

**Future Enhancements (Out of Scope):**

- Custom column selection
- Export to Excel/CSV
- Batch export (multiple PDFs)
- Email PDF directly
- Cloud backup integration
- Print preview before save
