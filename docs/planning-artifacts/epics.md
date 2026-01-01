---
stepsCompleted: [1, 2, 3]
inputDocuments: ['docs/planning-artifacts/prd.md', 'docs/planning-artifacts/epics-and-stories.md']
---

# athletes-management-system - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for athletes-management-system, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1:** Coach can create, read, update, and delete individual athlete profiles.
- **FR2:** Coach can record mandatory athlete data (Name, Birth Date, Gender, Current Weight, Rank/Belt).
- **FR3:** System can display athlete profiles as high-density "Athlete Lists" with visual belt color indicators.
- **FR4:** Coach can view an athlete's technical rank progression history.
- **FR5:** Coach can attach achievement and medal records to an athlete's profile.
- **FR6:** Coach can toggle roster views instantly by Gender, Age Category, and Weight Class.
- **FR7:** System can automatically calculate an athlete's Age Category based on their birth year and the active ruleset.
- **FR8:** System can filter athlete pools (<100ms) to identify eligible fighters for specific tournament slots.
- **FR9:** Coach can select and group athletes into a specific "Tournament Roster."
- **FR10:** System can highlight eligibility conflicts (rank mismatches or weight class overlaps) during roster assembly.
- **FR11:** Coach can link scanned image files (Kyu/Dan certificates, diplomas, profile photos) to an athlete's profile.
- **FR12:** System can manage local file paths to ensure document attachments and photos are retrievable.
- **FR13:** Coach can preview and view full-sized scans of certificates directly within the application.
- **FR14:** Coach can flag athlete profiles as "Verified" once their physical paperwork matches the digital records.
- **FR15:** Coach can export a selected tournament roster to a pre-formatted Excel registration sheet.
- **FR16:** Coach can generate a printable PDF "Hardfile" (Roster Sheet) for physical submission.
- **FR17:** System can produce a PDF summary of all athlete list data for offline study.
- **FR18:** Coach can export the complete athlete roster to CSV for external data analysis.
- **FR19:** Technical Sensei can create and store custom Age Category templates (e.g., U-18, Senior).
- **FR20:** Technical Sensei can define and store custom Weight Class thresholds.
- **FR21:** Technical Sensei can configure the logical order of technical ranks (e.g., White to Black belt).
- **FR22:** System can switch between different stored Ruleset Templates to adapt to various federation standards.
- **FR23:** User can manually trigger a full database snapshot backup to a selected local or external directory.
- **FR24:** System can recover data integrity automatically after an improper power loss or shutdown (via WAL).
- **FR25:** User can perform a manual application update by replacing local binaries.
- **FR26:** System can provide 100% of its functionality without requiring an active internet connection.
- **FR27:** Coach can upload and display the Regency (Kabupaten) official logo in the application shell.
- **FR28:** Coach can manage and display logos for local Partner Clubs.

### NonFunctional Requirements

- **Efficiency Gain:** Reduction in tournament registration preparation time from ~4 hours (Manual/Sheet) to **< 15 minutes**.
- **Data Perfection:** 0.0% registration rejection rate due to technical rank or weight-class errors.
- **Instant Response:** Any roster filter operation (switching weight class or age category) must complete in **under 100ms** for pools up to 1,000 athletes.
- **Boot Time:** The application must be "Ready for Action" (from click to interactive UI) in **under 3 seconds** on a standard Windows 10 "Home" edition laptop.
- **Crash Recovery:** The system must automatically recover the last consistent database state upon restart after a power loss (via SQLite WAL).
- **Offline Availability:** 100% of core features (Data Entry, Filtering, Export) must be available **without an internet connection**.
- **Data Isolation:** All certificate scans and athlete data must be stored within a user-defined "Local Vault" directory, never uploaded to external servers.
- **Privacy:** Personal data (e.g., birth dates) should be accessible only via the application interface, discouraging direct spreadsheet editing of the source database.
- **Zero-Config Install:** The app must not require the user to install external database engines or runtime environments manually.
- **Export Integrity:** Generated PDF and Excel files must be standard-compliant so they can be opened and printed by any default Windows software.

### Additional Requirements

- **Tournament History:** Automated tracking of which tournaments an athlete has participated in.
- **Club Management:** Ability to define clubs and assign athletes to them.
- **Ruleset Snapshot:** Tournaments must freeze the ruleset parameters used at the time of creation to ensure historical accuracy.

