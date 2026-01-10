---
title: 'Language Localization (Bahasa Indonesia)'
slug: 'language-localization-bahasa-indonesia'
created: '2026-01-10'
status: 'in-progress'
stepsCompleted: [1, 2, 3, 4]
story_ref: 'E9.S7'
tech_stack: ['Electron ^30.0.0', 'React ^18.3.0', 'Zustand ^4.5.0', 'TypeScript', 'better-sqlite3 ^9.0.0', 'PDFKit']
files_to_modify: ['src/renderer/i18n/', 'src/renderer/features/settings/useSettingsStore.ts', 'src/renderer/features/settings/BrandingSettings.tsx', 'src/renderer/renderer.tsx', 'src/main/services/ExportService.ts', 'src/main/i18n/']
code_patterns: ['Zustand stores', 'IPC bridge pattern', 'Feature-based organization', 'Repository pattern']
test_patterns: ['Unit tests for utility functions', 'Manual UI testing']
---

# Tech-Spec: Language Localization (Bahasa Indonesia)

**Created:** 2026-01-10  
**Story Reference:** E9.S7

## Overview

### Problem Statement

The application UI is hardcoded in English, making it difficult for Indonesian coaches who are more comfortable with Bahasa Indonesia. All UI labels, buttons, tooltips, messages, and even PDF exports are in English only, limiting accessibility for the primary user base.

### Solution

Implement a lightweight custom i18n (internationalization) system with:
- JSON translation files for English (EN) and Bahasa Indonesia (ID)
- A Zustand-based language store integrated with the existing state management pattern
- SQLite persistence for language preference across app restarts
- A simple `useTranslation` hook providing a `t('key')` function for all components
- Language toggle UI added to the Branding section of Settings page

This approach adds **zero npm dependencies**, keeps the bundle lightweight, and integrates seamlessly with the existing architecture.

### Scope

**In Scope:**
- Custom `useTranslation` hook and `t()` function
- JSON translation files for EN and ID (`src/renderer/i18n/locales/`)
- Language toggle dropdown in Settings > Branding tab
- Persist language preference to SQLite `settings` table
- Translate ALL UI strings:
  - Navigation sidebar
  - Dashboard page (KPIs, quick actions)
  - Athlete management (list, forms, dialogs, filters)
  - Tournament management (roster, filters, exports)
  - Club management
  - Settings page (all tabs)
  - Success/error/confirmation messages
  - Modal dialogs and tooltips
- Translate PDF export output (Roster Printout, Archive Summary)
- **Date/number format localization:**
  - Dates: EN → `Jan 10, 2026` | ID → `10 Januari 2026`
  - Numbers: EN → `1,234.56` | ID → `1.234,56`
  - Helper functions: `formatDate(date, locale)`, `formatNumber(num, locale)`
- Instant language switching without app restart

**Out of Scope:**
- RTL (right-to-left) language support
- Dynamic language file loading (both languages bundled)
- Additional languages beyond EN and ID

## Context for Development

### Codebase Patterns

1. **Zustand State Management**: All global state is managed via Zustand stores with the pattern:
   - Store file: `use[Feature]Store.ts`
   - Actions defined inline with state
   - IPC calls wrapped in try/catch with `isLoading`/`error` flags

2. **IPC Bridge Pattern**: All main process communication goes through:
   - `src/main/preload.ts` - Exposes typed API via `contextBridge`
   - `src/shared/types/electron.d.ts` - TypeScript interface `IElectronAPI`
   - Settings API: `window.api.settings.get/set/getAll`

3. **Feature-Based Organization**: Code organized under `src/renderer/features/[module]/`
   - Each feature has its own components, hooks, and stores
   - Settings feature at `src/renderer/features/settings/`

4. **Settings Persistence Pattern**:
   - `app_settings` table with `key`/`value` columns
   - Existing keys: `kabupaten_name`, `kabupaten_logo_path`
   - New key needed: `language` (values: `en`, `id`)

