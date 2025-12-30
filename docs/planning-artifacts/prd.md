stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments: ['docs/analysis/brainstorming-session-2025-12-30.md', 'docs/planning-artifacts/product-brief-athletes-management-system-2025-12-30.md']
workflowType: 'prd'
lastStep: 11
---

# Product Requirements Document - athletes-management-system

**Author:** Daffaalfandy
**Date:** 2025-12-30

## Executive Summary

The Athletes Management System is a specialized, offline-first desktop application designed to empower Judo coaches (specifically at the Indonesian Regency/Kabupaten level) by automating the complex process of roster preparation. By moving away from manual spreadsheets and physical paperwork, the system provides a high-speed, 100% reliable "Combat Command Center" for managing elite athlete pools and their technical history. The primary goal is to shift the coach's effort from administrative data entry to strategic roster decision-making.

### What Makes This Special

- **Offline-First Zero Latency:** Built with Electron and SQLite to ensure the system is "always on" and lightning-fast in stadium basements and sports halls where internet is unavailable.
- **The Digital Dossier:** A dedicated local vault for storing and instantly retrieving scanned copies of technical certifications (Kyu/Dan) and tournament diplomas.
- **The Analog Factory:** Specialized logic to generate physical "Hardfiles" and Excel exports tailored for the registration requirements of provincial and national committees.
- **Judo-Specific Logic:** Native support for technical rank progression, birth-year-based age calculation, and high-speed grouping by weight categories.

## Project Classification

**Technical Type:** desktop_app
**Domain:** General (Sports Management)
**Complexity:** low
**Project Context:** Greenfield - new project

This project is a high-utility management tool focused on local data integrity and UI efficiency. It is designed to serve as a pilot for regional data excellence, eventually scaling to support provincial-level integrations in Indonesia.

## Success Criteria

### User Success
- **The "Checkmate" Moment:** Sensei Budi completes a roster for a 30-athlete tournament and identifies two weight-class overlaps and one expired rank certificate in under 2 minutes.
- **Dossier Confidence:** The Assistant Coach manages to digitize 50+ certificates in a single evening without the system slowing down or losing a single file path.
- **Hardfile Accuracy:** 100% of printed tournament sheets match the tournament's specific age/weight logic on the first attempt.

### Business Success
- **Regency Adoption:** 100% of Kabupaten-level tournaments in the pilot region are managed using this system within 6 months.
- **Provincial Readiness:** A successful "Regional Excellence" audit by the Provincial association, marking the system as "Ready for Scaling."

### Technical Success
- **Offline Integrity:** Zero data loss or corruption during "hard shutdowns" (e.g., laptop battery dying mid-session).
- **SQLite Performance:** Instantaneous roster switching (<100ms) for athlete pools up to 1,000 records.
- **Zero-Config Install:** The application must run on a standard Windows 10 "Home Edition" laptop without requiring internet-based database setup.

### Measurable Outcomes
- **Efficiency Gain:** Reduction in tournament registration preparation time from ~4 hours (Manual/Sheet) to **< 15 minutes**.
- **Data Perfection:** 0.0% registration rejection rate due to technical rank or weight-class errors.

## Product Scope

### MVP - Minimum Viable Product
- **Instant Engine:** SQLite-powered filtering for Age Category, Gender, and Weight Class.
- **Fighter Cards:** Visual grid UI showing critical athlete stats and belt colors.
- **Local Dossier:** Image path management for scanned certificates and diplomas.
- **Excel & Print Factory:** One-click export for tournament registries and basic print layouts.
- **Manual Backup:** A simple "Export Database to USB" reminder/button for snapshot safety.

### Growth Features (Post-MVP)
- **Advanced Rulesets:** A template manager to switch between IJF, National, and Local club rule thresholds.
- **In-App Cropping:** Basic image tools for standardizing certificate scan sizes.
- **Performance Analytics:** Visual charts tracking an athlete's win/loss ratio and medal count over 3 years.

### Vision (Future)
- **Provincial Sync:** A secure, one-click package to "Submit Roster" directly to the Provincial headquarters.
- **Cross-Regency Collaboration:** Standardized data formats allowing multiple Kabupaten to merge rosters for national trials.

## User Journeys

