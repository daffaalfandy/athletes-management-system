---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments: ['docs/planning-artifacts/prd.md', 'docs/planning-artifacts/product-brief-athletes-management-system-2025-12-30.md']
project_name: 'athletes-management-system'
user_name: 'Daffaalfandy'
date: '2025-12-30'
---

# UX Design Specification athletes-management-system

**Author:** Daffaalfandy
**Date:** 2025-12-30

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

The Athletes Management System is a specialized, offline-first "Combat Command Center" for Judo coaches. It transforms the administrative burden of roster selection into a high-speed, list-centric management process. By prioritizing local data integrity and zero-latency interactions, it ensures that coaches can manage their elite athlete pools and generate provincial-standard registration packages through a professional, familiar, and highly efficient data interface.

### Target Users

*   **The Regency Coordinator (Sensei Budi):** A high-level decision-maker who requires instant oversight of athlete pools. He values a "Command Table" view where he can sort, filter, and verify eligibility across hundreds of rows without visual distraction.
*   **The Assistant Coach (Coach Deni):** The primary data maintainer. He needs a list interface that supports rapid navigation and clear row-level feedback for dossier status.

### Key Design Challenges

*   **Column Optimization:** Determining which "Critical Information" (Rank, Weight, Age, Gender) earns a spot in the primary list view versus a detailed "Drawer" or "Modal" view.
*   **Visualizing Eligibility in Rows:** Designing subtle but clear row-level indicators for "Status" (Verified, Conflict, Incomplete) that don't break the clean management-system aesthetic.
*   **Responsive List Controls:** Ensuring that even with many columns, the list remains usable and performance-optimized for the Electron environment.

### Design Opportunities

*   **The "Rich List" Pattern:** Enhancing the standard management list with Judo-specific icons and color-coded belts as column badges, making the data instantly identifiable.
*   **Inline Verification:** Allowing coaches to view certificate status directly from the list row, creating a rewarding "Audit" experience.
*   **High-Speed Filtering:** Leveraging the list format to provide "Excel-like" power (sorting/filtering) but with the speed and reliability of a dedicated application.

## Core User Experience

### Defining Experience

The core rhythm of the system is the **"Roster Refinement Loop."** Coaches will spend the majority of their time switching between Judo weight classes and age categories to identify the most competitive and eligible athletes. This process culminates in the **Roster Export**, which must be a seamless transition from digital management to physical preparation.

### Platform Strategy

*   **Native Desktop Precision:** As a dedicated Windows application, the UI will prioritize high-density data and clear mouse-driven interactions.
*   **Minimalist Control Scheme:** High utility without the steep learning curve of complex shortcuts. The focus is on intuitive point-and-click management for "Regency level" coaches who may not be power-users but need high-speed results.

### Effortless Interactions

*   **Animated Acknowledgments:** To fulfill the "Zero-Latency" promise without feeling jarring, category switches and list filters should involve subtle micro-animations. These provide a visual "pulse" to confirm the data has refreshed.
*   **Frictionless Selection:** Selecting athletes for a tournament roster should feel like marking a checklist—instant and persistent until the final export.

### Critical Success Moments

*   **The Roster Confirmation:** Instead of celebratory graphics, success is defined by **Informational Certainty**. A clear status banner or indicator informs the coach: *"15 Athletes Selected. Roster represents all mandatory categories. Ready for Export."* 
*   **The Final Handover:** The moment the Excel/PDF "Hardfile" is generated correctly, signifying that the digital planning phase is successfully complete.

### Experience Principles

*   **Status-Led Navigation:** Always knowing exactly how many athletes are in the current viewed category and how many are selected for the active roster.
*   **Acknowledge through Motion:** Using subtle transitions to communicate speed and reliability in a local environment.
*   **Informative Utility:** Prioritizing clear, text-based status updates over abstract icons or visual flourishes.

## Desired Emotional Response

### Primary Emotional Goals

