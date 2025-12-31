# Epics and Stories - athletes-management-system

This document outlines the epics and user stories for the Athletes Management System, derived from the PRD and Architecture documents.

## Epic 1: Project Foundation & Core Infrastructure
*Goal: Establish the technical foundation including the Electron shell, React renderer, and SQLite persistence layer.*

### Story E1.S1: Project Initialization & Electron Shell
**As a developer,** I want to initialize the project using the Electron Forge Vite + TypeScript template so that I have a modern, type-safe development environment.
**Acceptance Criteria:**
- [x] Project initialized with `npx create-electron-app@latest . --template=vite-typescript`.
- [x] Folder structure matches the Architecture Decision Document.
- [x] `npm run start` launches a basic Electron window.
- [x] TypeScript is configured with strict mode.

### Story E1.S2: SQLite Persistence Layer Setup
**As a system,** I want to establish a robust SQLite connection with Write-Ahead Logging (WAL) enabled so that data is durable and operations are fast.
**Acceptance Criteria:**
- [x] `better-sqlite3` is installed and configured in the main process.
- [x] Database connection established with WAL mode enabled.
- [x] Base schema (athletes, rulesets, etc.) is defined and applied on startup.
- [x] Repository pattern implemented for base database operations.

### Story E1.S3: IPC Bridge & Service Layer
**As a developer,** I want a typed IPC bridge between the main and renderer processes so that UI-system communication is secure and predictable.
**Acceptance Criteria:**
- [x] Preload script defines typed IPC handlers.
- [x] Renderer process has a `useService` hook to call main process methods.
- [x] IPC response wrapper `{ success, data, error }` is implemented.

### Story E1.S4: Global State & UI Framework Setup
**As a developer,** I want to set up Zustand and Tailwind CSS in the renderer process so that I can build a responsive, state-driven UI.
**Acceptance Criteria:**
- [x] Zustand installed and basic store structure created.
- [x] Tailwind CSS configured with the custom color system from the UX spec (Midnight Hybrid).
- [x] Base layout (Sidebar + Content Area) implemented.

### Story E1.S5: Database Backup & Snapshot
**As a coach,** I want to manually trigger a database backup to a USB drive so that I can keep my data safe and portable.
**Acceptance Criteria:**
- [x] Export button in Settings/Admin area.
- [x] File dialog to select destination.
- [x] Copies the SQLite file to the destination with a timestamped name.
- [x] Import/Restore capability (overwrites existing data) with confirmation warning.

### Story E1.S6: Application Update Mechanism
**As a coach,** I want to update the application by simply running a new installer so that I can get features without internet auto-updates.
**Acceptance Criteria:**
- [x] Installer updates the binary but preserves the SQLite database (local implementation).
- [x] Logic to ensure database schema migrations run on startup if version changes.

---

## Epic 2: Athlete Management (CRUD & List)
*Goal: Provide the core athlete management capabilities with high-density data visualization.*

### Story E2.S1: Athlete Profile Creation
**As a coach,** I want to create new athlete profiles with mandatory fields so that I can begin building my athlete pool.
**Acceptance Criteria:**
- [x] Form for Name, Birth Date (Calendar), Gender, Weight, and Rank.
- [x] Zod validation for all inputs.
- [x] Success/Error feedback upon submission.
- [x] Persistence to SQLite (TEXT ISO format).

### Story E2.S2: High-Density Athlete List
**As a coach,** I want a fast, "clinical" list view of all athletes so that I can scan my entire pool efficiently.
**Acceptance Criteria:**
- [x] High-density grid implementation (Tailwind).
- [x] Athlete names, birth years (derived), and weight categories displayed clearly.
- [x] Visual belt color indicators (vector-style or stylized badges).
- [x] Profile picture/Initial avatar integration.
- [x] Search/Filter by name (client-side or fast SQL).

### Story E2.S3: Athlete Profile Editing & Deletion
**As a coach,** I want to update or remove athlete records so that my database stays current.
**Acceptance Criteria:**
- [x] "Edit" mode for existing athlete profiles.
- [x] Delete confirmation to prevent accidental data loss.
- [x] Changes reflected instantly in the list (Zustand/SQLite sync).

### Story E2.S4: Rank & Medal History
**As a coach,** I want to record promotion dates and medal wins so that I can track athlete progression.
**Acceptance Criteria:**
- [x] History log for "Rank Promotion" events with dates.
- [x] Ability to add "Medal/Achievement" records.
- [x] Current rank updates automatically based on latest promotion.




---

## Epic 3: Rulesets & Dynamic Eligibility
*Goal: Implement the "Judo Engine" that calculates categories and eligibility.*

### Story E3.S1: Ruleset Definition UI
**As a technical sensei,** I want to define age ranges for age categories (e.g., U-18 = ages 15-17) so that the system matches current federation standards.
**Acceptance Criteria:**
- [x] Management UI for Age Categories.
- [x] Ability to set age ranges (min_age, max_age) instead of birth years.
- [x] Age calculated as of January 1st of tournament year (IJF standard).
- [x] Stored in SQLite as templates.

