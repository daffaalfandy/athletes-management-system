---
stepsCompleted: []
inputDocuments: ['docs/planning-artifacts/prd.md', 'docs/planning-artifacts/architecture.md', 'docs/planning-artifacts/ux-design-specification.md']
---

# athletes-management-system - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for athletes-management-system, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Coach can create, read, update, and delete individual athlete profiles.
FR2: Coach can record mandatory athlete data (Name, Birth Year, Gender, Current Weight, Rank/Belt).
FR3: System can display athlete profiles as high-density "Athlete Lists" with visual belt color indicators.
FR4: Coach can view an athlete's technical rank progression history.
FR5: Coach can attach achievement and medal records to an athlete's profile.
FR6: Coach can toggle roster views instantly by Gender, Age Category, and Weight Class.
FR7: System can automatically calculate an athlete's Age Category based on their birth year and the active ruleset.
FR8: System can filter athlete pools (<100ms) to identify eligible fighters for specific tournament slots.
FR9: Coach can select and group athletes into a specific "Tournament Roster."
FR10: System can highlight eligibility conflicts (rank mismatches or weight class overlaps) during roster assembly.
FR11: Coach can link scanned image files (Kyu/Dan certificates, diplomas) to an athlete's profile.
FR12: System can manage local file paths to ensure document attachments are retrievable.
FR13: Coach can preview and view full-sized scans of certificates directly within the application.
FR14: Coach can flag athlete profiles as "Verified" once their physical paperwork matches the digital records.
FR15: Coach can export a selected tournament roster to a pre-formatted Excel registration sheet.
FR16: Coach can generate a printable PDF "Hardfile" (Roster Sheet) for physical submission.
FR17: System can produce a PDF summary of all athlete list data for offline study.
FR18: Coach can export the complete athlete roster to CSV for external data analysis.
FR19: Technical Sensei can create and store custom Age Category templates (e.g., U-18, Senior).
FR20: Technical Sensei can define and store custom Weight Class thresholds.
FR21: Technical Sensei can configure the logical order of technical ranks (e.g., White to Black belt).
FR22: System can switch between different stored Ruleset Templates to adapt to various federation standards.
FR23: User can manually trigger a full database snapshot backup to a selected local or external directory.
FR24: System can recover data integrity automatically after an improper power loss or shutdown (via WAL).
FR25: User can perform a manual application update by replacing local binaries.
FR26: System can provide 100% of its functionality without requiring an active internet connection.
FR27: Coach can upload and display the Regency (Kabupaten) official logo in the application shell.
FR28: Coach can manage and display logos for local Partner Clubs.

### NonFunctional Requirements

NFR1: Instant Response - Any roster filter operation (switching weight class or age category) must complete in under 100ms for pools up to 1,000 athletes.
NFR2: Boot Time - The application must be "Ready for Action" (from click to interactive UI) in under 3 seconds on a standard Windows 10 "Home" edition laptop.
NFR3: Crash Recovery - The system must automatically recover the last consistent database state upon restart after a power loss (via SQLite WAL).
NFR4: Offline Availability - 100% of core features (Data Entry, Filtering, Export) must be available without an internet connection.
NFR5: Data Isolation - All certificate scans and athlete data must be stored within a user-defined "Local Vault" directory, never uploaded to external servers.
NFR6: Privacy - Personal data (e.g., birth dates) should be accessible only via the application interface, discouraging direct spreadsheet editing of the source database.
NFR7: Zero-Config Install - The app must not require the user to install external database engines or runtime environments manually.
NFR8: Export Integrity - Generated PDF and Excel files must be standard-compliant so they can be opened and printed by any default Windows software.

### Additional Requirements

- **Architecture**: Starter Template: Electron Forge with Vite + TypeScript.
- **Architecture**: Database: `better-sqlite3` with WAL mode enabled.
- **Architecture**: Backend Pattern: Repository Pattern for centralized queries.
- **Architecture**: Frontend State: `Zustand` for unidirectional data flow.
- **Architecture**: IPC: Typed IPC Bridge + Service Layer Pattern.
- **Architecture**: Validation: `Zod` for runtime type safety.
- **Architecture**: File System: Local File System integration via Electron Main Process.
- **Architecture**: Structure: Feature-based organization (`src/features/[feature_name]/`) for scalability.
- **Architecture**: Boundaries: Strict Main/Renderer isolation (Data only crosses via IPC; NO direct DB access in Renderer).
- **UX**: Design System: Custom Design System using Tailwind CSS (Midnight Hybrid Theme).
- **UX**: Animation: Subtle micro-animations for category switches and list filters.
- **UX**: Aesthetics: "Clinical Precision" and "Total Certainty" (high density, clear status badges).
- **UX**: Accessibility: High-contrast text on light backgrounds; clear text labels alongside color-coded belts.
- **UX**: Navigation: Status-led navigation (knowing how many athletes in current view).

