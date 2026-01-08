# Tech-Spec: E9.S4 - Extended Athlete Profile & Official Documents

**Created:** 2026-01-08  
**Status:** Ready for Development  
**Story:** Epic 9, Story 4 - Extended Athlete Profile & Official Documents

## Overview

### Problem Statement

The current athlete profile lacks comprehensive fields required for official tournament registration and government document tracking. Additionally, when athlete data is updated or deleted, associated files (documents, photos) are not automatically cleaned up from the vault, leading to orphaned files and wasted storage.

**User Requirements:**
1. Record additional profile fields: First Date Joined Judo, School Name, NISN (National Student ID), NIK (National ID)
2. Auto-generate a unique "Nomor Anggota" (Member ID) with club prefix
3. Upload and manage official government documents: KK (Family Card), KTP/KIA (ID Card), Akta Lahir (Birth Certificate)
4. Ensure file cleanup when documents are replaced or athlete is deleted
5. All new fields and documents are optional
6. File size limit: 1MB for all uploads
7. Support both image (JPG, PNG, WEBP) and PDF formats

### Solution

Extend the athlete schema with new profile fields and document attachment capabilities. Implement auto-generation logic for Member ID using club prefix + sequential number. Add document management UI with upload/preview/delete functionality. Enhance the repository layer to track and cleanup all associated files (profile photo + 3 official documents) when data is updated or deleted.

### Scope (In/Out)

**In Scope:**
- ✅ Database schema migration for new fields
- ✅ Zod schema updates for validation
- ✅ Member ID auto-generation with club prefix
- ✅ UI form fields for new profile data
- ✅ Document upload UI (3 document types)
- ✅ File validation (size, type)
- ✅ File cleanup on update/delete (both scenarios)
- ✅ FileService enhancement for document storage
- ✅ IPC handlers for document operations

**Out of Scope:**
- ❌ Bulk import of athlete documents
- ❌ Document OCR or auto-fill from scanned documents
- ❌ Document expiration tracking
- ❌ Export of documents in PDF rosters (future enhancement)

---

## Context for Development

### Codebase Patterns

**Repository Pattern:**
```typescript
// Pattern: Repository methods are synchronous, use FileService.queueFileCleanup()
export const athleteRepository = {
  update: (athlete: Athlete): boolean => {
    const db = getDatabase();
    const old = db.prepare('SELECT profile_photo_path FROM athletes WHERE id = ?').get(athlete.id);
    const oldPhotoPath = old?.profile_photo_path || null;
    
    // ... perform update ...
    
    // Queue cleanup if file was replaced
    if (info.changes > 0 && oldPhotoPath && athlete.profile_photo_path && oldPhotoPath !== athlete.profile_photo_path) {
      FileService.queueFileCleanup(oldPhotoPath);
    }
    return info.changes > 0;
  }
}
```

**File Upload Pattern:**
```typescript
// Pattern: Select file -> Validate -> Upload to vault -> Update DB
const handlePhotoUpload = async () => {
  const filePath = await window.api.files.selectImage();
  if (!filePath) return;
  
  if (!initialData?.id) {
    alert("Please save the athlete first before uploading a photo.");
    return;
  }
  
  const vaultPath = await window.api.files.uploadToVault(filePath, 'profiles', initialData.id);
  const validatedData = AthleteSchema.parse({ ...currentValues, profile_photo_path: vaultPath });
  await onSubmit(validatedData);
};
```

**Zod Schema Pattern:**
```typescript
// Pattern: Optional fields use .nullable().optional().or(z.literal(''))
birth_place: z.string().min(2, 'Birth place must be at least 2 characters')
  .max(100, 'Birth place is too long')
  .nullable()
  .optional()
  .or(z.literal('')),
```