5. **PDF Generation**: `ExportService.ts` generates PDFs using PDFKit
   - Currently has hardcoded English strings (column headers, labels)
   - Needs access to translation function via shared module

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/renderer/features/settings/useSettingsStore.ts` | Settings Zustand store - add `language` state |
| `src/renderer/features/settings/BrandingSettings.tsx` | UI for branding - add language dropdown section |
| `src/renderer/renderer.tsx` | Main app entry - hardcoded nav labels to translate |
| `src/main/preload.ts` | IPC bridge - settings API already exists |
| `src/main/repositories/settingsRepository.ts` | Settings CRUD - no changes needed |
| `src/main/services/ExportService.ts` | PDF generation - needs translation access |
| `src/renderer/features/dashboard/Dashboard.tsx` | Dashboard KPIs - strings to translate |
| `src/renderer/features/athletes/AthleteList.tsx` | Athlete list - many strings (~45KB file) |
| `src/renderer/features/athletes/AthleteForm.tsx` | Athlete form - many form labels (~44KB file) |
| `src/renderer/features/tournaments/TournamentList.tsx` | Tournament list strings |
| `src/renderer/features/tournaments/TournamentDetail.tsx` | Tournament detail strings |
| `src/shared/constants/index.ts` | App name constants |

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n Library | Custom (No external library) | Zero dependencies, minimal bundle size, full control |
| Translation Storage | JSON files in `src/renderer/i18n/locales/` | Simple, type-safe with TypeScript, easy to maintain |
| State Management | Extend existing `useSettingsStore` | Consistent with app architecture, single source of truth |
| Persistence | SQLite `settings` table (`language` key) | Consistent with existing settings pattern |
| UI Location | Settings > Branding tab | Logical grouping with personalization settings |
| Default Language | English (EN) | Fallback for any missing translations |
| Translation Key Format | Dot notation (`nav.dashboard`) | Hierarchical, organized by feature |
| PDF Translations | Shared JSON loaded in main process | PDFKit runs in main process, needs direct access |
| Date/Number Format | Native `Intl.DateTimeFormat` / `Intl.NumberFormat` | Built-in, locale-aware, zero overhead |

### Architecture for i18n

```
src/renderer/i18n/
├── index.ts                 # useTranslation hook, t() function, format helpers
├── types.ts                 # TypeScript types for translation keys
└── locales/
    ├── en.json              # English translations
    └── id.json              # Bahasa Indonesia translations

src/main/i18n/
├── index.ts                 # Main process translation loader
└── locales/
    ├── en.json              # English translations (copy for main process)
    └── id.json              # Indonesian translations (copy for main process)
```

---

## Implementation Plan

### Phase 1: Core i18n Infrastructure

- [ ] **Task 1.1: Create Translation JSON Files (English)**
  - File: `src/renderer/i18n/locales/en.json`
  - Action: Create JSON with all English translation keys organized by feature namespace
  - Notes: Use dot notation keys like `nav.dashboard`, `athlete.form.name`, `common.save`

- [ ] **Task 1.2: Create Translation JSON Files (Indonesian)**
  - File: `src/renderer/i18n/locales/id.json`
  - Action: Create JSON with Indonesian translations matching all English keys
  - Notes: Include proper Indonesian terms for Judo (sabuk = belt, kelas berat = weight class)

- [ ] **Task 1.3: Create TypeScript Types for Translation Keys**
  - File: `src/renderer/i18n/types.ts`
  - Action: Define `TranslationKey` type from JSON structure for type-safe `t()` calls
  - Notes: Use `keyof typeof en` pattern or generate from JSON

- [ ] **Task 1.4: Create useTranslation Hook**
  - File: `src/renderer/i18n/index.ts`
  - Action: Create custom hook that returns `{ t, formatDate, formatNumber, language }`
  - Notes: 
    - `t(key)` returns translation with fallback to English
    - `formatDate(date)` uses `Intl.DateTimeFormat` with current locale
    - `formatNumber(num)` uses `Intl.NumberFormat` with current locale
    - Get language from `useSettingsStore`

### Phase 2: Settings Store & Persistence

- [ ] **Task 2.1: Extend Settings Store with Language**
  - File: `src/renderer/features/settings/useSettingsStore.ts`
  - Action: Add `language: 'en' | 'id'` state and `setLanguage(lang)` action
  - Notes:
    - Default to `'en'`
    - Load from `window.api.settings.get('language')` in `loadSettings()`
    - Persist via `window.api.settings.set('language', value)` in `setLanguage()`

- [ ] **Task 2.2: Add Language Selector UI to BrandingSettings**
  - File: `src/renderer/features/settings/BrandingSettings.tsx`
  - Action: Add "Language" section with dropdown below the logo upload
  - Notes:
    - Dropdown options: "English", "Bahasa Indonesia"
    - On change, call `setLanguage()` from store
    - Show success feedback on change

### Phase 3: Translate Renderer Components

- [ ] **Task 3.1: Translate Main App Shell (renderer.tsx)**
  - File: `src/renderer/renderer.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings to translate:
    - Nav items: "Dashboard", "Athletes", "Tournaments", "Settings"
    - Header titles: "Athlete Management", "System Settings", etc.
    - Buttons: "New Athlete", "Reload"
    - Modal titles: "Athlete Profile", "Add New Athlete"

