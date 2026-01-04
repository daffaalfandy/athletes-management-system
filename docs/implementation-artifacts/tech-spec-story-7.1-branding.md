# Tech-Spec: Story 7.1 - Regency & Club Branding

**Created:** 2026-01-04
**Status:** Ready for Development

## Overview

### Problem Statement
Currently, the application has hardcoded branding (e.g., "Kabupaten Bogor") in the sidebar and other UI elements. Users (technical senseis/coaches) need the ability to customize this branding to reflect their own institution (Kabupaten name and logo) to make the application feel official and personalized.

### Solution
Implement a system-wide "Settings" configuration module. This includes:
1.  A new database table `app_settings` to store key-value pairs (e.g., `kabupaten_name`, `kabupaten_logo_path`).
2.  Backend Logic (Main Process) to handle setting retrieval, updates, and secure logo file management via `FileService`.
3.  Frontend Logic (Renderer) to expose a configuration UI in the "Settings" page and dynamically update the App Shell (Sidebar/Header) and Export functionality to reflect the configured branding.

### Scope (In/Out)
**In Scope:**
- Database schema migration for `app_settings`.
- IPC Handlers for generic settings management.
- extending `FileService` to support Branding assets (Logo).
- UI implementation in `SettingsPage.tsx` (new "General" or "Branding" tab).
- Updating `App.tsx` (Sidebar) to consume dynamic settings.

**Out of Scope:**
- Branding for specific tournaments (this is System-wide branding).
- Custom color themes (Story E7.2 might cover dashboard, but full theming is not requested here).

## Context for Development

### Codebase Patterns
- **Repository Pattern:** `src/main/db/repositories/` for all SQL.
- **IPC Bridge:** `preload.ts` for type-safe main-renderer communication.
- **Zustand:** Global state management for data that persists across views.
- **FileService:** `src/main/services/FileService.ts` for managing the "Local Vault".

### Files to Reference
- `src/renderer/renderer.tsx` (App Component containing Sidebar).
- `src/renderer/features/settings/SettingsPage.tsx` (Target for UI).
- `src/main/services/FileService.ts` (Target for Logo handling).
- `src/main/preload.ts` (API definition).

### Technical Decisions
- **Storage:** Use a Key-Value table `app_settings` (key text PK, value text) instead of a single-row "config" table for flexibility in adding future settings without schema changes.
- **Logo Storage:** Store the logo file in `{userData}/dossier/branding/logo.[ext]` to ensure it persists and is portable with simple file system backups.
- **State:** Use a lightweight Zustand `useSettingsStore` initialized on app launch to ensure the Sidebar renders immediately without layout shift.

## Implementation Plan

### Tasks

- [ ] **Migration & Repository**
    - Create SQL migration: `CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT);`.
    - Create `src/main/db/repositories/settingsRepository.ts` with `get(key)`, `set(key, value)`, `getAll()`.

- [ ] **File Service Update**
    - Update `src/main/services/FileService.ts`:
        - Add 'branding' to accepted types.
        - Ensure `dossier/branding` directory exists.
        - Support singleton replacement (uploading new logo replaces old one).
        - **Enforce 1MB size limit** (reuse existing `validateFileSize`).

- [ ] **IPC Bridge**
    - Start `src/main/ipc/settings.ts` handler.
    - Expose `window.api.settings` in `preload.ts`: `get(key)`, `set(key, value)`, `getAll()`.

- [ ] **Frontend State**
    - Create `src/renderer/features/settings/useSettingsStore.ts`.
    - Actions: `loadSettings()`, `updateSetting(key, val)`, `uploadLogo(file)`.

- [ ] **UI Implementation**
    - Update `SettingsPage.tsx`: Add "Branding" tab with Input (Kabupaten Name) and File Upload (Logo).
    - Update `App.tsx`: Replace hardcoded "Kabupaten Bogor" and Logo with values from `useSettingsStore`.

### Acceptance Criteria

- [ ] AC 1: User can update "Kabupaten Name" in Settings, and it immediately updates in the Sidebar.
- [ ] AC 2: User can upload a PNG/JPG logo, and it replaces the default "KB" square in the Sidebar.
- [ ] AC 3: Settings persist after closing and reopening the application.
- [ ] AC 4: The logo file is physically copied to the local vault `branding` folder.
- [ ] AC 5: System rejects logo uploads larger than 1MB.

## Additional Context

### Dependencies
- `better-sqlite3` for DB.
- `zustand` for state.

### Testing Strategy
- **Manual Verification:**
    1.  Go to Settings > Branding.
    2.  Change Name -> Verify Sidebar update.
    3.  Upload Logo -> Verify Sidebar image update.
    4.  Restart App -> Verify persistence.