**Migration Pattern:**
```typescript
// Pattern: Migrations are versioned and run sequentially
export const migration002: Migration = {
  version: 2,
  name: 'Extended Athlete Profile',
  up: (db) => {
    db.exec(`ALTER TABLE athletes ADD COLUMN new_field TEXT;`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_athletes_new_field ON athletes(new_field);`);
  }
};
```

### Files to Reference

**Core Files:**
1. `src/main/migrations/001_initial_schema.ts` - Current schema structure
2. `src/shared/schemas.ts` - Zod validation schemas
3. `src/main/repositories/athleteRepository.ts` - CRUD operations with file cleanup
4. `src/main/repositories/clubRepository.ts` - Reference for file cleanup pattern
5. `src/renderer/features/athletes/AthleteForm.tsx` - Form UI with inline editing
6. `src/main/services/FileService.ts` - File operations and vault management

**Related Files:**
7. `src/main/db.ts` - Database initialization
8. `src/shared/types/domain.ts` - Enums and types
9. IPC type definitions (check for `electron.d.ts` or similar)

### Technical Decisions

**Decision 1: Member ID Generation Strategy**
- **Format:** `{CLUB_PREFIX}-{SEQUENCE}`
- **Example:** `BJC-001`, `BJC-002` (BJC = Bantul Judo Club)
- **Logic:** 
  - If athlete has no club: Use default prefix "JCC" (Judo Command Center)
  - Query max sequence for that club prefix
  - Increment and zero-pad to 3 digits
  - Store as string in `member_id` column
  - Generate on athlete creation, immutable thereafter

**Decision 2: Document Storage Structure**
- **Vault Path:** `dossier/documents/{athleteId}/`
- **File Naming:** `{documentType}.{ext}` (e.g., `kk.pdf`, `ktp.jpg`)
- **Rationale:** One file per document type per athlete, replacements overwrite

**Decision 3: File Cleanup Scenarios**
1. **Document Replacement:** When user uploads new KK, delete old KK file
2. **Athlete Deletion:** Delete all 4 files (profile_photo + 3 documents)
3. **Implementation:** Use `FileService.queueFileCleanup()` for async cleanup

**Decision 4: File Type Support**
- **Accepted:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`
- **Validation:** Check extension + MIME type (if possible)
- **Size Limit:** 1MB (1,048,576 bytes) - enforced by FileService

**Decision 5: UI Layout**
- **New Section:** "Official Documents" below "Detailed Information"
- **Document Cards:** Each document type gets a card with upload/preview/delete actions
- **Visual Indicator:** Show file name + size when uploaded, placeholder when empty

---

## Implementation Plan

### Tasks

#### **Task 1: Database Schema Migration**
- [ ] Create new migration file: `src/main/migrations/002_extended_athlete_profile.ts`
- [ ] Add columns to `athletes` table:
  - `member_id TEXT UNIQUE` (auto-generated)
  - `first_joined_date TEXT` (ISO date format)
  - `school_name TEXT`
  - `nisn TEXT` (15-digit student ID)
  - `nik TEXT` (16-digit national ID)
  - `kk_document_path TEXT` (Kartu Keluarga)
  - `ktp_kia_document_path TEXT` (KTP/KIA)
  - `birth_cert_document_path TEXT` (Akta Lahir)
- [ ] Create indexes for searchable fields (member_id, nisn, nik)
- [ ] Register migration in migration service

