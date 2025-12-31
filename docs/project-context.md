---
project_name: 'athletes-management-system'
user_name: 'Daffaalfandy'
date: '2025-12-30'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 21
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Electron Forge (Vite + TypeScript)
- **Electron:** ^30.0.0 (Latest Stable)
- **UI:** React ^18.3.0
- **State Management:** Zustand ^4.5.0
- **Database:** `better-sqlite3` ^9.0.0 (WAL mode enabled)
- **Validation:** Zod ^3.23.0
- **Build Tool:** Vite ^5.0.0

## Critical Implementation Rules

### 1. Process & Database Architecture
- **Process Separation:** Strictly separate Electron (Main) from React (Renderer).
- **DB Singleton:** SQLite connection must be initialized once in the Main Process and exported as a singleton. NEVER open multiple connections.
- **IPC Bridge:** All system calls must go through the typed IPC bridge in `preload.ts` using the `handle[Action]` naming convention.
- **Repository Pattern:** Centralize all SQL queries in `src/main/db/repositories/`. No raw SQL in IPC handlers.

### 2. Frontend & State Management
- **Feature-Based Organization:** UI logic lives under `src/renderer/features/[module_name]`.
- **No Direct IPC in View:** Use custom feature hooks for all data fetching. NEVER call IPC bridge methods directly within a component's `useEffect`.
- **Typing:** Strict TypeScript required. Define interfaces for all IPC payloads. Avoid `any` at all costs; use `unknown` if necessary.

### 3. Business Logic & Assets
- **Judo Rules Isolation:** Age and weight category calculations must live in `src/common/judo/`. NEVER hardcode these rules in UI components.
- **Zero External CDNs:** 100% offline capability is mandatory. Bundle all fonts, icons (SVG preferred), and libraries locally.
- **Response Wrapper:** Use `{ success: boolean, data?: any, error?: string }` for all IPC responses.

### 4. UI Patterns & Workflows
- **Modals for CRUD:** Use lightweight Modals (not new pages) for creating/editing main resources (Athletes, Clubs).
- **High-Density Lists:** Prefer infinite scroll (with sticky headers) over pagination for datasets < 500 items. Optimized for "Scanning".

### 5. Operations
- **Seeding/Migration:** Use raw SQL scripts (`.sql`) executed via `sqlite3` CLI or internal IPC triggers. Avoid Node.js scripts using `better-sqlite3` due to Electron ABI mismatch.

## Critical Don't-Miss Rules (Anti-Patterns)

- **❌ NO Browser Storage:** Do not use `localStorage` or `IndexedDB`. All persistence MUST be SQLite.
- **❌ NO Direct DB in Renderer:** Importing `better-sqlite3` in any file under `src/renderer/` is a blocking error.
- **❌ NO Hardcoded Judo Rules:** UI components should consume rules from the service layer, not define them.
- **❌ NO Async SQLite:** `better-sqlite3` is synchronous. Do not wrap it in unnecessary Promises unless specifically required for concurrency management in the main process.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code.
- Follow ALL rules exactly as documented; they are optimized for your context window.
- When in doubt, prefer the more restrictive architectural boundary.
- Update this file if new persistent patterns emerge during implementation.
- **MANDATORY SYNC:** Any change to architecture, tech stack, or patterns MUST be updated in this file and `architecture.md` immediately.

**For Humans:**
- Keep this file lean and focused on agent-facing "gotchas."
- Update whenever the core technology stack or IPC bridge pattern changes.
- Review quarterly for outdated rules.
- Remove rules that become redundant or "common sense" as the codebase matures.

Last Updated: 2025-12-30