### Story E3.S2: Dynamic Age Category Calculation
**As a system,** I want to automatically calculate an athlete's age category based on the active ruleset and tournament year so that the coach doesn't have to do it manually.
**Acceptance Criteria:**
- [x] Utility function in `shared/judo/` for age calculation (age = referenceYear - birthYear).
- [x] Athlete list displays the calculated category (e.g., "U-18 Cadets").
- [x] Tournament year selector (current year + 3 future years) for planning.
- [x] Updates instantly when the tournament year or athlete birth date changes.
- [x] Age categories prioritize exact gender match (M/F) over MIXED.

### Story E3.S3: Rank Order Configuration
**As a technical sensei,** I want to define the order of belt ranks so that the system knows how to sort athletes by seniority.
**Acceptance Criteria:**
- [ ] Configuration UI to reorder ranks (e.g., White < Yellow).
- [ ] Sorting logic in Athlete List respects this hierarchy.

---

## Epic 4: Digital Dossier (Document Management)
*Goal: Securely manage and preview scanned technical certifications.*

### Story E4.S1: Document Attachment (Link to Local File)
**As a coach,** I want to link a scanned certificate to an athlete's profile so that I have a digital record of their rank.
**Acceptance Criteria:**
- [ ] File selection dialog restricted to image formats.
- [ ] System handles local path persistence (absolute paths or vault relative).
- [ ] Athlete list shows "Dossier Status" (e.g., "Scan Attached").

### Story E4.S2: Certificate Preview (Detail Drawer)
**As a coach,** I want to preview certificate scans and proof images (e.g., from Rank/Medal history) in a slide-out drawer or modal so that I can verify data without leaving the context.
**Acceptance Criteria:**
- [ ] Slide-out `DetailDrawer` component or High-Fidelity Modal.
- [ ] High-resolution image preview.
- [ ] Toggle for "Verified" status once the scan is checked.
- [ ] Integrated with "View Proof" buttons in Rank & Medal History.

### Story E4.S3: Athlete Profile Photo
**As a coach,** I want to upload a portrait photo of the athlete so that I can generate professional competition IDs.
**Acceptance Criteria:**
- [ ] Image upload in the "Profile" tab of the dossier.
- [ ] Automatic copying to a local "Vault" directory to prevent path breakage.
- [ ] Square cropping or aspect ratio enforcement.
- [ ] Image replaces initials as the primary list thumbnail.

---

## Epic 5: Roster Selection & Competition
*Goal: Filter the pool and assemble tournament-ready rosters.*

### Story E5.S1: Instant-Switch Roster Filters
**As a coach,** I want to filter the athlete list by Gender, Age Category, and Weight Class in <100ms so that I can quickly find candidates.
**Acceptance Criteria:**
- [ ] Multi-select or dropdown filters in the list header.
- [ ] Performance target met (<100ms).
- [ ] Zero-latency visual updates.

### Story E5.S2: Tournament Roster Assembly
**As a coach,** I want to select athletes and add them to a specific tournament roster so that I can prepare my registration.
**Acceptance Criteria:**
- [ ] Checkbox selection on the athlete list.
- [ ] "Roster View" to see selected athletes.
- [ ] Summary stats (Count of athletes selected).

### Story E5.S3: Eligibility Conflict Detection
**As a system,** I want to flag athletes who do not meet the weight/age criteria for their assigned slot so that I avoid registration rejection.
**Acceptance Criteria:**
- [ ] Visual warning (Red Badge) if athlete weight/age mismatches the category.
- [ ] Warning persists until resolved.

---

## Epic 6: Export Factory (Excel & PDF)
*Goal: Produce the "Hardfiles" required for tournament registration.*

### Story E6.S1: Excel Registration Export
**As a coach,** I want to export my tournament roster to a pre-formatted Excel sheet so that I can submit it to the committee.
**Acceptance Criteria:**
- [ ] Data mapped correctly to the federation (Provincial) format.

### Story E6.S2: PDF Roster Printout
**As a coach,** I want to generate a printable PDF of the tournament roster so that I have a physical "Hardfile" for submission.
**Acceptance Criteria:**
- [ ] Generation of PDF files using a library (e.g., `react-pdf` or a main-process PDF generator).
- [ ] Professional layout including Kabupaten/Club logos.
- [ ] All mandatory athlete data included in rows.

### Story E6.S3: CSV Data Export
**As a coach,** I want to export the entire athlete pool to CSV so that I can perform external analysis in Excel.
**Acceptance Criteria:**
- [ ] One-click CSV export from the athlete list.
- [ ] All athlete fields included.

### Story E6.S4: PDF Archive Summary
**As a coach,** I want to generate a full summary PDF of my entire athlete pool so that I have an offline reference.
**Acceptance Criteria:**
- [ ] Generates PDF listing all currently filtered athletes.
- [ ] layout suitable for offline study/reading.


---

## Epic 7: Institutional Branding & Polish
*Goal: Personalize the app and finalize the user experience.*

### Story E7.S1: Regency & Club Branding
**As a coach,** I want to upload the Kabupaten (Regency) logo so that the app reflects our institution.
**Acceptance Criteria:**
- [ ] Upload UI for logos.
- [ ] Logos displayed in the sidebar/header.
- [ ] Persistence across app sessions.
