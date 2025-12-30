---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['docs/analysis/brainstorming-session-2025-12-30.md']
date: 2025-12-30
author: Daffaalfandy
---

# Product Brief: athletes-management-system

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

The Athletes Management System is a specialized, offline-first desktop application designed specifically for Judo coaches. It serves as a "Combat Command Center" for team preparation, simplifying the complex task of roster selection across age, weight, and rank variables. By prioritizing local speed and data integrity over cloud connectivity, it ensures coaches have 100% reliable access to athlete records and document scans in offline-intensive tournament environments.

---

## Core Vision

### Problem Statement

Judo coaches face a "Roster Selection" bottleneck where organizing athletes by shifting weight classes, birth years, and rank requirements involves manually filtering spreadsheets or digging through physical paperwork. This process is time-consuming and error-prone, especially when tournament rules vary between organizations.

### Problem Impact

Without this system, the coach spends significant time on manual administration instead of strategic coaching. While the athlete's career isn't directly hindered by the lack of the tool, the coach's ability to quickly verify eligibility and produce necessary tournament documentation (hardfiles) is compromised, leading to organizational stress during the critical preparation phase.

### Why Existing Solutions Fall Short

General athlete management apps often require internet access—which is notoriously unreliable in stadium basements and sports halls—and lack the specific logic for Judo's age-weight grouping and Kyu/Dan rank progression. Generic spreadsheets lack the visual "Fighter Card" interface that allows for the instant, intuitive decision-making a coach needs.

### Proposed Solution

A local-first Windows application built with Electron, React, and SQLite that provides:
- **Instant-Switch Roster Views:** Rapidly toggle lists by Age, Weight, or Gender.
- **Digital Dossier:** A secure vault for storing scanned certifications (Kyu/Dan) and medals.
- **The Analog Factory:** Optimized generation of paper "Hardfiles" for match-day use and Excel exports for offline data sharing.

### Key Differentiators

- **Zero-Latency Offline Performance:** Guaranteed speed and reliability in any environment.
- **Judo-Specific Logic:** Built-in support for technical ranks and custom weight-class templates.
- **Physical-to-Digital Bridge:** Designed specifically to interact with the analog realities of tournament coaching (paper sheets and certificate scans).

---

## Target Users

### Primary Users: The Kabupaten Coordinator ("Sensei")

- **Persona:** Sensei Budi, the lead instructor for the Kabupaten (Regency) Judo association. 
- **Context:** He manages the regional "Elite" pool. While there are multiple clubs under his jurisdiction, he currently oversees one main training hub. He is responsible for selecting the best athletes to represent the Regency in Provincial (PORPROV) or National competitions.
- **Problem Experience:** He currently makes roster decisions based on memory, scattered WhatsApp photos of certificates, and high-density Excel sheets that are hard to read on a small laptop screen.
- **Success Vision:** A professional "Battle Console" where he can instantly filter his Kabupaten's top fighters by their tournament success and rank to ensure the most competitive roster is selected.

### Secondary Users: The Assistant Coach

- **Role:** Helps with the heavy lifting of data entry and scanning certificates (Kyu/Dan).
- **Context:** Needs to be able to verify an athlete's data when they bring in new paperwork.
- **Interaction:** Uses the "Excel Export" to provide data snapshots to Sensei Budi if they are working from different locations, ensuring the Regency coordinator always has the most up-to-date fighter cards.

### User Journey (The "Roster Sprint")

1. **The Roster Call:** A tournament announcement arrives. Sensei Budi opens the application during his free time to review the current candidate pool.
2. **Instant Grouping:** He toggles the view to "Gender & Weight." He immediately sees that two of his top athletes have moved into the same weight category.
3. **The Verify Moment (Aha!):** He clicks a "Fighter Card" to check an athlete's certificate scan. He confirms they have the required Kyu rank for this specific tournament.
4. **The Analog Factory:** He exports the chosen roster to Excel and prints the "Tournament Sheet" (Hardfile) to take to the technical meeting with the committee.
5. **Success:** The Regency team is registered accurately, and the Sensei feels fully in control of the squad's data.