### FR Coverage Map

FR1: Epic 2 - Athlete Management (CRUD & List)
FR2: Epic 2 - Athlete Management (CRUD & List)
FR3: Epic 2 - Athlete Management (CRUD & List)
FR4: Epic 2 - Athlete Management (CRUD & List)
FR5: Epic 2 - Athlete Management (CRUD & List)
FR6: Epic 5 - Roster Selection & Competition
FR7: Epic 3 - Rulesets & Dynamic Eligibility
FR8: Epic 5 - Roster Selection & Competition
FR9: Epic 5 - Roster Selection & Competition
FR10: Epic 5 - Roster Selection & Competition
FR11: Epic 4 - Digital Dossier (Document Management)
FR12: Epic 4 - Digital Dossier (Document Management)
FR13: Epic 4 - Digital Dossier (Document Management)
FR14: Epic 4 - Digital Dossier (Document Management)
FR15: Epic 6 - Export Factory (Excel & PDF)
FR16: Epic 6 - Export Factory (Excel & PDF)
FR17: Epic 6 - Export Factory (Excel & PDF)
FR18: Epic 6 - Export Factory (Excel & PDF)
FR19: Epic 3 - Rulesets & Dynamic Eligibility
FR20: Epic 3 - Rulesets & Dynamic Eligibility
FR21: Epic 3 - Rulesets & Dynamic Eligibility
FR22: Epic 3 - Rulesets & Dynamic Eligibility
FR23: Epic 1 - Project Foundation & Core Infrastructure
FR24: Epic 1 - Project Foundation & Core Infrastructure
FR25: Epic 1 - Project Foundation & Core Infrastructure
FR26: Epic 1 - Project Foundation & Core Infrastructure
FR27: Epic 7 - Institutional Branding & Polish
FR28: Epic 7 - Institutional Branding & Polish

## Epic List

### Epic 1: Project Foundation & Core Infrastructure
Establish the technical foundation including the Electron shell, React renderer, and SQLite persistence layer.
**FRs covered:** FR23, FR24, FR25, FR26

### Epic 2: Athlete Management (CRUD & List)
Provide the core athlete management capabilities with high-density data visualization.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 3: Rulesets & Dynamic Eligibility
Implement the "Judo Engine" that calculates categories and eligibility.
**FRs covered:** FR7, FR19, FR20, FR21, FR22

### Epic 4: Digital Dossier (Document Management)
Securely manage and preview scanned technical certifications.
**FRs covered:** FR11, FR12, FR13, FR14

### Epic 5: Roster Selection & Competition
Filter the pool, manage tournaments/clubs, and assemble tournament-ready rosters.
**FRs covered:** FR6, FR8, FR9, FR10 + (Club/Tournament Logic)

### Epic 6: Export Factory (Excel & PDF)
Produce the "Hardfiles" required for tournament registration.
**FRs covered:** FR15, FR16, FR17, FR18

### Epic 7: Institutional Branding & Polish
Personalize the app and finalize the user experience.
**FRs covered:** FR27, FR28

### Epic 8: Advanced Competition History & Analytics
Track comprehensive athlete participation, link achievements to specific events, and derive insights.
**FRs covered:** Extended FR5, New Analytical Requirements

---

## Epic 1: Project Foundation & Core Infrastructure

Goal: Establish the technical foundation including the Electron shell, React renderer, and SQLite persistence layer.

### Story E1.S1: Project Initialization & Electron Shell

As a developer,
I want to initialize the project using the Electron Forge Vite + TypeScript template,
So that I have a modern, type-safe development environment.

**Acceptance Criteria:**

**Given** the developer has Node.js installed
**When** they run the initialization command `npx create-electron-app@latest . --template=vite-typescript`
**Then** the project folder structure should match the Architecture Decision Document
**And** `npm run start` should launch a basic Electron window
**And** TypeScript should be configured with strict mode enabled.

### Story E1.S2: SQLite Persistence Layer Setup

As a system,
I want to establish a robust SQLite connection with Write-Ahead Logging (WAL) enabled,
So that data is durable and operations are fast.

**Acceptance Criteria:**

