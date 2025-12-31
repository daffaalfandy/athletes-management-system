# Tech-Spec: High-Density Athlete List UI (Story 1.3)

**Created:** 2025-12-31
**Status:** Completed

## Overview


### Problem Statement
Users currently have no way to view the athlete pool. The previous story (1.2) enabled data creation, but there is no visualization. We need a "High-Density" list view that allows the Sensei to scan 50+ athletes without scrolling, identifying rank and weight categories instantly.

### Solution
1.  **Component:** `AthleteList.tsx` using a table-like grid (divs or `<table>` for density).
2.  **Logic:** `useAthleteStore` to fetch and filter data.
3.  **Visuals:**
    - "Belt Badge" component (Color-coded Pill).
    - Compact typography (Inter Tight/Mono).
    - Sticky Headers.

### Scope (In/Out)
**IN:**
- `AthleteList` Component.
- `BeltBadge` Component (White, Yellow, Orange, Green, Blue, Brown, Black).
- Basic Frontend Search/Filter (Name, Club).
- Update/Delete triggers from the list.

**OUT:**
- "Roster Selection" (checkboxes).
- "Detail Drawer" (Story 1.6).
- Complex Server-side filtering (Story 2.2 inst-filter).

## Context for Development

### Codebase Patterns
- **Store:** `useAthleteStore` already exists. Need to add `searchTerm` state?
- **Styles:** Tailwind utility classes.
- **Theme:** "Clinical Light" (White/Slate-50) for the list area.

### Files to Reference
- `docs/planning-artifacts/ux-design-specification.md` (Design guidelines).
- `src/renderer/features/athletes/useAthleteStore.ts`.

## Implementation Plan

### Tasks

- [x] **Task 1: Shared UI Components**
    - Create `src/renderer/components/BeltBadge.tsx`.
        - Props: `rank: string`.
        - Map ranks to Tailwind colors (e.g., White -> `bg-white border-slate-200`, Yellow -> `bg-yellow-400`).

- [x] **Task 2: Athlete List Component**
    - Create `src/renderer/features/athletes/AthleteList.tsx`.
    - **Match Mockup Styles:**
        - Header: `text-[10px] font-bold text-slate-400 uppercase tracking-widest`.
        - Rows: `hover:bg-blue-50/50 cursor-pointer transition`.
        - Name Meta: `text-[10px] text-slate-400 mono` (e.g., "-60kg • 2005").
    - Layout: Sticky Header Row. Scrollable Body.
    - Columns: Match Mockup (Name+Meta, Rank Badge, Status/Eligibility if available, Actions).

- [x] **Task 3: Integration & Logic**
    - Integrate `useAthleteStore` to read `athletes` array.
    - Implement Client-side filtering (Name/Club) for now (FR3).
    - Add "Edit" button to row -> Populates Form (Story 1.2 reuse).
    - Add "Delete" button -> Confirm & Call Store.

### Acceptance Criteria

- [x] **AC 1: High Density**
    - List displays at least 15-20 rows on a standard 1080p screen without scrolling.
    - Typography is legible but compact (e.g., text-sm).

- [x] **AC 2: Visual Recognition**
    - Yellow Belt shows as a literal Yellow badge.
    - Weight classes displayed clearly (e.g., "-55kg").

- [x] **AC 3: Performance**
    - Rendering 50 athletes has no perceptible lag.
    - Filtering by name is instant (React state).

## Additional Context

### UX Details
- **Header:** "Clinical Precision" - Uppercase, tracking-wide, text-xs, text-slate-500.
- **Actions:** Icons (Lucide-React) for Edit (Pencil) and Delete (Trash), visible on hover?

### Testing Strategy
- Manual: Seed DB with 20 dummy athletes.
- check scrolling smoothness.
- Check deletion updates the list immediately.

## Design Updates (Post-Implementation)
- **Layout:** Switched to Full Dashboard Shell (Sidebar + Header) instead of independent page.
- **Filters:** Search reduced to Name-only. Rank and Club filters added as dropdowns.
- **Seeding:** Implemented via `scripts/seed-athletes.sql`.

