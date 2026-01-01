# Tech-Spec: Document Attachment System (Story 4.1)

**Created:** 2026-01-01  
**Status:** Ready for Development  
**Related Stories:** E4.S1 (Document Attachment), E4.S2 (Certificate Preview), E4.S3 (Athlete Profile Photo)

## Overview

### Problem Statement

Coaches need to digitally manage scanned certificates and athlete photos to maintain a complete "Digital Dossier" for each athlete. Currently:
- Profile photo placeholder exists but is non-functional
- "View Proof" buttons in rank/medal history show mock previews
- No file storage mechanism exists
- No database columns for storing file paths
- Risk of broken links if files are moved manually

### Solution

Implement a unified file attachment system that:
1. Allows coaches to upload and store athlete profile photos
2. Enables attaching proof images to rank promotions and medal records
3. Copies all files to a secure local "vault" directory to prevent broken links
4. Displays dossier status badges in the athlete list
5. Integrates seamlessly with existing UI placeholders

### Scope

**In Scope:**
- ✅ File selection dialog (restricted to image formats: JPG, PNG, WEBP)
- ✅ File size validation (max 1MB per file)
- ✅ Copy files to local vault directory (`userData/dossier/`)
- ✅ Database schema updates (modify migration 001)
- ✅ File service for vault management
- ✅ IPC bridge for file operations
- ✅ UI integration with existing placeholders
- ✅ Dossier status badge in athlete list
- ✅ Profile photo upload and display
- ✅ Certificate proof upload for promotions and medals

**Out of Scope:**
- ❌ Image cropping/editing tools (future enhancement)
- ❌ Cloud storage or sync
- ❌ Multiple file attachments per record
- ❌ File compression or optimization
- ❌ OCR or automatic data extraction from certificates

---

## Context for Development

### Codebase Patterns

**Process Separation:**
- Main Process: File system operations, database access
- Renderer Process: UI components, user interactions
- Communication via typed IPC bridge in `preload.ts`

**Repository Pattern:**
- All SQL queries centralized in `src/main/repositories/`
- No raw SQL in service or IPC handlers

**Feature-Based Organization:**
- UI components in `src/renderer/features/athletes/`
- Shared components in `src/renderer/components/`

**Validation:**
- All data validated using Zod schemas in `src/shared/schemas.ts`

**Naming Conventions:**
- IPC handlers: `namespace:action` (e.g., `files:selectImage`)
- Database columns: `snake_case`
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components

### Files to Reference

**Existing Components:**
1. **AthleteForm.tsx** (lines 280-298): Profile photo placeholder
2. **ProofPreview.tsx**: Modal for viewing images (needs actual image display)
3. **Timeline.tsx**: Rank promotion history with "View Proof" button
4. **MedalList.tsx**: Medal records with "View Proof" button
5. **001_initial_schema.ts**: Database migration to modify
6. **schemas.ts**: Zod validation schemas to extend

**Patterns to Follow:**
- **athleteService.ts**: IPC handler pattern
- **athleteRepository.ts**: Repository pattern
- **BackupService.ts**: File system operations using Electron dialog

### Technical Decisions

**1. Vault Directory Structure:**
```
{userData}/dossier/
├── profiles/          # Athlete profile photos
│   └── {athleteId}.{ext}
├── certificates/      # Rank promotion certificates  
│   └── {promotionId}.{ext}
└── medals/           # Medal/achievement proofs
    └── {medalId}.{ext}
```

**2. File Naming Strategy:**
- Use record ID as filename to ensure uniqueness
- Preserve original file extension
- Example: `profiles/42.jpg`, `certificates/15.png`

**3. File Type Restrictions:**
- Allowed formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Validation in both file dialog filter and backend

**4. File Size Limit:**
- Maximum file size: **1MB (1,048,576 bytes)**
- Validation performed before file copy operation
- User-friendly error message if file exceeds limit
- Rationale: Keep vault size manageable, encourage optimized images

**5. Database Schema Changes:**
- Modify `001_initial_schema.ts` (app not in production yet)
- Add nullable TEXT columns for file paths
- Store relative paths from vault root (e.g., `profiles/42.jpg`)

**6. Error Handling:**
- Graceful fallback if file doesn't exist (show placeholder)
- User-friendly error messages for file operations
- Validate file exists before copying
- Reject files exceeding 1MB with clear error message

---

## Implementation Plan

### Tasks

#### **Task 1: Database Schema Update**
- [ ] Modify `src/main/migrations/001_initial_schema.ts`
- [ ] Add `profile_photo_path TEXT` column to `athletes` table
- [ ] Add `proof_image_path TEXT` column to `promotions` table  
- [ ] Add `proof_image_path TEXT` column to `medals` table
- [ ] Test migration runs successfully on fresh database

