# Tech-Spec: Comprehensive Backup (ZIP) - Story E9.S6

**Created:** 2026-01-08
**Status:** Implementation Complete

## Overview

### Problem Statement

The current backup functionality only exports the SQLite database file (`judo-athletes.db`), leaving all attachments behind. This means:
- Profile photos, certificates, medals, club logos, and official documents are **not preserved**
- Restoring from a backup results in broken image references
- Users cannot create a true "portable" backup for disaster recovery or machine migration

### Solution

Replace the existing database-only backup with a comprehensive ZIP backup that bundles:
1. The SQLite database (`judo-athletes.db`)
2. The entire attachment vault (`dossier/` folder with all subdirectories)

The restore process will:
1. Create a rollback backup of current data before extraction
2. Extract and validate the ZIP contents
3. Replace database and vault files
4. Trigger a full application restart for clean re-initialization
5. Automatically rollback on any failure

### Scope

**In Scope:**
- Replace existing `system:backupDatabase` with ZIP export
- Replace existing `system:restoreDatabase` with ZIP import
- Timestamped filename format: `backup-YYYY-MM-DD.zip`
- Rollback mechanism for failed imports
- Full app restart after successful restore
- Error handling for corrupted/incompatible files

**Out of Scope:**
- Automatic scheduled backups
- Cloud backup integration
- Incremental/differential backups
- Backup encryption

## Context for Development

### Codebase Patterns

- **IPC Pattern**: Handlers in `src/main/services/`, exposed via `preload.ts`
- **File Operations**: Use `fs/promises` for async operations
- **Error Handling**: Return `{ success: boolean; data?: T; error?: string }`
- **Vault Path**: `app.getPath('userData')/dossier/`
- **Database Path**: `app.getPath('userData')/judo-athletes.db`

### Files to Reference

| File | Purpose |
|------|---------|
| `src/main/services/BackupService.ts` | Current backup logic (to be replaced) |
| `src/main/services/FileService.ts` | Vault path utilities (`getVaultPath()`) |
| `src/main/db.ts` | Database connection management |
| `src/shared/constants/index.ts` | `DATABASE.NAME` constant |
| `src/renderer/features/settings/SettingsPage.tsx` | UI for backup/restore buttons |
| `src/shared/types/electron.d.ts` | IPC type definitions |

### Technical Decisions

1. **ZIP Library**: Use `archiver` for creating ZIPs (streaming, efficient for large files) and `adm-zip` for extraction (simpler API for reading)

2. **App Restart**: Use `app.relaunch()` + `app.quit()` instead of `window.location.reload()` to ensure:
   - Database connection is properly closed and reopened
   - All cached data is cleared
   - Vault paths are re-resolved

3. **Rollback Strategy**: Before restore, copy current DB + dossier to a temp folder. On failure, restore from temp.

4. **ZIP Structure**:
   ```
   backup-2026-01-08.zip
   ├── judo-athletes.db
   └── dossier/
       ├── profiles/
       ├── certificates/
       ├── medals/
       ├── clubs/
       ├── branding/
       └── documents/
   ```

5. **Dialog Filters**: Change from `.db` to `.zip` extension

## Implementation Plan

### Tasks

- [x] **Task 1: Install Dependencies**
  - Add `archiver` and `adm-zip` to `package.json` dependencies
  - Add `@types/archiver` to devDependencies
  - Run `npm install`

- [x] **Task 2: Rewrite BackupService - Export Function**
  - Replace `system:backupDatabase` handler
  - Use `archiver` to create ZIP stream
  - Add database file to archive
  - Add entire `dossier/` directory recursively
  - Update file dialog to use `.zip` filter
  - Generate filename as `backup-YYYY-MM-DD.zip`

- [x] **Task 3: Rewrite BackupService - Import Function**
  - Replace `system:restoreDatabase` handler
  - Validate ZIP file structure before extraction
  - Create rollback backup in temp directory
  - Close database connection
  - Extract ZIP to userData directory
  - Clean up WAL/SHM files
  - On success: trigger app restart via `app.relaunch()` + `app.quit()`
  - On failure: restore from rollback backup

- [x] **Task 4: Add Validation Helpers**
  - `validateZipStructure(zipPath)`: Check ZIP contains `judo-athletes.db` at root
  - `createRollbackBackup()`: Copy current DB + dossier to temp
  - `restoreFromRollback()`: Restore from temp on failure
  - `cleanupRollback()`: Delete temp backup after successful restore

