---
title: 'School-Based Roster Export'
slug: 'school-based-roster-export'
created: '2026-01-10'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Electron ^30.0.0', 'React ^18.3.0', 'TypeScript', 'PDFKit', 'Zustand ^4.5.0', 'better-sqlite3']
files_to_modify:
  - 'src/main/services/ExportService.ts'
  - 'src/renderer/features/tournaments/TournamentDetail.tsx'
  - 'src/renderer/features/tournaments/TournamentList.tsx'
code_patterns:
  - 'IPC handler pattern with namespace (export:generateRosterPDF)'
  - 'ExportOptions interface with includeColumns array'
  - 'Optional columns map in renderAthleteTable()'
  - 'Response wrapper { success, data?, error? }'
test_patterns: ['Manual testing for PDF export functionality']
---

# Tech-Spec: Story E9.S8 - School-Based Roster Export

**Created:** 2026-01-10
**Status:** Ready for Development
**Story:** E9.S8 - School-Based Roster Export

## Overview

### Problem Statement

When exporting rosters for student tournaments (e.g., POPDA, KOSN, O2SN), coaches need academic data (School Name, NISN, NIK) included in the PDF. Currently, the roster PDF export only includes basic athlete data (Name, Birth Date, Gender, Weight, Belt). For school-based tournaments, registration documents require student identification numbers (NISN, NIK) and school information to verify athlete eligibility.

### Solution

Add a "School Based Tournament" checkbox toggle in the roster export UI. When checked, the PDF export includes School Name, NISN, and NIK columns for every athlete. When unchecked, these columns are hidden to keep the layout clean and focused on competition-relevant data.

### Scope

**In Scope:**

- Add school columns (`school_name`, `nisn`, `nik`) to `optionalColumns` in ExportService
- Add "School Based Tournament" checkbox in export UI (TournamentDetail and TournamentList)
- Pass selected columns to `generateRosterPDF()` when checkbox is checked
- Maintain clean layout when unchecked (existing behavior)

**Out of Scope:**

- Excel export (PDF only for this story)
- New database fields (already exist from Story E9.S4)
- Athlete Summary PDF modifications (E6.S2) - focus on Tournament Roster PDF only
- New IPC channels (reuse existing `generateRosterPDF` with extended options)
- Changes to IPC type definitions (existing signature already supports `includeColumns`)

## Context for Development

### Codebase Patterns

1. **IPC Communication Pattern:**
   ```typescript
   // Main Process Handler (ExportService.ts line 40)
   ipcMain.handle('export:generateRosterPDF', async (event, tournamentId: number, options?: ExportOptions) => {
       // ... handle export
       return { success: true, filePath };
   });
   
   // ExportOptions Interface (line 27-30)
   interface ExportOptions {
       includeColumns?: string[];
       savePath?: string;
   }
   ```

2. **Optional Columns Pattern (ExportService.ts lines 386-395):**
   ```typescript
   const optionalColumns: { [key: string]: { label: string; width: number } } = {
       birth_place: { label: 'Birth Place', width: 100 },
       region: { label: 'Region', width: 80 },
       // ... columns are added to final list if key is in includeColumns array
   };
   ```