**Given** the main process is starting
**When** the database connection is initialized
**Then** `better-sqlite3` should be used to connect to the local DB file
**And** WAL mode should be explicitly enabled
**And** the base schema (athletes, rulesets) should be applied automatically
**And** the Repository pattern should be available for basic DB operations.

### Story E1.S3: IPC Bridge & Service Layer

As a developer,
I want a typed IPC bridge between the main and renderer processes,
So that UI-system communication is secure and predictable.

**Acceptance Criteria:**

**Given** the application is running
**When** the frontend needs to request data (e.g., getAthletes)
**Then** it should use a typed `useService` hook
**And** the request should be routed through the preload script
**And** the response should be wrapped in a standard `{ success, data, error }` format.

### Story E1.S4: Global State & UI Framework Setup

As a developer,
I want to set up Zustand and Tailwind CSS in the renderer process,
So that I can build a responsive, state-driven UI.

**Acceptance Criteria:**

**Given** the frontend code is being developed
**When** a developer implements a component
**Then** they should have access to Tailwind CSS utilities with the custom "Midnight Hybrid" color system
**And** they should be able to access global state via the Zustand store
**And** the base layout (Sidebar + Content Area) should be rendered correctly.

### Story E1.S5: Database Backup & Snapshot

As a coach,
I want to manually trigger a database backup to a USB drive,
So that I can keep my data safe and portable.

**Acceptance Criteria:**

**Given** the coach is in the Settings or Admin area
**When** they click the "Export Database" button
**Then** a file dialog should appear to select the destination
**When** the destination is selected
**Then** the system should copy the SQLite file to that location with a timestamped name
**And** allow for an Import/Restore action that overwrites existing data with a confirmation warning.

### Story E1.S6: Application Update Mechanism

As a coach,
I want to update the application by simply running a new installer,
So that I can get features without internet auto-updates.

**Acceptance Criteria:**

**Given** a new version of the installer is available
**When** the coach runs the installer
**Then** the binary should be updated
**And** the existing SQLite database (in the user data folder) should be preserved
**And** on the first launch, any necessary schema migrations should run automatically.

### Story E1.S7: Detailed Athlete Information

As a coach,
I want to record detailed athlete information (birth place, region, location, etc.),
So that I have complete registration data for official tournaments.

**Acceptance Criteria:**

**Given** the athlete database schema
**When** the application starts
**Then** the schema should include columns for `birth_place`, `region`, `address`, `phone`, `email`, `parent_guardian`, and `parent_phone`
**And** the Athlete Form in the frontend should include these fields
**And** only `birth_place` and `region` should be marked as required alongside the original mandatory fields.

---

## Epic 2: Athlete Management (CRUD & List)

Goal: Provide the core athlete management capabilities with high-density data visualization.

### Story E2.S1: Athlete Profile Creation

As a coach,
I want to create new athlete profiles with mandatory fields,
So that I can begin building my athlete pool.

**Acceptance Criteria:**

**Given** the coach is on the athlete list view
**When** they click "Add Athlete"
**Then** a form should appear requesting Name, Birth Date, Gender, Weight, and Rank
**When** the form is submitted with valid data (validated by Zod)
**Then** the athlete should be persisted to the SQLite database
**And** a success feedback message should be shown.

### Story E2.S2: High-Density Athlete List

As a coach,
I want a fast, "clinical" list view of all athletes,
So that I can scan my entire pool efficiently.

**Acceptance Criteria:**

**Given** there are athletes in the database
**When** the coach views the Athlete List
**Then** they should see a high-density grid layout
**And** each row should display the name, derived birth year, and weight category
**And** a visual belt color indicator (badge/vector) should be displayed
**And** they should be able to filter or search by name instantly.

### Story E2.S3: Athlete Profile Editing & Deletion

As a coach,
I want to update or remove athlete records,
So that my database stays current.

**Acceptance Criteria:**

**Given** an existing athlete profile
**When** the coach selects "Edit"
**Then** they should be able to modify any field
**When** the coach selects "Delete"
**Then** a confirmation dialog should appear
**And** upon confirmation, the record should be removed from the database and the list view instantly.

### Story E2.S4: Rank & Medal History

As a coach,
I want to record promotion dates and medal wins,
So that I can track athlete progression.

**Acceptance Criteria:**