### FR Coverage Map

FR1: Epic 1 - Athlete Core CRUD
FR2: Epic 1 - Mandatory Data Fields
FR3: Epic 1 - High-Density List UI
FR4: Epic 1 - Rank History
FR5: Epic 1 - Medal Records
FR6: Epic 2 - Instant Roster Filtering
FR7: Epic 2 - Auto Age Calculation
FR8: Epic 2 - Performance Filter (<100ms)
FR9: Epic 2 - Roster Selection
FR10: Epic 2 - Eligibility Conflict Checks
FR11: Epic 1 - Certificate Linking (Dossier)
FR12: Epic 1 - Local File Path Management
FR13: Epic 1 - Scan Preview (Drawer)
FR14: Epic 1 - Verification Status
FR15: Epic 4 - Excel Factory
FR16: Epic 4 - PDF "Hardfile" Factory
FR17: Epic 4 - PDF Summary Factory
FR18: Epic 4 - CSV Export
FR19: Epic 3 - Age Category Templates
FR20: Epic 3 - Weight Class Thresholds
FR21: Epic 3 - Rank Order Config
FR22: Epic 3 - Ruleset Switching
FR23: Epic 5 - Manual Database Backup
FR24: Epic 5 - Crash Recovery (WAL)
FR25: Epic 5 - Manual Binaries Update
FR26: Epic 5 - Offline Architecture
FR27: Epic 6 - Regency Logo
FR28: Epic 6 - Partner Club Logos

## Epic List

### Epic 1: Athlete Management & Digital Dossier Foundation
**Goal:** Enable coaches to digitize their entire athlete pool, establishing the "Single Source of Truth" by creating high-density profiles and linking mandatory physical evidences (Kyu certificates) to the digital record.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR11, FR12, FR13, FR14

### Epic 2: The "Instant-Switch" Roster Engine
**Goal:** Transform the static athlete pool into a dynamic competition tool, allowing coaches to filter, sort, and select tournament-ready rosters with zero latency and automatic eligibility checks.
**FRs covered:** FR6, FR7, FR8, FR9, FR10

### Epic 3: Adaptive Ruleset & Category Management
**Goal:** Empower the Technical Sensei to adapt to changing Federation rules (Birth Years, Weight Classes) by modifying templates instead of requiring software updates.
**FRs covered:** FR19, FR20, FR21, FR22

### Epic 4: The "Analog Factory" (Registration Exports)
**Goal:** Bridge the gap between digital management and the physical bureaucracy of tournaments by automatically generating professional, compliant PDF and Excel "Hardfiles."
**FRs covered:** FR15, FR16, FR17, FR18

### Epic 5: System Administration & Resilience
**Goal:** Provide the "Safety Net" features that ensure data durability, ease of maintenance, and portability in an offline, high-stakes environment.
**FRs covered:** FR23, FR24, FR25, FR26

### Epic 6: Institutional Branding
**Goal:** Personalize the application shell to reflect the authority of the local Regency (Kabupaten) and its partner clubs.
**FRs covered:** FR27, FR28

## Epic 1: Athlete Management & Digital Dossier Foundation

**Goal:** Enable coaches to digitize their entire athlete pool, establishing the "Single Source of Truth" by creating high-density profiles and linking mandatory physical evidences (Kyu certificates) to the digital record.

### Story 1.1: Project Initialization & Core Architecture Setup
As a developer,
I want to initialize the Electron/React project with SQLite and the Feature-based folder structure,
So that I have a stable, type-safe foundation for building features.

**Acceptance Criteria:**
**Given** a fresh development environment
**When** the project is initialized using `create-electron-app --template=vite-typescript`
**Then** the directory structure should match the `docs/architecture.md` specification (including `/src/features`, `/src/shared`).
**And** `better-sqlite3` should be configured with WAL mode enabled by default (FR24).
**And** the IPC Bridge should be set up with strict type safety (Zod), ensuring no direct DB access from the Renderer.

### Story 1.2: Athlete Profile CRUD
As a coach,
I want to create, read, update, and delete athlete profiles with mandatory data (Name, Birth Year, Gender, Weight, Rank),
So that I can build my digital athlete pool (FR1, FR2).