#### **Task 2: Update Zod Schemas**
- [ ] Extend `AthleteSchema` in `src/shared/schemas.ts`:
  - `member_id`: `z.string().optional()` (read-only, auto-generated)
  - `first_joined_date`: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().or(z.literal(''))`
  - `school_name`: `z.string().max(200).nullable().optional().or(z.literal(''))`
  - `nisn`: `z.string().regex(/^\d{15}$/, 'NISN must be 15 digits').nullable().optional().or(z.literal(''))`
  - `nik`: `z.string().regex(/^\d{16}$/, 'NIK must be 16 digits').nullable().optional().or(z.literal(''))`
  - `kk_document_path`: `z.union([z.string(), z.null(), z.undefined()]).optional()`
  - `ktp_kia_document_path`: `z.union([z.string(), z.null(), z.undefined()]).optional()`
  - `birth_cert_document_path`: `z.union([z.string(), z.null(), z.undefined()]).optional()`

#### **Task 3: Implement Member ID Auto-Generation**
- [ ] Create utility function `generateMemberId(clubId: number | null): string` in `src/main/utils/memberIdGenerator.ts`
  - Query club by ID to get name
  - Extract first 3 letters as prefix (uppercase), fallback to "JCC"
  - Query max member_id with same prefix pattern
  - Parse sequence number, increment, zero-pad to 3 digits
  - Return formatted ID: `{PREFIX}-{SEQUENCE}`
- [ ] Integrate into `athleteRepository.create()`:
  - Generate member_id before insert
  - Include in INSERT statement

#### **Task 4: Enhance FileService for Documents**
- [ ] Add `'documents'` to vault subdirectories in `FileService.ensureVaultDirectories()`
- [ ] Update `FileService.selectImageFile()` to accept file type parameter:
  - Rename to `selectFile(type: 'image' | 'document')`
  - For 'image': `['jpg', 'jpeg', 'png', 'webp']`
  - For 'document': `['jpg', 'jpeg', 'png', 'webp', 'pdf']`
- [ ] Update `copyToVault()` to handle document subdirectories:
  - For type='documents', use path: `documents/{recordId}/{fileName}`
  - Support custom fileName parameter for document types
  - **IMPORTANT:** Continue using `normalizeToForwardSlashes()` for all stored paths (Windows compatibility)
- [ ] Add `deleteDocument(athleteId: number, docType: string)` helper

#### **Task 5: Update Athlete Repository**
- [ ] Modify `athleteRepository.create()`:
  - Generate member_id before insert
  - Add new columns to INSERT statement
- [ ] Modify `athleteRepository.update()`:
  - Retrieve old document paths (all 3 types)
  - Update all new columns
  - Queue cleanup for each replaced document
- [ ] Modify `athleteRepository.delete()`:
  - Retrieve all file paths (profile_photo + 3 documents)
  - Queue cleanup for all 4 files after successful deletion

#### **Task 6: Add IPC Handlers**
- [ ] In `src/main/services/FileService.ts` (setupFileHandlers):
  - `files:selectDocument` - Select document file (images + PDF)
  - `files:uploadDocument` - Upload to `documents/{athleteId}/{docType}.{ext}`
  - `files:deleteDocument` - Delete specific document by athlete ID + type
- [ ] Update TypeScript definitions for new IPC channels

#### **Task 7: Update AthleteForm UI**
- [ ] Add new form section: "Judo Membership & School Information"
  - Display `member_id` as read-only badge (auto-generated on save)
  - Input field: `first_joined_date` (date picker)
  - Input field: `school_name` (text)
  - Input field: `nisn` (text, 15 digits, numeric only)
  - Input field: `nik` (text, 16 digits, numeric only)
- [ ] Add new form section: "Official Documents"
  - Document card for "KK (Kartu Keluarga)"
  - Document card for "KTP/KIA Athlete"
  - Document card for "Akta Lahir (Birth Certificate)"
  - Each card shows:
    - Upload button (if empty)
    - File name + size + preview/delete buttons (if uploaded)
    - File type icon (PDF vs Image)
- [ ] Implement document upload handlers:
  - `handleDocumentUpload(docType: 'kk' | 'ktp_kia' | 'birth_cert')`
  - Validate athlete is saved (has ID)
  - Select file via IPC
  - Validate size (1MB)
  - Upload to vault
  - Update athlete record
- [ ] Implement document delete handlers:
  - Confirm deletion
  - Call IPC to delete file
  - Update athlete record (set path to null)

#### **Task 8: Testing & Validation**
- [ ] Test member ID generation with different clubs
- [ ] Test member ID uniqueness constraint
- [ ] Test document upload (all 3 types, both image and PDF)
- [ ] Test file size validation (reject >1MB)
- [ ] Test document replacement (old file deleted)
- [ ] Test athlete deletion (all files cleaned up)
- [ ] Test form validation for NISN (15 digits) and NIK (16 digits)
- [ ] Test UI with and without club assignment
- [ ] **Windows Testing:** Verify file paths are normalized correctly (forward slashes in DB)
- [ ] **Windows Testing:** Verify document upload/preview/delete work on Windows OS
- [ ] **Cross-Platform:** Verify `dossier://` protocol works on both Windows and macOS

---

### Acceptance Criteria

#### AC1: New Profile Fields
**Given** the Athlete Form  
**When** the coach inputs data  
**Then** they should be able to record:
- First Date Joined Judo (date picker)
- School Name (text, max 200 chars)
- NISN (15 digits, optional)
- NIK (16 digits, optional)

**And** all fields should be optional  
**And** validation errors should display for invalid NISN/NIK formats

#### AC2: Auto-Generated Member ID
**Given** a new athlete is being created  
**When** the athlete has a club assigned  
**Then** the system should automatically generate a Member ID with format `{CLUB_PREFIX}-{SEQUENCE}`  
**Example:** "BJC-001" for Bantul Judo Club

**When** the athlete has no club assigned  
**Then** the system should use default prefix "JCC"  
**Example:** "JCC-001"

**And** the Member ID should be displayed as a read-only badge in the form  
**And** the Member ID should be unique across all athletes

#### AC3: Official Document Upload
**Given** an athlete profile (saved with ID)  
**When** the coach manages documents  
**Then** they should be able to upload specific files:
- KK (Kartu Keluarga / Family Card)
- KTP/KIA (Athlete ID Card)
- Akta Lahir (Birth Certificate)

**And** each document should accept both images (JPG, PNG, WEBP) and PDF files  
**And** files larger than 1MB should be rejected with error message  
**And** uploaded documents should be securely stored in the local vault at `dossier/documents/{athleteId}/`

#### AC4: Document Preview & Management
**Given** an athlete has uploaded documents  
**When** viewing the athlete profile  
**Then** each document card should display:
- File name
- File size
- Preview button (opens in modal or external viewer)
- Delete button (with confirmation)

**When** a document is deleted  
**Then** the file should be removed from the vault  
**And** the database field should be set to null