#### **Task 2: Extend Zod Schemas**
- [ ] Update `AthleteSchema` in `src/shared/schemas.ts`
  - Add `profile_photo_path: z.string().optional()`
- [ ] Update `PromotionSchema`
  - Add `proof_image_path: z.string().optional()`
- [ ] Update `MedalSchema`
  - Add `proof_image_path: z.string().optional()`

#### **Task 3: Create File Service**
- [ ] Create `src/main/services/FileService.ts`
- [ ] Implement `selectImageFile()`: Open file dialog with image filters
- [ ] Implement `validateFileSize(filePath)`: Check file size ≤ 1MB (1,048,576 bytes)
- [ ] Implement `copyToVault(sourcePath, type, recordId)`: Copy file to vault after validation
- [ ] Implement `getImagePath(type, recordId)`: Retrieve file path
- [ ] Implement `deleteImage(type, recordId)`: Remove file from vault (optional cleanup)
- [ ] Implement `ensureVaultDirectories()`: Create vault folders on startup
- [ ] Export `setupFileHandlers()`

#### **Task 4: Update IPC Bridge**
- [ ] Add file handlers to `src/main/preload.ts`:
  ```typescript
  files: {
    selectImage: () => ipcRenderer.invoke('files:selectImage'),
    uploadToVault: (sourcePath, type, recordId) => 
      ipcRenderer.invoke('files:uploadToVault', sourcePath, type, recordId),
    getImagePath: (type, recordId) => 
      ipcRenderer.invoke('files:getImagePath', type, recordId),
  }
  ```
- [ ] Register handlers in `src/main/main.ts` via `setupFileHandlers()`

#### **Task 5: Update Repository Layer**
- [ ] Modify `src/main/repositories/athleteRepository.ts`
  - Update `create()` to include `profile_photo_path`
  - Update `update()` to include `profile_photo_path`
  - Update `getAll()` to return `profile_photo_path`
- [ ] Modify `src/main/repositories/historyRepository.ts`
  - Update `addPromotion()` to include `proof_image_path`
  - Update `getPromotions()` to return `proof_image_path`
  - Update `addMedal()` to include `proof_image_path`
  - Update `getMedals()` to return `proof_image_path`

#### **Task 6: UI - Profile Photo Upload**
- [ ] Update `src/renderer/features/athletes/AthleteForm.tsx`
- [ ] Make profile photo div clickable (remove `cursor-not-allowed`)
- [ ] Add `onClick` handler to trigger file selection
- [ ] Display uploaded photo instead of initials
- [ ] Show upload progress/feedback
- [ ] Handle file selection → upload → update athlete record flow

#### **Task 7: UI - Certificate Proof Upload (Promotions)**
- [ ] Update `src/renderer/features/athletes/history/Timeline.tsx`
- [ ] Make "Proof of Promotion" upload functional
- [ ] Add file selection on button click
- [ ] Upload file when promotion is saved
- [ ] Enable "View Proof" button when proof exists
- [ ] Pass actual image path to `ProofPreview` component

#### **Task 8: UI - Medal Proof Upload**
- [ ] Update `src/renderer/features/athletes/history/MedalList.tsx`
- [ ] Make "Proof of Medal" upload functional
- [ ] Add file selection on button click
- [ ] Upload file when medal is saved
- [ ] Enable "View Proof" button when proof exists
- [ ] Pass actual image path to `ProofPreview` component

#### **Task 9: UI - Proof Preview Component**
- [ ] Update `src/renderer/components/ProofPreview.tsx`
- [ ] Accept `imagePath` prop
- [ ] Display actual image using `file://` protocol or base64
- [ ] Add zoom/pan controls (optional)
- [ ] Handle missing file gracefully (show placeholder)

#### **Task 10: UI - Dossier Status Badge**
- [ ] Update `src/renderer/features/athletes/AthleteList.tsx`
- [ ] Add dossier status indicator to each athlete card
- [ ] Show "✓ Complete" if profile photo exists
- [ ] Show "⚠ Incomplete" if no profile photo
- [ ] Style as simple badge (green/yellow)

#### **Task 11: Integration Testing**
- [ ] Test profile photo upload and display
- [ ] Test promotion certificate upload and preview
- [ ] Test medal proof upload and preview
- [ ] Test dossier status badge updates
- [ ] Test file persistence across app restarts
- [ ] Test error handling (invalid file types, missing files)
- [ ] Test vault directory creation on first run