The primary goal is to evoke a sense of **Clinical Precision** and **Total Certainty**. The user should feel that the Athletes Management System is the "Single Source of Truth." When a row is marked as "Verified," the coach should feel a profound sense of confidence that the athlete is 100% eligible for competition, backed by indisputable digital records.

### Emotional Journey Mapping

*   **Initialization:** The coach should feel **Focused** and **Organized**. The clean, list-based entry point should signal that this is a professional management tool, not a game or a social app.
*   **Roster Refinement:** As they filter weight classes, the feeling should be one of **Indisputable Logic**. The lists "snap" into place, giving the coach a sense of a perfectly sorted digital desktop.
*   **Verification (The "Aha" Moment):** When linking a scan to an athlete, the transition from "Missing" to "Verified" should feel like an **Official Approval**. It’s the satisfying click of a job being done correctly.
*   **Export:** The handover to PDF/Excel should feel like a moment of **Authoritative Readiness**. The coach is no longer worried about the registration deadline; they are simply ready to present the facts.

### Micro-Emotions

*   **Trust:** Cultivated through the "Offline-First" stability and the persistent visibility of local file paths.
*   **Accountability:** Subtle row-level indicators ensure the coach feels "Responsible" for the pool's data quality.
*   **Accomplishment:** Derived from seeing a complete, "All-Green" list of verified athletes ready for the tournament.

### Design Implications

*   **Clinical Precision → Structure:** Use a highly structured, spreadsheet-inspired grid that prioritizes clarity over visual flair. Alignment, padding, and typography must be "perfect" to signal quality.
*   **Total Certainty → Status Badges:** "Verified" and "Conflict" indicators should look like official stamps or labels (semi-formal aesthetic) to build trust in the automated logic.
*   **Secure Ownership → Local Vault Feedback:** Provide clear, text-based confirmation of file paths and save states to remind the user their data is safe, local, and private.

### Emotional Design Principles

*   **"Truth through Clarity":** Never hide critical eligibility data. High-density lists provide the transparency needed for certainty.
*   **"The Professional Finish":** Every UI element (scrollbars, input fields, row highlights) must feel polished and robust to maintain the clinical aesthetic.
*   **"Logic over Delight":** Prioritize informative, textbook-clear feedback over whimsical animations or "congratulatory" UI patterns.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

*   **Modern Fintech Apps (e.g., Wise, Revolut):**
    *   **Success:** They transform high-density transaction data into a series of clear, trustworthy events.
    *   **Interactions:** They use subtle micro-interactions to confirm data entry and "Verified" states, ensuring the user feels in control of "High-Stakes" information.
    *   **Visual Strategy:** Clean sans-serif typography (like Inter) and a restrained color palette that uses color only to signal status (Success/Green, Error/Red, Warning/Yellow).

### Transferable UX Patterns

*   **Status pills/Stamps:** Adapting the "Payment Verified" badge for Judo Kyu/Dan certificates. This provides an immediate visual signal of "Roster Readiness."
*   **The "Detail Drawer":** Clicking an athlete in the list opens a slide-out drawer on the right. This allows the coach to view the **Digital Dossier** (certificate scans) while still seeing the main athlete pool.
*   **Column-Based Filtering:** Using the pattern of "Categorized Lists" (Grouped by Weight or Age) to keep the UI organized and predictable.
*   **Text-Label Priority:** Using clear text (e.g., "-60kg", "Blue Belt") instead of abstract icons to ensure zero ambiguity for regional coaches.

### Anti-Patterns to Avoid

*   **"Office Bloat":** Avoid cluttered spreadsheets with 20 columns. We will prioritize only the "Critical Information" in the main list.
*   **Hidden Actions:** Never hide core actions (like Roster Export) behind deep menus. They should be prominent, like a "Send Money" button.
*   **Playful Visuals:** No "gamified" badges or illustrations. This is a professional tool for Senseis; it must feel serious and robust.

### Design Inspiration Strategy