**Given** an athlete profile
**When** the coach initiates a "Rank Promotion"
**Then** a history log entry with the date should be created
**And** the athlete's current rank should update automatically
**When** the coach adds a "Medal/Achievement"
**Then** it should be saved to the athlete's history record.

---

## Epic 3: Rulesets & Dynamic Eligibility

Goal: Implement the "Judo Engine" that calculates categories and eligibility.

### Story E3.S1: Ruleset Definition UI

As a technical sensei,
I want to define age ranges for age categories (e.g., U-18 = ages 15-17),
So that the system matches current federation standards.

**Acceptance Criteria:**

**Given** the Ruleset Management UI
**When** the user creates or edits a category
**Then** they should be able to set a minimum and maximum age (not just birth years)
**And** the system should store these definitions as templates in the database.

### Story E3.S2: Dynamic Age Category Calculation

As a system,
I want to automatically calculate an athlete's age category based on the active ruleset and tournament year,
So that the coach doesn't have to do it manually.

**Acceptance Criteria:**

**Given** an athlete's birth date and a selected "Tournament Year" (defaulting to current)
**When** the application renders the athlete list
**Then** it should calculate the age as `TournamentYear - BirthYear`
**And** match this age against the Active Ruleset to determine the category (e.g., "U-18")
**And** this calculation should update instantly if the Tournament Year or Birth Date changes.

### Story E3.S3: Rank Order Configuration

As a technical sensei,
I want to define the order of belt ranks,
So that the system knows how to sort athletes by seniority.

**Acceptance Criteria:**

**Given** the Rank Configuration UI
**When** the user reorders the rank list (e.g., placing White before Yellow)
**Then** the Athlete List sorting logic should respect this custom hierarchy.

---

## Epic 4: Digital Dossier (Document Management)

Goal: Securely manage and preview scanned technical certifications.

### Story E4.S1: Document Attachment (Link to Local File)

As a coach,
I want to link a scanned certificate to an athlete's profile,
So that I have a digital record of their rank.

**Acceptance Criteria:**

**Given** an athlete profile
**When** the coach chooses to upload a document
**Then** a file selection dialog should appear restricted to image formats
**And** the system should store the local file path (not the full blob) in the database
**And** the athlete list should indicate a "Scan Attached" status.

### Story E4.S2: Certificate Preview (Detail Drawer)

As a coach,
I want to preview certificate scans in a slide-out drawer,
So that I can verify data without leaving the context.

**Acceptance Criteria:**

**Given** an athlete has attached documents
**When** the coach clicks on the attachment indicator
**Then** a `DetailDrawer` or Modal should open showing the high-resolution image
**And** the user should be able to zoom in/out.

### Story E4.S3: Athlete Profile Photo

As a coach,
I want to upload a portrait photo of the athlete,
So that I can generate professional competition IDs.

**Acceptance Criteria:**

**Given** an athlete profile view
**When** the coach uploads a profile photo
**Then** the image should be copied to a local "Vault" directory to ensure persistence
**And** the image should replace the default initials/avatar in the athlete list.

---

## Epic 5: Roster Selection & Competition

Goal: Filter the pool and assemble tournament-ready rosters.

### Story E5.S1: Instant-Switch Roster Filters

As a coach,
I want to filter the athlete list by Gender, Age Category, and Weight Class in <100ms,
So that I can quickly find candidates.

**Acceptance Criteria:**

**Given** a large list of athletes
**When** the coach changes a filter (Gender, Age, Weight)
**Then** the list view should update in under 100ms (zero perceptible latency)
**And** only matching athletes should be displayed.

### Story E5.S2: Tournament Roster Assembly

As a coach,
I want to select athletes and add them to a specific tournament roster,
So that I can prepare my registration.

**Acceptance Criteria:**

**Given** the filtered athlete list
**When** the coach selects athletes using checkboxes
**And** adds them to a targeted "Roster"
**Then** a "Roster View" should show the summary of selected athletes
**And** provide a count of selected athletes.

### Story E5.S3: Eligibility Conflict Detection

As a system,
I want to flag athletes who do not meet the weight/age criteria for their assigned slot,
So that I avoid registration rejection.

**Acceptance Criteria:**