- [ ] **Task 3.2: Translate Dashboard**
  - File: `src/renderer/features/dashboard/Dashboard.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings to translate:
    - "Command Center", "Athlete Management System"
    - KPI titles: "Total Pool", "Competitive Pool", "Male Athletes", "Female Athletes"
    - Subtitles: "All registered athletes", "Constant + Intermittent", etc.
    - Quick Actions: "Add Athlete", "Manage Tournaments"

- [ ] **Task 3.3: Translate Dashboard Sub-components**
  - Files: `src/renderer/features/dashboard/KPICard.tsx`, `MedallionSummary.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings: "Gold", "Silver", "Bronze", "All Time", year labels

- [ ] **Task 3.4: Translate Athlete List**
  - File: `src/renderer/features/athletes/AthleteList.tsx`
  - Action: Replace all hardcoded strings with `t()` calls
  - Strings to translate:
    - Column headers, filter labels, sort options
    - Status badges: "Active", "Intermittent", "Dormant"
    - Buttons: "Export", "Filter", "Search"
    - Empty states, error messages

- [ ] **Task 3.5: Translate Athlete Form**
  - File: `src/renderer/features/athletes/AthleteForm.tsx`
  - Action: Replace all form labels and messages with `t()` calls
  - Strings to translate:
    - Field labels: "Name", "Birth Date", "Gender", "Weight", "Belt", etc.
    - Placeholders, validation messages
    - Buttons: "Save", "Cancel", "Add Medal", "Add Promotion"
    - Section headers, tabs

- [ ] **Task 3.6: Translate Tournament List**
  - File: `src/renderer/features/tournaments/TournamentList.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings: Column headers, status labels, buttons

- [ ] **Task 3.7: Translate Tournament Detail**
  - File: `src/renderer/features/tournaments/TournamentDetail.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings: Form labels, roster headers, export buttons, conflict warnings

- [ ] **Task 3.8: Translate Settings Page**
  - File: `src/renderer/features/settings/SettingsPage.tsx`
  - Action: Replace hardcoded strings with `t()` calls
  - Strings: Tab labels, section titles, buttons, status messages

- [ ] **Task 3.9: Translate Settings Sub-components**
  - Files: `RulesetList.tsx`, `RulesetEditor.tsx`, `ClubList.tsx`, `ClubForm.tsx`
  - Action: Replace all strings with `t()` calls

- [ ] **Task 3.10: Translate Athlete History Components**
  - Files: `TournamentHistoryTimeline.tsx`, `AddTournamentHistoryModal.tsx`, `history/*.tsx`
  - Action: Replace hardcoded strings with `t()` calls

### Phase 4: Main Process (PDF Translations)

- [ ] **Task 4.1: Create Main Process Translation Module**
  - File: `src/main/i18n/index.ts`
  - Action: Create translation loader that reads JSON and provides `t(key, locale)` function
  - Notes: Synchronous loading since main process runs at startup

- [ ] **Task 4.2: Copy Locale Files to Main Process**
  - Files: `src/main/i18n/locales/en.json`, `src/main/i18n/locales/id.json`
  - Action: Create copies of translation files for main process access
  - Notes: Can share via build config or maintain separate copies for PDF-specific strings

- [ ] **Task 4.3: Update ExportService for Translations**
  - File: `src/main/services/ExportService.ts`
  - Action: 
    - Import translation module
    - Get current language from settings before generating PDF
    - Replace all hardcoded column headers and labels with `t()` calls
  - Strings to translate:
    - PDF headers: "Tournament Roster", "Athlete Summary"
    - Column headers: "Name", "Gender", "Age Category", "Weight Class", "Club"
    - Date/number formatting using locale-aware formatters

- [ ] **Task 4.4: Add Date/Number Formatters for Main Process**
  - File: `src/main/i18n/index.ts`
  - Action: Add `formatDate(date, locale)` and `formatNumber(num, locale)` using `Intl` API
  - Notes: Mirror the renderer's format functions

### Phase 5: Integration & Polish

- [ ] **Task 5.1: Ensure Language Loads on App Start**
  - File: `src/renderer/renderer.tsx`
  - Action: Verify `loadSettings()` is called in `useEffect` and language is available before render
  - Notes: Language should be loaded before any translated strings render

- [ ] **Task 5.2: Add Loading State for Language**
  - File: `src/renderer/i18n/index.ts`
  - Action: Handle case where language is not yet loaded (fallback to 'en')
  - Notes: Prevent flash of wrong language on startup

- [ ] **Task 5.3: Apply Date Formatting Throughout App**
  - Files: All components displaying dates
  - Action: Replace date formatting (if any) with `formatDate()` from i18n
  - Notes: Check athlete birth dates, tournament dates, promotion dates

- [ ] **Task 5.4: Apply Number Formatting for Statistics**
  - Files: Dashboard, any component showing large numbers
  - Action: Use `formatNumber()` for weight, statistics where appropriate
  - Notes: May not be needed for small numbers like athlete count