**Journey 1: Sensei Budi - The Midnight Roster Crisis**
- **The Narrative:** Sensei Budi is sitting at his home office on a Friday night. He just received a WhatsApp notification: the Provincial Committee moved the tournament date up, and the registration deadline is tomorrow morning. In the past, this would mean hours of looking through physical folders and checking an outdated "Master Excel."
- **The Transformation:** He fires up the **Athletes Management System**. Within 10 seconds, he uses the **Instant-Switch Engine** to filter for "Male, U-18, -60kg." He immediately sees that his star athlete, Andi, has jumped a weight class. He checks Andi's **Digital Dossier** and confirms the scanned Kyu certificate is valid. He clicks "Add to Roster" for all 15 categories, exports the **Analog Factory** files, and by 11:15 PM, he has a professional registration package ready.

**Journey 2: The Assistant Coach - The "Data Day" Marathon**
- **The Narrative:** Coach Deni has a stack of 50 new Kyu certificates and tournament diplomas. Usually, this means typing data into an Excel sheet and misplacing half the scanned files on his Desktop.
- **The Transformation:** He opens the app's **Bulk Entry mode**. As he scans each document, he labels it by Athlete Name and Rank. The system automatically handles the file paths in the background. Because of the **Zero-Latency** architecture, there’s no "loading" wheel while he saves images. He finishes the marathon update and clicks "Manual Backup" to his USB drive. The Kabupaten database now 100% current.

**Journey 3: The Technical Sensei - The Federation Shift**
- **The Narrative:** The National Judo Federation announces a change: "U-15" categories will now use birth years shifted by one year, and a new "Open" weight class is introduced.
- **The Transformation:** Sensei Budi opens the **Ruleset Manager**. He doesn't need a developer; he simply creates a "National 2026" template, adjusts the birth-year range, and adds the new +100kg class. He hits "Apply," and the system re-calculates 200 athlete profiles in milliseconds. His candidates are automatically re-sorted into their new legal categories, ensuring the Regency is always compliant with the latest standards.

### Journey Requirements Summary

These narratives reveal several high-priority capabilities:
1. **Instant Filter Engine:** High-speed grouping by Gender, Age, and Weight.
2. **Digital Dossier Path Management:** Automatic organization of certificate image files.
3. **Ruleset Designer:** UI for configuring custom birth-year thresholds and weight classes.
4. **Bulk Admin Mode:** Optimized workflows for high-volume scanning and data entry.
5. **Analog Factory (Roster Packager):** One-click generation of Excel and Print-ready documents.

## [Desktop App] Specific Requirements

### Project-Type Overview
The Athletes Management System is a specialized Windows 10 application. It is architected for "Zero-Config" local use, ensuring that a Sensei can install and run the system without an IT department or an active internet connection.

### Technical Architecture Considerations
- **OS Focus:** Optimized strictly for **Windows 10/11**.
- **Data Persistence (WAL Mode):** The system will utilize SQLite with Write-Ahead Logging. This ensures that even in the event of a "hard shutdown" (power loss), the database can recover to its last consistent state.
- **Architecture:** Electron-based container wrapping a React UI, providing a native-feeling experience with access to the local file system for dossier management.

### Implementation Considerations
- **Update Strategy:** Manual replacement. Updates will be distributed via a new installer or compressed package, reflecting the reality of restricted internet access in training hubs.
- **The "Printer-Less" Factory:** Instead of direct hardware integration, the app will generate standard **PDF and Excel** files. This decouples the application from printer-specific dependencies and allows coaches to use any available device to print their "Hardfiles."
- **Export/Backup Workflow:** A manual "Database Snapshot" feature will allow users to export the current SQLite database to a USB drive for portable backup and archival.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP (targeted at the manual registration bottleneck).
**Resource Requirements:** 1 Full-stack Developer (Electron/React/SQLite) + 1 Domain Expert (Sensei Budi).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Sensei Budi's "Midnight Roster Crisis"
- Assistant Coach's "Data Day" Marathon
- Technical Sensei's "Federation Shift" (Initial config)

**Must-Have Capabilities:**
- SQLite (WAL Mode) Persistence
- Multi-category Instant Filtering
- PDF & Excel Export Factory
- Local File Path Dossier Management

### Post-MVP Features

