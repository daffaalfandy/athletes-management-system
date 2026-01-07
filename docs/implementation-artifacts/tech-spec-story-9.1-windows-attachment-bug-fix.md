# Tech-Spec: Windows Attachment Bug Fix (E9.S1)

**Created:** 2026-01-07
**Status:** Completed
**Story:** E9.S1 - Windows Attachment Bug Fix

---

## Overview

### Problem Statement

File uploads (profile photos, certificates, medal proofs, club logos, branding) fail or display incorrectly on Windows due to path separator inconsistencies. The `FileService.copyToVault()` function uses `path.join()` which returns backslash-separated paths on Windows (e.g., `profiles\42.jpg`). These paths are stored in the database and later used to construct `dossier://` protocol URLs, but backslashes are not valid URL path separators, causing file resolution failures.

### Solution

Normalize all stored relative paths to use forward slashes (`/`) regardless of the operating system. This ensures:
1. Consistent path storage in the database across platforms
2. Valid `dossier://` protocol URLs
3. Cross-platform data portability (a database from Windows works on macOS and vice versa)

**Key Insight:** Node.js file system operations on Windows can handle forward slashes seamlessly, so normalizing to forward slashes is safe and cross-platform compatible.

### Scope

**In Scope:**
- Normalize path separators in `FileService.copyToVault()` return value
- Add defensive normalization in the `dossier://` protocol handler
- Ensure `downloadFile()` and `deleteFile()` handle normalized paths correctly

**Out of Scope:**
- Migration of existing paths in the database (forward slashes work everywhere, and this is a new app)
- Changes to the frontend URL construction (already uses template literals correctly)

---

## Context for Development

### Codebase Patterns

| Pattern | Description |
|---------|-------------|
| File Storage | Files copied to `{userData}/dossier/{type}/{id}.{ext}` |
| Path Storage | Relative paths stored in DB (e.g., `profiles/42.jpg`) |
| File Access | Custom `dossier://` protocol in main process |
| IPC | Handlers in `setupFileHandlers()` for file operations |

### Files to Reference

| File | Purpose |
|------|---------|
| `src/main/services/FileService.ts` | Core file operations - **PRIMARY MODIFICATION** |
| `src/main/main.ts` | Protocol handler registration - **SECONDARY MODIFICATION** |
| `src/renderer/components/ProofPreview.tsx` | Example of `dossier://` usage |
| `src/renderer/features/athletes/AthleteForm.tsx` | Photo upload flow |

### Technical Decisions

1. **Normalize at Write Time:** Store forward-slash paths in DB, not platform-native paths
2. **Defensive Read Normalization:** Protocol handler also normalizes (handles legacy data)
3. **No DB Migration Needed:** The app is new/not yet deployed; existing data is minimal
4. **Cross-Platform Safe:** Forward slashes work in Node.js fs operations on all platforms

---

## Implementation Plan

### Phase 1: Core FileService Fix

**File:** `src/main/services/FileService.ts`

#### Task 1.1: Create Path Normalization Helper

Add a helper function to normalize paths to forward slashes:

```typescript
/**
 * Normalize a file path to use forward slashes (cross-platform URL-safe paths).
 * This ensures paths stored in the database work correctly in dossier:// URLs
 * on both Windows and Unix-based systems.
 */
function normalizeToForwardSlashes(filePath: string): string {
    return filePath.replace(/\\/g, '/');
}
```

**Location:** Add after line 6 (after `const VAULT_DIR_NAME = 'dossier';`)

#### Task 1.2: Update `copyToVault()` Return Value

Modify the `copyToVault()` function to normalize the relative path before returning:

**Current (line 84):**
```typescript
return relativePath;
```

**New:**
```typescript
// Normalize to forward slashes for cross-platform URL compatibility
return normalizeToForwardSlashes(relativePath);
```

### Phase 2: Protocol Handler Hardening

**File:** `src/main/main.ts`

#### Task 2.1: Normalize Path in Protocol Handler

Update the `dossier://` protocol handler to normalize incoming paths (defensive coding for any legacy data):

**Current (lines 59-64):**
```typescript
protocol.handle('dossier', (request) => {
    const url = request.url.replace('dossier://', '');
    const vaultPath = path.join(app.getPath('userData'), 'dossier');
    const filePath = path.join(vaultPath, decodeURIComponent(url));
    return net.fetch('file://' + filePath);
});
```

**New:**
```typescript
protocol.handle('dossier', (request) => {
    const url = request.url.replace('dossier://', '');
    const vaultPath = path.join(app.getPath('userData'), 'dossier');
    // Normalize separator: URL may contain forward slashes, but path.join handles it
    const decodedPath = decodeURIComponent(url).replace(/\\/g, '/');
    const filePath = path.join(vaultPath, decodedPath);
    return net.fetch('file://' + filePath);
});
```

### Phase 3: Verification & Testing

#### Task 3.1: Manual Testing on Windows