---

## Acceptance Criteria

- [ ] **AC1:** Given the Settings menu, when the user navigates to the Branding tab, then they should see a "Language" dropdown with options "English" and "Bahasa Indonesia"

- [ ] **AC2:** Given the user selects "Bahasa Indonesia", when the selection is confirmed, then all UI labels, buttons, and messages should instantly reflect the selected language, and the preference should be persisted to the database

- [ ] **AC3:** Given the user restarts the application, when the app loads, then the previously selected language should be applied automatically

- [ ] **AC4:** Given the user generates a PDF export (Roster/Summary), when the export is created, then the PDF content (headers, labels) should use the currently selected language

- [ ] **AC5:** Given a date is displayed (birth date, tournament date), when the language is set to Bahasa Indonesia, then the date should be formatted as `10 Januari 2026` (Indonesian month names)

- [ ] **AC6:** Given the language is set to Bahasa Indonesia, when viewing the navigation sidebar, then labels should show: "Dasbor", "Atlet", "Turnamen", "Pengaturan"

- [ ] **AC7:** Given a missing translation key, when the `t()` function is called, then it should return the English fallback (not crash or show empty string)

---

## Additional Context

### Dependencies

- **No new npm dependencies required**
- Leverages existing: Zustand, SQLite settings API, PDFKit
- Uses native `Intl` API for date/number formatting (built into JS runtime)

### Testing Strategy

**Unit Tests:**
- `t()` function returns correct translation for given key and locale
- `t()` function returns English fallback for missing key
- `formatDate()` returns correct format for both locales
- `formatNumber()` returns correct format for both locales

**Integration Tests:**
- Settings store persists and loads language correctly
- PDF export uses correct language from settings

**Manual Testing Checklist:**
- [ ] Switch to Indonesian → all visible UI text changes
- [ ] Switch back to English → all visible UI text changes
- [ ] Restart app → language preference retained
- [ ] Navigate to all pages → no missing translations (check console for warnings)
- [ ] Export Roster PDF → headers in selected language
- [ ] Export Summary PDF → headers in selected language
- [ ] Dates display correctly in Indonesian format

### High-Risk Items

1. **Large number of strings to translate** - Risk of missing some strings. Mitigation: Add console warning for missing keys during development.
2. **PDF generation in main process** - Different execution context from renderer. Mitigation: Separate translation module with shared JSON.
3. **Performance on instant switch** - Many components re-render. Mitigation: React's efficient diffing should handle this; monitor if issues arise.

### Translation Key Structure

```json
{
  "common": {
    "save": "Save / Simpan",
    "cancel": "Cancel / Batal",
    "delete": "Delete / Hapus",
    "edit": "Edit / Ubah",
    "add": "Add / Tambah",
    "loading": "Loading... / Memuat...",
    "error": "An error occurred / Terjadi kesalahan"
  },
  "nav": {
    "dashboard": "Dashboard / Dasbor",
    "athletes": "Athletes / Atlet",
    "tournaments": "Tournaments / Turnamen",
    "settings": "Settings / Pengaturan"
  },
  "dashboard": {
    "title": "Command Center / Pusat Komando",
    "totalPool": "Total Pool / Total Atlet",
    "competitivePool": "Competitive Pool / Atlet Kompetitif"
  },
  "athlete": {
    "form": {
      "name": "Name / Nama",
      "birthDate": "Birth Date / Tanggal Lahir",
      "gender": "Gender / Jenis Kelamin",
      "weight": "Weight / Berat Badan",
      "belt": "Belt / Sabuk"
    }
  }
}
```

### Indonesian Judo Terminology Reference

| English | Indonesian |
|---------|------------|
| Belt | Sabuk |
| Weight Class | Kelas Berat |
| Age Category | Kategori Usia |
| Tournament | Turnamen / Kejuaraan |
| Roster | Daftar Peserta |
| Medal | Medali |
| Gold | Emas |
| Silver | Perak |
| Bronze | Perunggu |
| Promotion | Promosi / Kenaikan Tingkat |
| Active | Aktif |
| Dormant | Tidak Aktif |

### Notes

- Translation keys use dot notation for namespacing (e.g., `nav.dashboard`, `athlete.form.name`)
- Consider TypeScript strict typing for translation keys to catch missing translations at compile time
- PDF export service in main process loads translations from shared JSON files
- Use `Intl.DateTimeFormat` with locale `id-ID` for Indonesian date formatting
- Use `Intl.NumberFormat` with locale `id-ID` for Indonesian number formatting
- Indonesian month names: Januari, Februari, Maret, April, Mei, Juni, Juli, Agustus, September, Oktober, November, Desember