---

## Success Metrics

Success for the Athletes Management System is defined by the absolute reliability of the regional roster and the speed with which Sensei Budi can respond to tournament calls. We are building the "Gold Standard" for Kabupaten-level management that will serve as a pilot for provincial expansion.

### User Success: "The Flawless Roster"

- **Outcome:** Sensei Budi (Kabupaten Coordinator) completes a multi-category tournament roster registration with zero eligibility errors (age/weight/rank).
- **Behavior:** The Assistant Coach completes the upload of all physical certificate scans for a 20+ athlete pool within a single administrative session.
- **Success Moment:** The moment a tournament official asks for proof of rank, and the Sensei displays the digital dossier scan instantly on their laptop.

### Business Objectives (Strategic Roadmap)

- **3-Month Milestone:** 100% of the active elite athlete pool in the primary Kabupaten training hub is digitized with complete rank history and certificate scans.
- **12-Month Milestone:** Success of the system is formally presented to the Provincial (Province) association as a case study for "Regional Data Excellence."
- **Long-Term (2-5 Years):** The system's local data structure is leveraged to create an automated "Roster Push" to the Provincial management database, eliminating manual re-entry at the state level.

### Key Performance Indicators (KPIs)

- **Administrative Speed:** Reduction in time to generate a tournament-ready "Hardfile" from ~2 hours (manual) to **< 5 minutes**.
- **Data Integrity Rate:** 0% rejection rate for registrations due to eligibility mismatches (system-enforced grouping).
- **Adoption Rate:** 100% usage for Kabupaten-level roster decision-making within the first 6 months.
- **Dossier Completion:** % of athletes in the system with at least one verified rank/achievement scan attached.

---

## MVP Scope

The MVP is focused on transforming Sensei Budi's laptop into a reliable "Offline Command Center" for Kabupaten-level roster preparation.

### Core Features (The "Must-Haves")

- **Individual Fighter Cards:** High-density visual display of Name, Age, Gender, Current Weight, and Rank (Belt).
- **Instant Grouping Engine:** Dynamic filtering by Age Class (U-18, etc.) and Weight Category (-60kg, -66kg, etc.) using the central SQLite database.
- **Digital Dossier (Certification Storage):** Local file management to upload, store, and view scanned certificates (Kyu/Dan) and tournament diplomas directly in the app.
- **The Analog Factory:** Basic "Export to Excel" functionality and a "Print Preview" view for generating tournament roster hardfiles.
- **Flexible Data Entry:** Support for non-linear rank history (adding current rank without needing every historical date).

### Out of Scope for MVP

- **Cloud Synchronization:** No automatic syncing between devices; the system remains 100% local for now.
- **Dynamic Ruleset Engine:** While we have "Judo-Specific" logic, advanced templates for switching between multiple international federations will be deferred; the MVP will use one primary standard (e.g., IJF).
- **In-App Image Editing:** Users must scan/crop their images before uploading to the Digital Dossier.
- **Provincial Database Push:** No direct API connection to external Provincial management systems yet.

### MVP Success Criteria

- **Functional Validation:** Sensei Budi can select a 10-person roster and verify all 10 certificates in under 10 minutes.
- **Deployment Success:** The application runs smoothly on a standard Windows 10/11 laptop without requiring internet installation steps.
- **User Satisfaction:** The Sensei replaces his current spreadsheet with the app for at least one tournament preparation cycle.

### Future Vision

- **Provincial Integration:** A protocol to "Send Roster to Province" with one click, securely packaging the data and certificate scans for the regional committee.
- **Regional Scaling:** Rolling the system out to multiple Kabupaten (Regencies) to standardize data quality across the entire Province.
- **Multi-Ruleset Support:** An advanced "Rules Manager" for coaches who manage athletes across different international standards (Cadets, Veterans, etc.).