*   **What to Adopt:** The "Fintech Dashboard" aesthetic—clean lines, high-density rows, and clear status indicators.
*   **What to Adapt:** Transform financial "Transactions" into "Athlete Records." Use belt colors as the primary visual identifiers within the list rows.
*   **What to Avoid:** Generic "Business Software" clutter. We will maintain the focused, "Tactical Console" feel.

## Design System Foundation

### 1.1 Design System Choice

**Custom Design System (Tailwind CSS Architecture)**

We will build a tailored design system from the ground up using **Tailwind CSS**. This approach provides the surgical precision required to achieve a "Fintech" aesthetic while keeping the desktop application lean and high-performance.

### Rationale for Selection

*   **Absolute Visual Authority:** To achieve "Clinical Precision," we need total control over every pixel, border-radius, and font-weight. A custom system ensures we aren't fighting against the "default looks" of generic frameworks.
*   **Judo-Specific Tokens:** We can define a dedicated color palette for physical Judo belt ranks (White, Yellow, Green, etc.) as core design tokens, ensuring visual consistency across the entire app.
*   **Performance & Predictability:** In an offline-first Electron environment, a custom-built, atomic component library ensures that list rendering remains at the promised <100ms threshold.

### Implementation Approach

*   **Utility-First Construction:** Components will be built using Tailwind utility classes, allowing for rapid iteration on spacing and layout.
*   **Atomic Component Library:** We will develop a core set of "Truth-Based" components:
    *   `AthleteRow`: A high-density data container.
    *   `StatusBadge`: Semi-formal labels for "Verified" and "Conflict" states.
    *   `DetailDrawer`: A slide-out panel for the Digital Dossier.
*   **Shared Design Tokens:** All colors, typography scales, and shadows will be centralized in the `tailwind.config.ts` to ensure a cohesive professional feel.

### Customization Strategy

*   **Typography Focus:** Selection of a high-performance sans-serif font (e.g., Inter) optimized for data density and screen readability.
*   **The "Verified" Aesthetic:** Developing a specific visual language for truth—using sharp borders, clear typography, and a restrained use of status-driven colors (Success-Green, Error-Red).

## 2. Core User Experience

### 2.1 Defining Experience

The defining experience of the Athletes Management System is **"Instant Eligibility Verification."** The system must enable a coach to verify the entire elite athlete pool's readiness at a single glance. By centralizing rank certificates, birth years, and weight categories into a high-density, automated list, the app transforms "Administrative Guesswork" into "Technical Certainty."

### 2.2 User Mental Model

The user approaches the app as a **"Digital Document Vault"** rather than a simple spreadsheet. 
- **The Vault Paradigm:** Coaches expect data to be "locked in" and secure. The primary fear is **Data Mismatch** (assigning the wrong belt to the wrong athlete) or **File Loss**. 
- **Digital Shadow:** The system is seen as the "Official Record" that must perfectly reflect the physical Kyu certificates kept in the club's folders.
- **Human Compromise:** While automation is key, the user expects to see the "Logic" so they can verify it manually if needed, ensuring they remain the final authority.

### 2.3 Success Criteria

- **Zero-Latency Re-validation:** When a tournament rule changes (e.g., birth year shifts), the entire list must update its eligibility status instantly.
- **Truth Transparency:** From a single row, the coach must be able to "Peek" into the certificate scan to confirm the system's logic matches the physical reality.
- **Integrity Feedback:** The system should provide "Visual Reassurance" that records are synchronized and backed up, mitigating the fear of record loss.

### 2.4 Novel UX Patterns

- **The "Audit-View" List:** A specialized list view where row-level badges provide a "summary-status" (e.g., "Rank Verified", "Weight Category Error") that instantly expands for full detail.
- **Persistent Vault Indicators:** A small, non-intrusive status in the UI that confirms "Local Storage: 100% Synced," building trust in the vault's integrity.

### 2.5 Experience Mechanics

**1. The Audit Trigger:**
- **Action:** User toggles a "Tournament Mode" or "Regency Filter."
- **Response:** The system instantly re-calculates eligibility for every athlete based on the active ruleset.