**Acceptance Criteria:**
**Given** the "Add Athlete" form
**When** I enter valid data (Name, 2010, Male, -55kg, White Belt) and save
**Then** the athlete should be persisted to SQLite.
**And** if I attempt to save without a Name or Birth Year, validation should fail.
**And** I should be able to edit or delete this profile later.

### Story 1.3: High-Density Athlete List UI
As a coach,
I want to view my athletes in a high-density list with visual belt indicators,
So that I can scan my team's status quickly without scrolling through large cards (FR3).

**Acceptance Criteria:**
**Given** a database with 50 athletes
**When** I open the main dashboard
**Then** I should see a compact list (table-like) showing Name, Age, Weight, and a specialized "Belt Badge" (e.g., Yellow icon).
**And** the list should support basic scrolling with sticky headers.

### Story 1.4: Technical Rank & Medal History
As a coach,
I want to record an athlete's promotion dates and medal wins,
So that I can track their progression over time (FR4, FR5).

**Acceptance Criteria:**
**Given** an athlete profile
**When** I add a "Promoted to Green Belt" event with a date
**Then** it should be saved to their history log.
**And** the athlete's "Current Rank" should automatically update to the latest promotion.

### Story 1.5: Digital Dossier - Certificate Attachment
As a coach,
I want to link a scanned image file (Kyu certificate) to an athlete's profile,
So that I have a digital backup of their physical paperwork (FR11, FR12, NFR5).

**Acceptance Criteria:**
**Given** a scanned image on my desktop
**When** I select it via the "Attach Certificate" button
**Then** the system should copy user selected path or store the reference (depending on "Local Vault" architectural decision).
**And** the file handling must be robust; if the original file moves, the system should either have its own copy or warn the user.
**And** the system must strictly use local file system paths, ensuring NO cloud upload.

### Story 1.6: Digital Dossier - Drawer Preview & Verification
As a coach,
I want to preview the certificate in a slide-out drawer and mark it as "Verified",
So that I can confirm eligibility without leaving the main list context (FR13, FR14).

**Acceptance Criteria:**
**Given** an athlete with an attached certificate
**When** I click the "View Dossier" icon in the list
**Then** a side drawer should open displaying the full image.
**And** I can toggle a "Verified" switch, which updates the athlete's status badge in the main list.


## Epic 2: The "Instant-Switch" Roster Engine

**Goal:** Transform the static athlete pool into a dynamic competition tool, allowing coaches to filter, sort, and select tournament-ready rosters with zero latency and automatic eligibility checks.

### Story 2.1: Automated Age Category Calculation
As a system,
I want to automatically calculate an athlete's "Competition Category" (e.g., U-18) based on their birth year and the current year,
So that the coach doesn't have to do mental math (FR7).

**Acceptance Criteria:**
**Given** an athlete born in 2010 and the current year is 2025
**When** the system calculates eligibility
**Then** they should be tagged as "U-16" (or equivalent based on active rules).
**And** this calculation should happen instantly whenever the birth year changes.

### Story 2.2: Instant Filtering & Grouping
As a coach,
I want to filter the athlete pool by Gender, Age Category, and Weight Class with <100ms latency,
So that I can find eligible fighters immediately (FR6, FR8, NFR1).

**Acceptance Criteria:**
**Given** a pool of 1,000 athletes
**When** I toggle the "Female" and "U-21" filters
**Then** the list should update in under 100 milliseconds (perceptible instant).
**And** the "Total Count" indicator should reflect the filtered set.

### Story 2.3: Tournament Roster Selection
As a coach,
I want to select specific athletes to add to a "Tournament Roster" (Group),
So that I can isolate the traveling team from the full database (FR9).

**Acceptance Criteria:**
**Given** a filtered list of candidates
**When** I check the boxes next to 5 athletes and click "Add to Roster"
**Then** they should be linked to the active tournament container.
**And** I should be able to view a dedicated "Roster View" showing only these selected athletes.

### Story 2.4: Eligibility Conflict Detection
As a system,
I want to flag athletes who do not meet the criteria for their assigned weight/age category in the roster,
So that the coach avoids registration rejection (FR10).

**Acceptance Criteria:**
**Given** an athlete weighing 65kg
**When** they are added to a "-60kg" category slot
**Then** the system should display a visual "Conflict" warning (Red Badge).
**And** the warning should persist until the weight is corrected or the category changed.


## Epic 3: Adaptive Ruleset & Category Management

**Goal:** Empower the Technical Sensei to adapt to changing Federation rules (Birth Years, Weight Classes) by modifying templates instead of requiring software updates.