**Phase 2 (Post-MVP - Growth):**
- Analytics Dashboard
- Ruleset Template Library
- Image Cropping Tools

**Phase 3 (Expansion - Vision):**
- Provincial Sync Protocol
- Cross-Regency Data Standardization

### Risk Mitigation Strategy

**Technical Risks:** Mitigating "Hard Shutdown" data corruption by using SQLite **WAL Mode**.
**Market Risks:** Decoupling from printer dependencies by generating standard **PDFs**.
**Resource Risks:** Keeping a lean feature set focused strictly on the manual registration bottleneck.

## Functional Requirements

### Athlete Management
- **FR1:** Coach can create, read, update, and delete individual athlete profiles.
- **FR2:** Coach can record mandatory athlete data (Name, Birth Year, Gender, Current Weight, Rank/Belt).
- **FR3:** System can display athlete profiles as high-density "Fighter Cards" with visual belt color indicators.
- **FR4:** Coach can view an athlete's technical rank progression history.
- **FR5:** Coach can attach achievement and medal records to an athlete's profile.

### Roster & Competition Management
- **FR6:** Coach can toggle roster views instantly by Gender, Age Category, and Weight Class.
- **FR7:** System can automatically calculate an athlete's Age Category based on their birth year and the active ruleset.
- **FR8:** System can filter athlete pools (<100ms) to identify eligible fighters for specific tournament slots.
- **FR9:** Coach can select and group athletes into a specific "Tournament Roster."
- **FR10:** System can highlight eligibility conflicts (rank mismatches or weight class overlaps) during roster assembly.

### Digital Dossier (Document Management)
- **FR11:** Coach can link scanned image files (Kyu/Dan certificates, diplomas) to an athlete's profile.
- **FR12:** System can manage local file paths to ensure document attachments are retrievable.
- **FR13:** Coach can preview and view full-sized scans of certificates directly within the application.
- **FR14:** Coach can flag athlete profiles as "Verified" once their physical paperwork matches the digital records.

### Data Reporting & Export (Analog Factory)
- **FR15:** Coach can export a selected tournament roster to a pre-formatted Excel registration sheet.
- **FR16:** Coach can generate a printable PDF "Hardfile" (Roster Sheet) for physical submission.
- **FR17:** System can produce a PDF summary of all athlete Fighter Cards for offline study.
- **FR18:** Coach can export the complete athlete roster to CSV for external data analysis.

### Rules & Configuration Management
- **FR19:** Technical Sensei can create and store custom Age Category templates (e.g., U-18, Senior).
- **FR20:** Technical Sensei can define and store custom Weight Class thresholds.
- **FR21:** Technical Sensei can configure the logical order of technical ranks (e.g., White to Black belt).
- **FR22:** System can switch between different stored Ruleset Templates to adapt to various federation standards.

### System Admin & Data Integrity
- **FR23:** User can manually trigger a full database snapshot backup to a selected local or external directory.
- **FR24:** System can recover data integrity automatically after an improper power loss or shutdown (via WAL).
- **FR25:** User can perform a manual application update by replacing local binaries.
- **FR26:** System can provide 100% of its functionality without requiring an active internet connection.

## Non-Functional Requirements

### Performance & Zero-Latency
- **Instant Response:** Any roster filter operation (switching weight class or age category) must complete in **under 100ms** for pools up to 1,000 athletes.
- **Boot Time:** The application must be "Ready for Action" (from click to interactive UI) in **under 3 seconds** on a standard Windows 10 "Home" edition laptop.

### Reliability & Data Resilience
- **Crash Recovery:** The system must automatically recover the last consistent database state upon restart after a power loss (via SQLite WAL).
- **Offline Availability:** 100% of core features (Data Entry, Filtering, Export) must be available **without an internet connection**.

### Security & Privacy (Local)
- **Data Isolation:** All certificate scans and athlete data must be stored within a user-defined "Local Vault" directory, never uploaded to external servers.
- **Privacy:** Personal data (e.g., birth dates) should be accessible only via the application interface, discouraging direct spreadsheet editing of the source database.

### Portability & Maintenance
- **Zero-Config Install:** The app must not require the user to install external database engines or runtime environments manually.
- **Export Integrity:** Generated PDF and Excel files must be standard-compliant so they can be opened and printed by any default Windows software.