3. **Frontend Export Call Pattern (TournamentDetail.tsx lines 191-193):**
   ```typescript
   const result = await window.api.export.generateRosterPDF(parseInt(tournamentId), {
       includeColumns: [] // Currently empty - we will populate with school columns
   });
   ```

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/main/services/ExportService.ts` | Add school fields to `optionalColumns` map (lines 386-395) |
| `src/renderer/features/tournaments/TournamentDetail.tsx` | Add checkbox UI and pass columns (lines 183-213, 236-246) |
| `src/renderer/features/tournaments/TournamentList.tsx` | Add checkbox UI for list-level export (lines 151-172) |

### Technical Decisions

1. **Reuse Existing Infrastructure:** The `includeColumns` option and `optionalColumns` map already exist - minimal code changes required.

2. **School Columns Keys:** Use exact database column names: `school_name`, `nisn`, `nik`

3. **Column Widths:** `school_name`: 100px, `nisn`: 80px, `nik`: 90px (fits A4 landscape with scaling)

4. **Default State:** Checkbox unchecked by default (standard tournament export behavior preserved)

## Implementation Plan

### Tasks

#### Task 1: Add School Columns to ExportService Optional Columns Map
- **File:** `src/main/services/ExportService.ts`
- **Location:** Lines 386-395 (inside `renderAthleteTable` function)
- **Action:** Add three new entries to the `optionalColumns` object:
  ```typescript
  // Story E9.S8: School-based roster columns
  school_name: { label: 'School', width: 100 },
  nisn: { label: 'NISN', width: 80 },
  nik: { label: 'NIK', width: 90 }
  ```
- **Notes:** Add after the existing `clubName` entry. These keys match the database column names exactly.

#### Task 2: Add School-Based Checkbox State to TournamentDetail
- **File:** `src/renderer/features/tournaments/TournamentDetail.tsx`
- **Location:** After line 35 (where `exporting` state is defined)
- **Action:** Add state for the checkbox:
  ```typescript
  const [isSchoolBased, setIsSchoolBased] = useState(false);
  ```
- **Notes:** Import `useState` is already present in the file.

#### Task 3: Update TournamentDetail Export Handler to Include School Columns
- **File:** `src/renderer/features/tournaments/TournamentDetail.tsx`
- **Location:** Lines 191-193 (inside `handleExportPDF` function)
- **Action:** Replace the current call with:
  ```typescript
  const includeColumns = isSchoolBased 
      ? ['school_name', 'nisn', 'nik'] 
      : [];
  
  const result = await window.api.export.generateRosterPDF(parseInt(tournamentId), {
      includeColumns
  });
  ```
- **Notes:** The rest of the handler logic remains unchanged.

#### Task 4: Add Checkbox UI to TournamentDetail Header
- **File:** `src/renderer/features/tournaments/TournamentDetail.tsx`
- **Location:** Lines 236-246 (in the header button group, before the Export PDF button)
- **Action:** Add checkbox element:
  ```tsx
  {!isNew && (
      <label className="flex items-center gap-2 text-sm text-slate-700 mr-2">
          <input
              type="checkbox"
              checked={isSchoolBased}
              onChange={(e) => setIsSchoolBased(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          School Based
      </label>
  )}
  ```
- **Notes:** Only show when editing existing tournament (matches Export PDF button visibility).

#### Task 5: Add School-Based Checkbox State to TournamentList Item
- **File:** `src/renderer/features/tournaments/TournamentList.tsx`
- **Location:** Inside the `TournamentItem` component, after the `exporting` state
- **Action:** Add state:
  ```typescript
  const [isSchoolBased, setIsSchoolBased] = useState(false);
  ```
- **Notes:** Each tournament item manages its own checkbox state.

#### Task 6: Update TournamentList Export Handler
- **File:** `src/renderer/features/tournaments/TournamentList.tsx`
- **Location:** Inside `handleDownloadPDF` function (around line 161)
- **Action:** Update the IPC call:
  ```typescript
  const includeColumns = isSchoolBased 
      ? ['school_name', 'nisn', 'nik'] 
      : [];
  
  const result = await window.api.export.generateRosterPDF(tournament.id!, {
      includeColumns
  });
  ```

#### Task 7: Add Checkbox UI to TournamentList Row Actions
- **File:** `src/renderer/features/tournaments/TournamentList.tsx`
- **Location:** In the action buttons area (around lines 213-222), before the PDF button
- **Action:** Add compact checkbox:
  ```tsx
  <label className="flex items-center gap-1.5 text-xs text-slate-600 mr-1" title="Include School Name, NISN, NIK in PDF">
      <input
          type="checkbox"
          checked={isSchoolBased}
          onChange={(e) => {
              e.stopPropagation();
              setIsSchoolBased(e.target.checked);
          }}
          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      School
  </label>
  ```
- **Notes:** Use compact styling to fit in the action area. Add `e.stopPropagation()` to prevent row click.

### Acceptance Criteria

- [ ] **AC1:** Given the TournamentDetail page with an existing tournament, when I view the export area, then a checkbox labeled "School Based" is visible next to the Export PDF button

- [ ] **AC2:** Given the TournamentList page, when I hover on a tournament row, then a checkbox labeled "School" is visible next to the PDF button

- [ ] **AC3:** Given the "School Based" checkbox is **Unchecked** (default state), when the coach clicks "Export PDF", then the generated PDF does NOT include School Name, NISN, or NIK columns

- [ ] **AC4:** Given the "School Based" checkbox is **Checked**, when the coach clicks "Export PDF", then the generated PDF includes **School Name**, **NISN**, and **NIK** columns for every athlete

- [ ] **AC5:** Given athletes with NULL values for school_name, nisn, or nik, when the PDF is generated with school columns checked, then empty cells are displayed (no errors, no "undefined" text)

- [ ] **AC6:** Given the PDF includes school columns alongside all base columns, when the layout is rendered, then all columns fit within A4 landscape width (automatic scaling is applied)

- [ ] **AC7:** Given a tournament with 50+ athletes, when the PDF is exported with school columns, then pagination works correctly with headers repeating on each page

## Additional Context

### Dependencies

**Existing (no new dependencies required):**
- `pdfkit` - Already used for PDF generation
- `electron` - For dialog and IPC  
- `better-sqlite3` - Database access (school fields already exist from E9.S4)

**Prerequisites:**
- Story E9.S4 (Extended Athlete Profile) must be complete - provides `school_name`, `nisn`, `nik` fields

### Testing Strategy

**Manual Testing Checklist:**

1. **TournamentDetail Page:**
   - [ ] Export with checkbox unchecked → verify no school columns in PDF
   - [ ] Export with checkbox checked → verify School, NISN, NIK columns appear
   - [ ] Checkbox only visible for existing tournaments (not new)

2. **TournamentList Page:**
   - [ ] Export from list with checkbox unchecked → no school columns
   - [ ] Export from list with checkbox checked → school columns appear
   - [ ] Checkbox click does not trigger row navigation

3. **PDF Layout:**
   - [ ] With school columns + existing columns, layout scales properly
   - [ ] With 50+ athletes, pagination works correctly
   - [ ] Print PDF to verify column readability

4. **Edge Cases:**
   - [ ] Athletes with missing school data → empty cells, no errors
   - [ ] Athletes with very long school names → text truncates with ellipsis
   - [ ] Tournament with no athletes → existing "No athletes in roster" error

### Notes

**Design Rationale:**

1. **Why Checkbox Instead of Settings Page?**
   - Tournament type varies per event (school vs. regular competition)
   - Quick toggle is more convenient than navigating to settings
   - Setting is per-export, not persistent

2. **Why These Specific Columns?**
   - **NISN** (Nomor Induk Siswa Nasional) - Required for POPDA/O2SN student verification
   - **NIK** (Nomor Induk Kependudukan) - Required for identity verification
   - **School Name** - Required for institutional affiliation proof

3. **Risk Assessment:**
   - **Low Risk:** Changes are additive only, no modification to existing logic
   - **Testing:** Manual verification sufficient given PDF output nature

**Future Considerations (Out of Scope):**
- Persist "school based" preference per tournament in database
- Add school columns to Athlete Summary PDF (E6.S2)
- Excel export with school columns

## Review Notes

- **Adversarial review completed:** 2026-01-10
- **Findings:** 12 total (1 Critical, 5 Medium, 6 Low)
- **Resolution approach:** Auto-fix
- **Fixes applied:**
  - F9 (Critical): Added tooltip and aria-label to clarify checkbox behavior and set user expectations
  - F6 (Medium): Improved accessibility with `group-focus-within:opacity-100` for keyboard navigation
  - F4 (Low): Added tooltip to TournamentDetail checkbox
  - F5 (Low): Added aria-labels to both checkboxes for screen reader support
  - F1 (Medium): Added documentation comment noting dependency on Story E9.S4
- **Skipped findings:** F2, F3, F7, F8, F10, F11, F12 (enhancements beyond story scope)
- **Locale translations added:** Translation keys added to `en.json` and `id.json` under `tournament.export.*` for future i18n integration (components currently use hardcoded strings per existing pattern)