---

### Acceptance Criteria

**AC1: File Selection Dialog**
- **Given** a coach clicks "Upload Photo" or "Upload Proof"
- **When** the file dialog opens
- **Then** only image files (JPG, PNG, WEBP) are selectable

**AC2: File Size Validation**
- **Given** a coach selects an image file
- **When** the file size exceeds 1MB
- **Then** an error message is displayed: "File size must be under 1MB. Please compress or resize the image."
- **And** the file is not uploaded
- **When** the file size is ≤ 1MB
- **Then** the upload proceeds normally

**AC3: File Vault Storage**
- **Given** a coach selects a valid image file (≤ 1MB)
- **When** the file is uploaded
- **Then** the file is copied to `{userData}/dossier/{type}/{recordId}.{ext}`
- **And** the original file remains unchanged
- **And** the relative path is stored in the database

**AC4: Profile Photo Display**
- **Given** an athlete has an uploaded profile photo
- **When** viewing the athlete in the list or detail modal
- **Then** the photo is displayed instead of initials
- **And** clicking the photo allows re-uploading

**AC5: Certificate Proof Attachment**
- **Given** a coach adds a rank promotion or medal
- **When** they upload a proof image
- **Then** the image is stored in the vault
- **And** the "View Proof" button becomes active
- **And** clicking "View Proof" displays the actual image

**AC6: Dossier Status Badge**
- **Given** an athlete in the list view
- **When** the athlete has a profile photo
- **Then** a "✓ Complete" badge is shown
- **When** the athlete has no profile photo
- **Then** a "⚠ Incomplete" badge is shown

**AC7: Proof Preview Modal**
- **Given** a proof image exists for a promotion/medal
- **When** the coach clicks "View Proof"
- **Then** the ProofPreview modal opens
- **And** the actual certificate image is displayed
- **And** the image can be viewed in high resolution

**AC8: Error Handling**
- **Given** a file operation fails (invalid type, file size > 1MB, file not found, permission error)
- **When** the error occurs
- **Then** a user-friendly error message is displayed
- **And** the application remains stable

**AC9: Data Persistence**
- **Given** files are uploaded to the vault
- **When** the application is restarted
- **Then** all uploaded images are still accessible
- **And** file paths remain valid

---

## Additional Context

### Dependencies

**Existing:**
- `better-sqlite3`: Database operations
- `electron`: File system access, dialog API
- `zod`: Schema validation
- `react-hook-form`: Form handling

**New (if needed):**
- None - all required functionality available in Electron API

### Testing Strategy

**Unit Tests:**
- File service functions (copy, delete, path resolution)
- Schema validation with new fields

**Integration Tests:**
- File upload → vault storage → database update flow
- Image display in UI components
- Error handling for missing/invalid files

**Manual Testing:**
- Upload various image formats (JPG, PNG, WEBP)
- Test with files exactly at 1MB boundary (1,048,576 bytes)
- Test with files exceeding 1MB (should show error)
- Test with files under 1MB (should succeed)
- Verify vault directory creation on first run
- Test file persistence across app restarts
- Verify dossier badge updates in real-time

### Notes

**Security Considerations:**
- Files stored locally only (no cloud upload)
- Validate file types on both frontend and backend
- Enforce 1MB file size limit to prevent disk space abuse
- Sanitize file paths to prevent directory traversal

**Performance:**
- File copy operations are synchronous (acceptable for local files ≤ 1MB)
- 1MB limit ensures fast copy operations and minimal memory usage
- Consider lazy loading images in list view if performance degrades
- No image compression in MVP (future enhancement)

**Future Enhancements:**
- Image cropping for profile photos
- Thumbnail generation for faster list rendering
- Bulk upload for multiple certificates
- Export dossier as PDF package

**Edge Cases to Handle:**
- User deletes vault directory manually → recreate on next upload
- User moves vault directory → show error, allow re-upload
- Duplicate uploads → overwrite existing file
- File extension case sensitivity → normalize to lowercase
- File exactly 1MB (1,048,576 bytes) → should be accepted
- File 1 byte over 1MB → should be rejected with clear message

---

## Implementation Sequence Recommendation

1. **Foundation** (Tasks 1-2): Database and schemas
2. **Backend** (Tasks 3-5): File service, IPC, repositories
3. **Frontend** (Tasks 6-9): UI integration
4. **Polish** (Tasks 10-11): Dossier badge and testing

**Estimated Effort:** 6-8 hours for experienced developer

---

**Tech-Spec Status:** ✅ COMPLETE - Ready for Implementation