#### AC5: File Cleanup on Document Replacement
**Given** an athlete has an existing document (e.g., KK)  
**When** the coach uploads a new file for the same document type  
**Then** the old file should be automatically deleted from the vault  
**And** the new file should be stored  
**And** the database should reference the new file path

#### AC6: File Cleanup on Athlete Deletion
**Given** an athlete with uploaded profile photo and documents  
**When** the athlete record is deleted  
**Then** all associated files should be automatically deleted:
- Profile photo
- KK document
- KTP/KIA document
- Birth Certificate document

**And** the deletion should be queued asynchronously to avoid blocking the database operation

#### AC7: Form Validation
**Given** the athlete form with new fields  
**When** the coach enters invalid data  
**Then** appropriate validation errors should display:
- NISN must be exactly 15 digits (if provided)
- NIK must be exactly 16 digits (if provided)
- School name must not exceed 200 characters
- First joined date must be valid ISO format

**And** the form should prevent submission until errors are resolved

---

## Additional Context

### Dependencies

**NPM Packages (Already Installed):**
- `better-sqlite3` - Database operations
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration

**No New Dependencies Required**

### Testing Strategy

**Unit Tests (Manual):**
1. Member ID generation logic
   - Test with club assigned
   - Test without club (default prefix)
   - Test sequence increment
   - Test uniqueness constraint

2. File cleanup logic
   - Test document replacement
   - Test athlete deletion
   - Verify orphaned files are removed

**Integration Tests (Manual):**
1. End-to-end athlete creation with all fields
2. Document upload flow (all 3 types)
3. Document replacement flow
4. Athlete deletion with file cleanup verification

**UI Tests (Manual):**
1. Form field validation (NISN, NIK)
2. Document upload UI states (empty, uploaded, error)
3. File size validation error messages
4. Member ID display (read-only badge)

### Notes

**Database Migration Safety:**
- Migration adds new columns with NULL default
- Existing athletes will have NULL for new fields
- No data migration needed (all fields optional)

**File Storage Considerations:**
- Documents stored per athlete: `dossier/documents/{athleteId}/kk.pdf`
- One file per document type (replacements overwrite)
- FileService.queueFileCleanup() uses setImmediate for async deletion
- Cleanup failures are logged but don't block operations

**Windows Compatibility (Cross-Platform File Handling):**
- ✅ **Already Implemented:** FileService uses `normalizeToForwardSlashes()` helper
- **Pattern:** All file paths stored in DB use forward slashes (`/`) regardless of OS
- **Why:** The `dossier://` protocol requires URL-safe paths (forward slashes)
- **How it works:**
  1. Windows file selection returns paths with backslashes: `C:\Users\...\file.pdf`
  2. `copyToVault()` normalizes to forward slashes before storing: `documents/123/kk.pdf`
  3. Database stores normalized path: `documents/123/kk.pdf`
  4. `path.join()` converts back to OS-specific format when accessing filesystem
  5. `dossier://` protocol works on both Windows and macOS/Linux
- **Example Flow:**
  ```typescript
  // Windows: User selects C:\Users\Coach\Documents\kk.pdf
  const sourcePath = 'C:\\Users\\Coach\\Documents\\kk.pdf';
  
  // FileService.copyToVault() normalizes the relative path
  const relativePath = 'documents/123/kk.pdf'; // Stored in DB
  
  // When reading, path.join() converts to OS format
  const absolutePath = path.join(vaultPath, relativePath);
  // Windows: C:\Users\Coach\AppData\Roaming\app\dossier\documents\123\kk.pdf
  // macOS: /Users/coach/Library/Application Support/app/dossier/documents/123/kk.pdf
  ```
- **No Changes Needed:** Existing FileService pattern handles Windows correctly
- **Testing:** Verify on Windows that document upload/delete/preview all work

**UI/UX Considerations:**
- Member ID shown as badge, not editable
- Document upload disabled until athlete is saved (needs ID)
- Clear visual distinction between image and PDF documents
- Confirmation dialog before document deletion

**Performance:**
- Member ID generation queries max ID per prefix (indexed)
- File cleanup is asynchronous (non-blocking)
- Document preview uses `dossier://` protocol (efficient)

**Future Enhancements (Out of Scope):**
- Export documents in PDF rosters
- Document expiration tracking
- Bulk document import
- OCR for auto-filling fields from scanned documents

---

## Implementation Checklist

Before starting development, ensure:
- ✅ Database migration service is working
- ✅ FileService vault directories are initialized
- ✅ IPC handlers are properly typed
- ✅ Test with both new and existing athletes
- ✅ Verify file cleanup in both scenarios (update/delete)

**Estimated Effort:** 6-8 hours
**Complexity:** Medium (database + file management + UI)
**Risk Areas:** File cleanup timing, member ID uniqueness, PDF preview support

---

**Ready for Development** ✅