**Given** an athlete assigned to a specific category
**When** their age or weight does not match the category's criteria based on the active ruleset
**Then** a visual warning (Red Badge) should appear on their roster entry
**And** this warning should persist until the conflict is resolved.

### Story E5.S4: Tournament Management & History

As a coach,
I want to create, manage, and switch between different tournaments,
So that I can keep my rosters organized and compliant with specific rules.

**Acceptance Criteria:**

**Given** the Tournament Management screen
**When** the coach creates a new tournament
**Then** they must enter Name, Date, Location, and select a **Ruleset**
**And** the selected Ruleset's parameters must be **snapshotted/frozen** for this tournament (changes to global ruleset later shouldn't affect this history)
**When** the coach selects this tournament as "Active"
**Then** all roster operations should apply to this specific tournament context.

### Story E5.S5: Club Management

As a coach,
I want to manage a list of clubs and assign athletes to them,
So that I can track where my athletes belong and filter by club.

**Acceptance Criteria:**

**Given** the Coach is in the administration area
**When** they navigate to Club Management
**Then** they should be able to Add, Edit, or Delete clubs
**Given** an athlete profile
**When** the coach edits the profile
**Then** they should be able to select a "Club" from the managed list
**And** the Athlete List should allow filtering by these clubs.

---

## Epic 6: Export Factory (Excel & PDF)

Goal: Produce the "Hardfiles" required for tournament registration.

### Story E6.S1: Excel Registration Export

As a coach,
I want to export my *Active Tournament's* roster to a pre-formatted Excel sheet,
So that I can submit it to the committee.

**Acceptance Criteria:**

**Given** the Active Tournament has a roster
**When** the coach clicks "Export to Excel"
**Then** the system should generate an .xlsx file
**And** the data should be mapped to the standard federation/provincial format.

### Story E6.S2: PDF Roster Printout

As a coach,
I want to generate a printable PDF of the tournament roster,
So that I have a physical "Hardfile" for submission.

**Acceptance Criteria:**

**Given** the Active Tournament has a roster
**When** the coach clicks "Print Roster"
**Then** a PDF should be generated containing all mandatory athlete data
**And** the layout should be professional and include the Kabupaten/Club logos.

### Story E6.S3: CSV Data Export

As a coach,
I want to export the entire athlete pool to CSV,
So that I can perform external analysis in Excel.

**Acceptance Criteria:**

**Given** the athlete list
**When** the coach clicks "Export All to CSV"
**Then** a CSV file containing all athlete fields should be downloaded.

### Story E6.S4: PDF Archive Summary

As a coach,
I want to generate a full summary PDF of my entire athlete pool,
So that I have an offline reference.

**Acceptance Criteria:**

**Given** filter settings on the athlete list
**When** the coach requests a "Summary PDF"
**Then** a PDF listing all currently filtered athletes should be generated in a readable layout.

---

## Epic 7: Institutional Branding & Polish

Goal: Personalize the app and finalize the user experience.

### Story E7.S1: Regency & Club Branding

As a coach,
I want to upload the Kabupaten (Regency) logo,
So that the app reflects our institution.

**Acceptance Criteria:**

**Given** the Settings menu
**When** the coach uploads a logo image
**Then** it should be persisted across app sessions
**And** displayed in the application sidebar or header.

---

## Epic 8: Advanced Competition History & Analytics

Goal: Track comprehensive athlete participation, link achievements to specific events, and derive insights.

### Story E8.S1: Automated Tournament History

As a coach,
I want an athlete's "Tournament History" to be automatically populated when I add them to a tournament roster,
So that I don't have to double-entry data.

**Acceptance Criteria:**

**Given** an athlete is added to an Active Tournament's roster
**When** the action is saved
**Then** an entry should automatically appear in that athlete's "Tournament History" list in their detail view
**Given** an athlete detail view
**When** the coach wants to add history manually
**Then** they should be able to input a past tournament name and date manually.

### Story E8.S2: Integrated Medal Records

As a coach,
I want to link a medal win to a specific tournament in the history,
So that the data is interconnected and verifiable.

**Acceptance Criteria:**

**Given** the "Add Medal" form
**When** the coach selects the "Tournament" field
**Then** they should see a dropdown of the tournaments the athlete has participated in (from history)
**And** they should also have the option to type a manual tournament name if it's not in the system.