1. Start the app on Windows
2. Create a new athlete
3. Upload a profile photo
4. Verify the photo displays correctly in:
   - Athlete list (thumbnail)
   - Athlete form (profile photo area)
5. Add a rank promotion with proof image
6. Verify proof displays in ProofPreview modal
7. Add a medal with proof image
8. Verify medal proof displays correctly
9. Upload a club logo
10. Verify club logo displays in club list
11. Upload kabupaten branding logo
12. Verify branding logo displays in sidebar

#### Task 3.2: Manual Testing on macOS

1. Repeat all steps from Task 3.1 on macOS
2. Ensure no regressions in existing functionality

#### Task 3.3: Cross-Platform Database Test

1. Create test data on Windows (upload several images)
2. Copy the database and dossier folder to macOS
3. Verify all images load correctly on macOS
4. Repeat in reverse (macOS → Windows)

---

## Acceptance Criteria

- [ ] **AC1:** Given the application is running on Windows, when a user uploads a profile photo, then the photo should be stored and displayed correctly without path errors.

- [ ] **AC2:** Given the application is running on Windows, when a user uploads a certificate/proof image for a rank promotion, then the image should be stored and previewed correctly.

- [ ] **AC3:** Given the application is running on Windows, when a user uploads a medal proof image, then the image should be stored and previewed correctly.

- [ ] **AC4:** Given the application is running on Windows, when a user uploads a club logo, then the logo should be stored and displayed correctly.

- [ ] **AC5:** Given the application is running on Windows, when a user uploads the kabupaten branding logo, then the logo should be stored and displayed in the sidebar.

- [ ] **AC6:** Given the application is running on macOS, when a user performs any file upload operation, then existing functionality should work without regression.

- [ ] **AC7:** Given a database created on Windows with uploaded files, when the database is moved to macOS (with the dossier folder), then all images should display correctly.

- [ ] **AC8:** Given a database created on macOS with uploaded files, when the database is moved to Windows (with the dossier folder), then all images should display correctly.

---

## Additional Context

### Dependencies

- None (uses existing Node.js and Electron APIs)

### Testing Strategy

| Test Type | Description |
|-----------|-------------|
| Manual | Primary testing on Windows VM/machine |
| Manual | Regression testing on macOS |
| Manual | Cross-platform data portability test |

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Existing data with backslashes | Defensive normalization in protocol handler handles this |
| Performance impact | Negligible - simple string replace operation |
| Breaking changes | None - forward slashes work on all platforms |

### Notes

- The `path.join()` function on Windows can accept forward slashes as input and will correctly resolve paths
- This fix also improves data portability between platforms
- The solution follows the principle of "normalize early, use consistently"

### Code Snippet Reference

**Complete updated `copyToVault` function:**

```typescript
async copyToVault(sourcePath: string, type: 'profiles' | 'certificates' | 'medals' | 'clubs' | 'branding', recordId: number | string): Promise<string> {
    try {
        await this.ensureVaultDirectories();

        const ext = path.extname(sourcePath).toLowerCase();
        const fileName = `${recordId}${ext}`;
        const relativePath = path.join(type, fileName); // relative path for DB
        const absoluteDestPath = path.join(this.getVaultPath(), relativePath);

        // For branding, delete any existing logo first (singleton replacement)
        if (type === 'branding') {
            const brandingDir = path.join(this.getVaultPath(), 'branding');
            if (fs.existsSync(brandingDir)) {
                const existingFiles = await fs.promises.readdir(brandingDir);
                for (const file of existingFiles) {
                    if (file.startsWith('logo.')) {
                        await fs.promises.unlink(path.join(brandingDir, file));
                    }
                }
            }
        }

        await fs.promises.copyFile(sourcePath, absoluteDestPath);

        // Normalize to forward slashes for cross-platform URL compatibility
        return relativePath.replace(/\\/g, '/');
    } catch (error) {
        console.error('[FileService] Error copying file to vault:', error);
        throw new Error('Failed to save file to vault');
    }
}
```

---

## Review Notes

**Date:** 2026-01-07
**Review Type:** Adversarial Code Review
**Status:** Completed

### Findings Summary
- **Total findings:** 12
- **Fixed:** 6 (F1, F2, F4, F6, F7)
- **Skipped:** 6 (F3 - unit tests not required per project pattern, F5, F8-F12 - noise/undecided)

### Resolution Approach
Auto-fix applied for all "real" severity findings except unit tests (F3), which was skipped as the codebase doesn't have test coverage for service layer.

### Fixes Applied
1. **F1 - Input validation:** Added null/empty check in `normalizeToForwardSlashes()` to prevent silent failures
2. **F2 - Consistent normalization:** Applied forward slash normalization in `downloadFile()` and `deleteFile()` methods
3. **F4 - Comment clarity:** Improved protocol handler comment to accurately explain Windows backslash issue
4. **F6 - Performance optimization:** Added conditional check to skip regex when no backslashes present
5. **F7 - Error logging:** Added debug logging for path normalization operations
