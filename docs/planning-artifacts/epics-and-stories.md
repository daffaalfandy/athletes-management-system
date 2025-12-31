# Epics and Stories - athletes-management-system

This document outlines the epics and user stories for the Athletes Management System, derived from the PRD and Architecture documents.

## Epic 1: Project Foundation & Core Infrastructure
*Goal: Establish the technical foundation including the Electron shell, React renderer, and SQLite persistence layer.*

### Story E1.S1: Project Initialization & Electron Shell
**As a developer,** I want to initialize the project using the Electron Forge Vite + TypeScript template so that I have a modern, type-safe development environment.
**Acceptance Criteria:**
- [ ] Project initialized with `npx create-electron-app@latest . --template=vite-typescript`.
- [ ] Folder structure matches the Architecture Decision Document.
- [ ] `npm run start` launches a basic Electron window.
- [ ] TypeScript is configured with strict mode.

### Story E1.S2: SQLite Persistence Layer Setup
**As a system,** I want to establish a robust SQLite connection with Write-Ahead Logging (WAL) enabled so that data is durable and operations are fast.
**Acceptance Criteria:**
- [ ] `better-sqlite3` is installed and configured in the main process.
- [ ] Database connection established with WAL mode enabled.
- [ ] Base schema (athletes, rulesets, etc.) is defined and applied on startup.
- [ ] Repository pattern implemented for base database operations.

### Story E1.S3: IPC Bridge & Service Layer
**As a developer,** I want a typed IPC bridge between the main and renderer processes so that UI-system communication is secure and predictable.
**Acceptance Criteria:**
- [ ] Preload script defines typed IPC handlers.
- [ ] Renderer process has a `useService` hook to call main process methods.
- [ ] IPC response wrapper `{ success, data, error }` is implemented.

### Story E1.S5: Database Backup & Snapshot
**As a coach,** I want to manually trigger a database backup to a USB drive so that I can keep my data safe and portable.
**Acceptance Criteria:**
- [ ] Export button in Settings/Admin area.
- [ ] File dialog to select destination.
- [ ] Copies the SQLite file to the destination with a timestamped name.


### Story E1.S4: Global State & UI Framework Setup
**As a developer,** I want to set up Zustand and Tailwind CSS in the renderer process so that I can build a responsive, state-driven UI.
**Acceptance Criteria:**
- [ ] Zustand installed and basic store structure created.
- [ ] Tailwind CSS configured with the custom color system from the UX spec (Midnight Hybrid).
- [ ] Base layout (Sidebar + Content Area) implemented.

---

## Epic 2: Athlete Management (CRUD & List)
*Goal: Provide the core athlete management capabilities with high-density data visualization.*

### Story E2.S1: Athlete Profile Creation
**As a coach,** I want to create new athlete profiles with mandatory fields so that I can begin building my athlete pool.
**Acceptance Criteria:**
- [ ] Form for Name, Birth Year, Gender, Weight, and Rank.
- [ ] Zod validation for all inputs.
- [ ] Success/Error feedback upon submission.
- [ ] Persistence to SQLite.

### Story E2.S2: High-Density Athlete List
**As a coach,** I want a fast, "clinical" list view of all athletes so that I can scan my entire pool efficiently.
**Acceptance Criteria:**
- [ ] High-density grid implementation (Tailwind).
- [ ] Athlete names, birth years, and weight categories displayed clearly.
- [ ] Visual belt color indicators (vector-style or stylized badges).
- [ ] Search/Filter by name (client-side or fast SQL).

### Story E3.S3: Athlete Profile Editing & Deletion
**As a coach,** I want to update or remove athlete records so that my database stays current.
**Acceptance Criteria:**
- [ ] "Edit" mode for existing athlete profiles.
- [ ] Delete confirmation to prevent accidental data loss.
- [ ] Changes reflected instantly in the list (Zustand/SQLite sync).

---

## Epic 3: Rulesets & Dynamic Eligibility
*Goal: Implement the "Judo Engine" that calculates categories and eligibility.*

### Story E3.S1: Ruleset Definition UI
**As a technical sensei,** I want to define birth-year thresholds for age categories (e.g., U-18) so that the system matches current federation standards.
**Acceptance Criteria:**
- [ ] Management UI for Age Categories.
- [ ] Ability to set birth year ranges.
- [ ] Stored in SQLite as templates.

### Story E3.S2: Dynamic Age Category Calculation
**As a system,** I want to automatically calculate an athlete's age category based on the active ruleset so that the coach doesn't have to do it manually.
**Acceptance Criteria:**
- [ ] Utility function in `common/judo/` for calculation.
- [ ] Athlete list displays the calculated category (e.g., "U-18").
- [ ] Updates instantly when the ruleset or athlete birth year changes.

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
**As a coach,** I want to preview certificate scans in a slide-out drawer so that I can verify data without leaving the list.
**Acceptance Criteria:**
- [ ] Slide-out `DetailDrawer` component (UX Spec).
- [ ] High-resolution image preview.
- [ ] Toggle for "Verified" status once the scan is checked.

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


---

## Epic 7: Institutional Branding & Polish
*Goal: Personalize the app and finalize the user experience.*

### Story E7.S1: Regency & Club Branding
**As a coach,** I want to upload the Kabupaten (Regency) logo so that the app reflects our institution.
**Acceptance Criteria:**
- [ ] Upload UI for logos.
- [ ] Logos displayed in the sidebar/header.
- [ ] Persistence across app sessions.