**2. Visual Scanning:**
- **Action:** User scans the list for "Red Flags" or "Incomplete" badges.
- **Interaction:** One-click on a status badge opens the **Detail Drawer** to show the source document.

**3. Row Resolution:**
- **Action:** User makes a manual adjustment or confirms a scan.
- **Feedback:** The row transitions from "Action Needed" to "Verified" with a subtle color shift and micro-animation.

**4. The Final Export:**
- **Action:** User clicks "Generate Hardfile."
- **Outcome:** A clean PDF/Excel is produced that matches the digital audit perfectly, transferring the "Certainty" from the vault to the tournament committee.

## Visual Design Foundation

### Color System (Midnight Hybrid Theme)

The system uses a mixed-mode architecture to balance "Command Center" authority with "Audit Ledger" precision.
*   **Navigation & Shell (Midnight):** Sidebar and Primary Headers use Deep Midnight Blue (#0F172A) to provide a stable, authoritative frame.
*   **Workspace & List (Clinical Light):** The main "Athlete List" area uses a high-contrast White/Off-White (#F8FAFC) surface for maximum data clarity.
*   **The "Activity" Scale:**
    *   **Constant:** Solid primary indicators for athletes who are always active.
    *   **Intermittent:** Hollow or striped indicators for those with partial activity.
    *   **Dormant:** De-saturated slate tones for passive members.

### Typography System

*   **Primary Typeface:** **Inter**. Using semibold weights for athlete names and "Mono" variants for technical measurements (weights/dates).
*   **Judo Vector Tokens:** Explicitly using high-quality vector representations of the Kyu/Dan belts as the primary visual identifier for rank.

### Spacing & Layout Foundation

*   **Primary Stats:** Two high-level KPIs: **Total Pool** (entire database) and **Competitive Pool** (Active/Intermittent).
*   **Density:** "Audit Density." Optimized for scanning long lists of names and categories. Spacing is tight but purposeful.
*   **Drawer Integration:** A persistent slide-out panel that maintains the "Light Mode" document aesthetic for Kyu certificate previews.

### Accessibility Considerations

*   **Contrast Equality:** High-contrast text on light backgrounds ensures readability in varying stadium lighting conditions.
*   **Rank Visibility:** Belt colors are paired with clear text labels (e.g., "Green (2nd Kyu)") to ensure accessibility for color-blind users.

## Design Direction Decision

### Design Directions Explored

We explored variations of the **Midnight Hybrid Theme**, focusing on maximizing clinical precision and removing unnecessary administrative overhead.
*   **Decentralized Logic:** Removing User Management/Profiles to focus on a high-speed, local-first single-admin interaction model.
*   **Institutional Identity:** Introducing dedicated visual areas for Kabupaten and Partner Club branding within the Midnight shell.

### Chosen Direction (The "Local Coordinator" Shell)

We have chosen a direction that combines:
*   **Shell:** Authority-driven Midnight Blue sidebar and headers with **Kabupaten Branding** as the primary institutional anchor.
*   **Workspace:** High-contrast Clinical Light Mode list, stripped of profile management bloat to prioritize raw data speed.
*   **Rank Identity:** Large, vector-style Judo belt icons as the central visual anchor for each row.
*   **Activity Logic:** Three-tier status markers: **Constant**, **Intermittent**, and **Dormant**.

### Design Rationale

This direction provides the **Total Certainty** required by a Regency coordinator. By removing user management, we reduce cognitive load and technical complexity, making the app feel like a specialized "Local Appliance." The inclusion of Kabupaten and Club logos transforms the software into a localized "Source of Truth" rather than a generic tool.

### Implementation Approach

*   **Tailwind Architecture:** Leveraging custom utility classes for the Midnight/Slate color tokens.
*   **Stats Focus:** Primary KPIs are now **Total Pool** (entire database) and **Competitive Pool** (Active athletes).
*   **Status-Driven UI:** Using the Activity Scale (Constant/Intermittent/Dormant) to drive row-level visual cues automatically.