### Story 3.1: Ruleset Template Management
As a Technical Sensei,
I want to create and edit Ruleset Templates (defining Age Categories and Weight Classes),
So that I can match different tournament standards (e.g., "National 2025" vs "Regional 2024") (FR19, FR20).

**Acceptance Criteria:**
**Given** the Ruleset Manager settings
**When** I create a new template named "IJF 2026"
**Then** I can define multiple Age Categories (e.g., Senior: 2005+) and Weight Classes for each.
**And** I can save this as a distinct template.

### Story 3.2: Ruleset Switching Logic
As a coach,
I want to switch the "Active Ruleset" for the application,
So that all dynamic age calculations update to match the selected tournament rules (FR22).

**Acceptance Criteria:**
**Given** athletes classified under "2024 Rules"
**When** I switch the active ruleset to "2025 New Standards"
**Then** all athletes' "Category" tags in the list should automatically recalculate based on the new birth-year thresholds.

### Story 3.3: Rank Order Configuration
As a Technical Sensei,
I want to define the order of Belt Ranks (e.g., White < Yellow < Orange),
So that the system knows how to sort athletes by seniority (FR21).

**Acceptance Criteria:**
**Given** a list of belts
**When** I reorder them in the settings
**Then** the sorting logic in the main Athlete List should reflect this new hierarchy.


## Epic 4: The "Analog Factory" (Registration Exports)

**Goal:** Bridge the gap between digital management and the physical bureaucracy of tournaments by automatically generating professional, compliant PDF and Excel "Hardfiles."

### Story 4.1: Excel Registration Export
As a coach,
I want to export my roster to a recognizable Excel format (.xlsx),
So that I can email the registration file to the tournament committee (FR15).

**Acceptance Criteria:**
**Given** a populated Tournament Roster
**When** I click "Export to Excel"
**Then** a file should be generated containing columns for Name, Weight, Age, and Club.
**And** the file should open correctly in standard Microsoft Excel.

### Story 4.2: PDF "Hardfile" Roster Sheet
As a coach,
I want to generate a formal, printable PDF of the roster,
So that I can sign and submit the physical paper required at weigh-ins (FR16, NFR8).

**Acceptance Criteria:**
**Given** a Tournament Roster
**When** I click "Generate Hardfile"
**Then** a PDF should be created with a professional header (Regency Logo) and a clear table of athletes.
**And** it should be formatted for A4 printing.

### Story 4.3: PDF Archive Summary
As a coach,
I want to generate a full summary PDF of my entire athlete pool,
So that I have an offline reference document for club meetings (FR17).

**Acceptance Criteria:**
**Given** the filtering criteria
**When** I click "Print Summary"
**Then** a PDF listing all currently filtered athletes should be generated.

### Story 4.4: CSV Data Dump
As a coach,
I want to export my entire database to CSV,
So that I can perform custom analysis or migration in external tools (FR18).

**Acceptance Criteria:**
**Given** the database has data
**When** I select "Export All to CSV"
**Then** a CSV file including all raw athlete fields (Name, DOB, raw weight, etc.) should be downloaded.


## Epic 5: System Administration & Resilience

**Goal:** Provide the "Safety Net" features that ensure data durability, ease of maintenance, and portability in an offline, high-stakes environment.

### Story 5.1: Manual Database Backup
As a coach,
I want to manually trigger a "Snapshot Backup" to a USB drive,
So that I can physically transport my database or save it from a dying laptop (FR23).

**Acceptance Criteria:**
**Given** the application is running
**When** I click "Backup Database"
**Then** I should be prompted to select a folder (e.g., USB drive).
**And** the system should copy the current SQLite `.db` file to that location with a timestamp.

### Story 5.2: Application Update Mechanism
As a coach,
I want to update the application by simply running a new installer/binary,
So that I can get features without needing an app store or internet auto-updater (FR25).

**Acceptance Criteria:**
**Given** a new version of the installer
**When** I run it
**Then** it should update the executable but PRESERVE the existing SQLite database and Dossier file paths (Data Persistence).


## Epic 6: Institutional Branding

**Goal:** Personalize the application shell to reflect the authority of the local Regency (Kabupaten) and its partner clubs.

### Story 6.1: Institutional Logo Management
As a coach,
I want to upload my Regency and Club logos,
So that they appear on the dashboard and generated PDF documents (FR27, FR28).

**Acceptance Criteria:**
**Given** the Branding Settings page
**When** I upload a PNG of the "Kabupaten Bogor" logo
**Then** it should appear in the top-left sidebar of the application.
**And** it should be auto-inserted into the header of any exported PDFs.