- [x] **Task 5: Update UI Labels (Minor)**
  - Update description text in SettingsPage to mention "database and attachments"
  - Change "JSON backup" reference to "ZIP backup"

- [x] **Task 6: Handle Edge Cases**
  - Empty dossier directory (no attachments yet)
  - Very large vault (progress feedback - optional)
  - Insufficient disk space detection

### Acceptance Criteria

- [x] **AC 1:** Clicking "Create Backup" opens a save dialog with `.zip` filter and default filename `backup-YYYY-MM-DD.zip`
- [x] **AC 2:** The created ZIP file contains `judo-athletes.db` at root level
- [x] **AC 3:** The created ZIP file contains `dossier/` folder with all subdirectories and files
- [x] **AC 4:** Clicking "Restore from File" opens an open dialog with `.zip` filter
- [x] **AC 5:** Importing a valid ZIP replaces the database AND all vault files
- [x] **AC 6:** After successful import, the application fully restarts (not just page reload)
- [x] **AC 7:** If ZIP is missing `judo-athletes.db`, show error "Invalid backup file: database not found"
- [x] **AC 8:** If import fails mid-process, the previous data is automatically restored
- [x] **AC 9:** Old `.db` backup files are still importable (legacy support - attempt db-only restore)

## Additional Context

### Dependencies

**New Production Dependencies:**
```json
{
  "archiver": "^6.0.1",
  "adm-zip": "^0.5.10"
}
```

**New Dev Dependencies:**
```json
{
  "@types/archiver": "^6.0.2"
}
```

### Testing Strategy

**Manual Testing:**
1. Create a backup with multiple athletes having attached documents
2. Verify ZIP contains all expected files using a ZIP viewer
3. Delete all data (or use fresh install)
4. Restore from backup
5. Verify all athletes and their attachments are restored
6. Test import with corrupted ZIP (should fail gracefully)
7. Test import with database-only ZIP (legacy `.db` or ZIP without dossier)

**Edge Cases to Test:**
- Empty database (new installation)
- Large vault (>100MB of attachments)
- Special characters in filenames
- Cross-platform path handling (Windows backslash vs Unix forward slash)

### Code Snippets

**Creating ZIP with archiver:**
```typescript
import archiver from 'archiver';
import { createWriteStream } from 'fs';

async function createBackupZip(destPath: string): Promise<void> {
  const output = createWriteStream(destPath);
  const archive = archiver('zip', { zlib: { level: 5 } });
  
  archive.pipe(output);
  
  // Add database
  archive.file(dbPath, { name: 'judo-athletes.db' });
  
  // Add dossier folder
  archive.directory(vaultPath, 'dossier');
  
  await archive.finalize();
}
```

**Extracting ZIP with adm-zip:**
```typescript
import AdmZip from 'adm-zip';

function extractBackupZip(zipPath: string, destPath: string): void {
  const zip = new AdmZip(zipPath);
  
  // Validate structure first
  const entries = zip.getEntries();
  const hasDb = entries.some(e => e.entryName === 'judo-athletes.db');
  if (!hasDb) {
    throw new Error('Invalid backup: database not found');
  }
  
  zip.extractAllTo(destPath, true); // overwrite = true
}
```

**App Restart:**
```typescript
import { app } from 'electron';

function restartApp(): void {
  app.relaunch();
  app.quit();
}
```

### Notes

- The rollback mechanism uses the system temp directory (`app.getPath('temp')`) for temporary storage
- WAL/SHM files are cleaned up after extraction to prevent corruption
- The `app.relaunch()` approach ensures all Electron processes are refreshed
- Legacy `.db` files can still be imported by detecting file type and handling appropriately

### Rollback Flow Diagram

```
┌─────────────────┐
│  Start Import   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate ZIP   │───No──▶ Show Error
└────────┬────────┘
         │Yes
         ▼
┌─────────────────┐
│ Create Rollback │
│  (temp folder)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Close Database │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract ZIP    │───Fail──▶ Restore Rollback
└────────┬────────┘                    │
         │Success                      ▼
         ▼                    Reinit DB, Show Error
┌─────────────────┐
│ Clean WAL/SHM   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  App Restart    │
└─────────────────┘
```
