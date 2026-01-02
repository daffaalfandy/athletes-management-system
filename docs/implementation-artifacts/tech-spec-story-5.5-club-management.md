# Tech-Spec: Story 5.5 - Club Management

**Created:** 2026-01-02  
**Status:** Ready for Development

## Overview

### Problem Statement

The Athletes Management System currently lacks the ability to organize athletes by their affiliated clubs. This creates several challenges:

1. **No Club Organization**: Athletes cannot be grouped by their club affiliation, making it difficult to identify which athletes belong to which club
2. **Missing Club Context**: When preparing tournament rosters or viewing athlete lists, coaches cannot filter or organize by club membership
3. **Incomplete Tournament Registration**: Many tournament registration forms require club information, but the system doesn't capture this data
4. **Data Integrity**: The `clubId` field exists in the athlete schema but has no backing club management system, leading to orphaned references
5. **Limited Filtering**: Coaches managing multiple clubs need to filter athlete lists by club affiliation for efficient roster management

The core issue: **Clubs are referenced but not managed, creating a gap between the data model and user workflow.**

### Solution

Implement a **comprehensive Club Management system** integrated into the Settings/Admin area:

1. **Club CRUD Operations** - Create, Read, Update, Delete clubs with full metadata (name, logo, contact, location)
2. **Club Data Model** - Store club information including logo path, contact details, and location
3. **Athlete-Club Assignment** - Allow coaches to assign athletes to exactly one club during athlete creation/editing
4. **Multi-Club Filtering** - Enable filtering the athlete list by one or more clubs simultaneously
5. **Modern UI Design** - Consistent with existing Settings page design (tabs, cards, modern styling)
6. **Database Migration** - Create `clubs` table and establish foreign key relationship with athletes

**Workflow:**
```
Coach Flow (Club Management):
1. Navigate to Settings → Club Management tab
2. View list of existing clubs (card-based layout)
3. Click "Add Club" → Fill form (name, logo, contact, location)
4. Save club → Appears in club list
5. Edit/Delete clubs as needed

Coach Flow (Athlete Assignment):
1. Create/Edit athlete profile
2. Select club from dropdown (populated from clubs table)
3. Save athlete with club assignment

Coach Flow (Filtering):
1. Navigate to Athlete List
2. Use club filter (multi-select dropdown)
3. View athletes from selected clubs only
```

### Scope (In/Out)

**In Scope:**
- ✅ Create `clubs` table with columns: id, name, logo_path, contact_person, contact_phone, contact_email, location, created_at, updated_at
- ✅ Club CRUD operations (repository, service, IPC handlers)
- ✅ Club Management UI in Settings page (new tab)
- ✅ Club list view (card-based, similar to ruleset list)
- ✅ Club form (create/edit) with all fields including logo upload
- ✅ Athlete form integration - club dropdown selector
- ✅ Athlete list filtering by club (multi-select)
- ✅ Club logo upload to vault (similar to athlete profile photos)
- ✅ Club logo display in club list and athlete forms
- ✅ **Club information display in tournament roster selection** - Show club name/badge when selecting athletes for tournaments
- ✅ Zustand store for club state management
- ✅ Modern, responsive UI design consistent with existing components

**Out of Scope:**
- ❌ Club-level statistics or analytics
- ❌ Club membership history (tracking when athlete joined/left club)
- ❌ Club-based permissions or access control
- ❌ Club-to-club transfers or athlete movement tracking
- ❌ Club branding in exports (deferred to Epic 6)
- ❌ Multiple club assignments per athlete (one club only)
- ❌ Club hierarchy or sub-clubs
- ❌ Club-specific rulesets or tournament preferences

## Context for Development

### Codebase Patterns

**Architecture:**
- **Backend:** Electron Main Process + SQLite (better-sqlite3) + Repository Pattern
- **Frontend:** React + TypeScript + Zustand (state management) + Tailwind CSS
- **IPC Bridge:** Typed IPC handlers via `preload.ts` and `electron.d.ts`
- **Validation:** Zod schemas for runtime type safety
- **File Management:** Vault-based storage for images (logos, photos)

**Established Patterns:**
1. **Repository Pattern:** `{entity}Repository.ts` with CRUD methods (create, getAll, getById, update, delete)
2. **Service Layer:** `{entity}Service.ts` sets up IPC handlers, validates with Zod, calls repository
3. **Zustand Stores:** `use{Entity}Store.ts` for frontend state management with async actions
4. **IPC Convention:** `{entity}:{action}` (e.g., `clubs:create`, `clubs:getAll`)
5. **Schema Definition:** Zod schemas in `src/shared/schemas.ts`, exported types via `z.infer`
6. **Settings UI Pattern:** Tab-based navigation with card layouts (see `SettingsPage.tsx`)
7. **File Upload:** Vault-based storage using `FileService` (see athlete profile photo implementation)

### Files to Reference

**Backend (Main Process):**
- `src/main/repositories/rulesetRepository.ts` - **REFERENCE**: Repository pattern, CRUD operations
- `src/main/repositories/athleteRepository.ts` - **REFERENCE**: Foreign key handling (clubId)
- `src/main/services/rulesetService.ts` - **REFERENCE**: IPC handler setup pattern
- `src/main/services/FileService.ts` - **REFERENCE**: File upload to vault pattern
- `src/main/migrations/001_initial_schema.ts` - **MODIFY**: Add clubs table

**Frontend (Renderer Process):**
- `src/renderer/features/settings/SettingsPage.tsx` - **MODIFY**: Add Club Management tab
- `src/renderer/features/settings/RulesetList.tsx` - **REFERENCE**: Card-based list UI pattern
- `src/renderer/features/settings/RulesetEditor.tsx` - **REFERENCE**: Form UI pattern
- `src/renderer/features/settings/useRulesetStore.ts` - **REFERENCE**: Zustand store pattern
- `src/renderer/features/athletes/AthleteForm.tsx` - **MODIFY**: Add club dropdown selector
- `src/renderer/features/athletes/AthleteList.tsx` - **MODIFY**: Add club filter
- `src/renderer/features/tournaments/TournamentDetail.tsx` - **MODIFY**: Display club info in roster selection (if exists)

**Shared:**
- `src/shared/schemas.ts` - **MODIFY**: Add Club schema
- `src/shared/types/electron.d.ts` - **MODIFY**: Add club IPC types
- `src/main/preload.ts` - **MODIFY**: Expose club IPC methods

### Technical Decisions

#### 1. Single Club Assignment per Athlete

**Decision:** Each athlete can belong to exactly one club (nullable foreign key).

**Rationale:**
- Simplifies data model and UI (dropdown vs. multi-select)
- Matches real-world scenario: athletes typically represent one club in tournaments
- Easier to implement filtering and reporting
- Can be extended to multiple clubs later if needed (via junction table)

**Implementation:**
- `athletes.clubId` is nullable INTEGER foreign key to `clubs.id`
- Dropdown selector in athlete form (single select)
- NULL value represents "Unattached" athletes

#### 2. Club Logo Storage in Vault

**Decision:** Store club logos in the vault directory using the same pattern as athlete profile photos.

**Rationale:**
- Consistent with existing file management pattern
- Centralized file storage for easy backup
- Secure file access via custom protocol
- Prevents broken file paths if files are moved

**Implementation:**
- Use `FileService.uploadToVault(sourcePath, 'clubs', clubId)`
- Store relative path in `clubs.logo_path` column
- Display using `dossier://` custom protocol

#### 3. Club Management in Settings Page

**Decision:** Add Club Management as a new tab in the existing Settings page.

**Rationale:**
- Clubs are configuration data, not operational data (like athletes or tournaments)
- Consistent with Ruleset Management placement
- Reduces navigation complexity (no new top-level menu item)
- Settings page already has tab infrastructure

**Implementation:**
- Add "Club Management" tab to `SettingsPage.tsx`
- Follow same pattern as "Ruleset Management" and "Database & Backup" tabs
- Tab icon: Building or Users icon from lucide-react

#### 4. Multi-Club Filtering in Athlete List

**Decision:** Support filtering by multiple clubs simultaneously (OR logic).

**Rationale:**
- Coaches may manage athletes from multiple partner clubs
- Allows viewing combined roster from selected clubs
- More flexible than single-club filter
- Common pattern in filtering UIs

**Implementation:**
- Multi-select dropdown in athlete list filters
- Filter logic: `athlete.clubId IN (selectedClubIds)` OR `athlete.clubId IS NULL` (if "Unattached" selected)
- Clear visual indication of active club filters

#### 5. Comprehensive Club Metadata

**Decision:** Store full club information (name, logo, contact person, phone, email, location).

**Rationale:**
- Tournament registration often requires club contact information
- Enables future features (club-based exports, contact lists)
- Minimal storage overhead
- Better data completeness for official documentation

**Schema:**
```sql
CREATE TABLE clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  logo_path TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Plan

### Tasks

#### Phase 1: Database Schema

**Task 1.1: Create Clubs Table**
- [ ] Open `src/main/migrations/001_initial_schema.ts`
- [ ] Add clubs table creation after athletes table:
  ```typescript
  // Clubs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      logo_path TEXT,
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      location TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
  `);
  ```
- [ ] Test: Delete database, restart app, verify table creation

**Task 1.2: Add Foreign Key Index for Athletes**
- [ ] In `001_initial_schema.ts`, after athletes table creation, add index:
  ```typescript
  CREATE INDEX IF NOT EXISTS idx_athletes_clubId ON athletes(clubId);
  ```
- [ ] Note: Foreign key constraint already exists in schema (clubId INTEGER)
- [ ] Test: Verify index creation

#### Phase 2: Shared Schemas & Types

**Task 2.1: Create Club Schema**
- [ ] Open `src/shared/schemas.ts`
- [ ] Add Club schema after Tournament schemas:
  ```typescript
  export const ClubSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Club name is required').max(200, 'Name is too long'),
    logo_path: z.string().optional(),
    contact_person: z.string().max(200, 'Name is too long').optional().or(z.literal('')),
    contact_phone: z.string().regex(/^[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').optional().or(z.literal('')),
    contact_email: z.string().trim().email('Invalid email format').max(255, 'Email is too long').optional().or(z.literal('')),
    location: z.string().max(500, 'Location is too long').optional().or(z.literal('')),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  });
  
  export type Club = z.infer<typeof ClubSchema>;
  
  export const ClubUpdateSchema = ClubSchema.extend({
    id: z.number(),
  });
  ```
- [ ] Test: Import and validate sample club data

#### Phase 3: Backend Repository

**Task 3.1: Create Club Repository**
- [ ] Create `src/main/repositories/clubRepository.ts`
- [ ] Implement `getAll(): Club[]`:
  ```typescript
  getAll: (): Club[] => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM clubs ORDER BY name ASC');
    return stmt.all() as Club[];
  }
  ```
- [ ] Implement `getById(id: number): Club | undefined`:
  ```typescript
  getById: (id: number): Club | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM clubs WHERE id = ?').get(id) as Club | undefined;
  }
  ```
- [ ] Implement `create(club: Club): Club`:
  ```typescript
  create: (data: Club): Club => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO clubs (name, logo_path, contact_person, contact_phone, contact_email, location)
      VALUES (@name, @logo_path, @contact_person, @contact_phone, @contact_email, @location)
    `);
    const info = stmt.run({
      name: data.name,
      logo_path: data.logo_path || null,
      contact_person: data.contact_person || null,
      contact_phone: data.contact_phone || null,
      contact_email: data.contact_email || null,
      location: data.location || null,
    });
    const newId = Number(info.lastInsertRowid);
    return clubRepository.getById(newId)!;
  }
  ```
- [ ] Implement `update(id: number, data: Club): boolean`:
  ```typescript
  update: (id: number, data: Club): boolean => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE clubs 
      SET name = @name, 
          logo_path = @logo_path, 
          contact_person = @contact_person,
          contact_phone = @contact_phone,
          contact_email = @contact_email,
          location = @location,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    const info = stmt.run({
      id,
      name: data.name,
      logo_path: data.logo_path || null,
      contact_person: data.contact_person || null,
      contact_phone: data.contact_phone || null,
      contact_email: data.contact_email || null,
      location: data.location || null,
    });
    return info.changes > 0;
  }
  ```
- [ ] Implement `delete(id: number): boolean`:
  ```typescript
  delete: (id: number): boolean => {
    const db = getDatabase();
    // Check if any athletes are assigned to this club
    const athleteCount = db.prepare('SELECT COUNT(*) as count FROM athletes WHERE clubId = ?').get(id) as { count: number };
    if (athleteCount.count > 0) {
      throw new Error(`Cannot delete club: ${athleteCount.count} athlete(s) are assigned to this club`);
    }
    const info = db.prepare('DELETE FROM clubs WHERE id = ?').run(id);
    return info.changes > 0;
  }
  ```
- [ ] Test: CRUD operations, verify constraint on delete

#### Phase 4: IPC Layer & Service

**Task 4.1: Create Club Service**
- [ ] Create `src/main/services/clubService.ts`
- [ ] Set up IPC handlers following ruleset service pattern:
  ```typescript
  import { ipcMain } from 'electron';
  import { clubRepository } from '../repositories/clubRepository';
  import { ClubSchema } from '../../shared/schemas';
  import { z } from 'zod';

  export function setupClubHandlers() {
    ipcMain.handle('clubs:getAll', async () => {
      return clubRepository.getAll();
    });

    ipcMain.handle('clubs:getById', async (_, id) => {
      const validatedId = z.number().parse(id);
      return clubRepository.getById(validatedId);
    });

    ipcMain.handle('clubs:create', async (_, data) => {
      const validated = ClubSchema.parse(data);
      return clubRepository.create(validated);
    });

    ipcMain.handle('clubs:update', async (_, data) => {
      const schemaWithId = ClubSchema.extend({ id: z.number() });
      const validated = schemaWithId.parse(data);
      const { id, ...rest } = validated;
      return clubRepository.update(id, validated);
    });

    ipcMain.handle('clubs:delete', async (_, id) => {
      const validatedId = z.number().parse(id);
      try {
        return clubRepository.delete(validatedId);
      } catch (error: any) {
        throw new Error(error.message);
      }
    });
  }
  ```
- [ ] Export `setupClubHandlers()` function
- [ ] Test: Verify handlers compile

**Task 4.2: Register Club Service**
- [ ] Open `src/main/main.ts`
- [ ] Import `setupClubHandlers` from `./services/clubService`
- [ ] Call `setupClubHandlers()` after other service setups
- [ ] Test: Restart app, verify no errors

**Task 4.3: Update Preload Script**
- [ ] Open `src/main/preload.ts`
- [ ] Add `clubs` section to `api` object after tournaments:
  ```typescript
  clubs: {
    getAll: () => ipcRenderer.invoke('clubs:getAll'),
    getById: (id) => ipcRenderer.invoke('clubs:getById', id),
    create: (data) => ipcRenderer.invoke('clubs:create', data),
    update: (data) => ipcRenderer.invoke('clubs:update', data),
    delete: (id) => ipcRenderer.invoke('clubs:delete', id),
  }
  ```
- [ ] Test: TypeScript compilation passes

**Task 4.4: Update TypeScript Definitions**
- [ ] Open `src/shared/types/electron.d.ts`
- [ ] Add `clubs` interface to `IElectronAPI`:
  ```typescript
  clubs: {
    getAll: () => Promise<Club[]>;
    getById: (id: number) => Promise<Club | undefined>;
    create: (data: Club) => Promise<Club>;
    update: (data: Club & { id: number }) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
  }
  ```
- [ ] Test: Verify `window.api.clubs` is typed correctly

#### Phase 5: Frontend State Management

**Task 5.1: Create Club Store**
- [ ] Create `src/renderer/features/settings/useClubStore.ts`
- [ ] Implement Zustand store following ruleset store pattern:
  ```typescript
  import { create } from 'zustand';
  import { Club } from '../../../shared/schemas';

  interface ClubState {
    clubs: Club[];
    loading: boolean;
    error: string | null;

    loadClubs: () => Promise<void>;
    addClub: (data: Club) => Promise<void>;
    updateClub: (data: Club) => Promise<void>;
    deleteClub: (id: number) => Promise<void>;
  }

  export const useClubStore = create<ClubState>((set, get) => ({
    clubs: [],
    loading: false,
    error: null,

    loadClubs: async () => {
      set({ loading: true });
      try {
        const clubs = await window.api.clubs.getAll();
        set({ clubs, loading: false });
      } catch (err: unknown) {
        set({ error: (err as Error).message, loading: false });
      }
    },

    addClub: async (data) => {
      try {
        const newClub = await window.api.clubs.create(data);
        set((state) => ({ clubs: [newClub, ...state.clubs] }));
      } catch (err: unknown) {
        set({ error: (err as Error).message });
        throw err;
      }
    },

    updateClub: async (data) => {
      try {
        await window.api.clubs.update(data);
        set((state) => ({
          clubs: state.clubs.map((c) => (c.id === data.id ? data : c)),
        }));
      } catch (err: unknown) {
        set({ error: (err as Error).message });
        throw err;
      }
    },

    deleteClub: async (id) => {
      try {
        await window.api.clubs.delete(id);
        set((state) => ({
          clubs: state.clubs.filter((c) => c.id !== id),
        }));
      } catch (err: unknown) {
        set({ error: (err as Error).message });
        throw err;
      }
    },
  }));
  ```
- [ ] Test: Import store, verify state updates

#### Phase 6: UI Components - Club Management

**Task 6.1: Create Club List Component**
- [ ] Create `src/renderer/features/settings/ClubList.tsx`
- [ ] Implement card-based list view following `RulesetList.tsx` pattern:
  - Display clubs in grid layout (2 columns on desktop)
  - Each card shows: name, location, contact person, logo thumbnail
  - Actions: Edit, Delete (with confirmation)
  - "Add Club" button at top
- [ ] Use `useClubStore` to fetch and display clubs
- [ ] Handle delete with confirmation: "Delete '[Name]'? Athletes assigned to this club will become unattached."
- [ ] Style with Tailwind CSS (modern card design, hover effects)
- [ ] Test: CRUD operations, verify list updates

**Task 6.2: Create Club Form Component**
- [ ] Create `src/renderer/features/settings/ClubForm.tsx`
- [ ] Implement form following `RulesetEditor.tsx` pattern:
  - Fields: Name (required), Logo Upload, Contact Person, Contact Phone, Contact Email, Location
  - Logo upload: Click to select image, preview thumbnail
  - Save/Cancel buttons
  - Validation with Zod schema
- [ ] Implement logo upload:
  ```typescript
  const handleLogoUpload = async () => {
    const filePath = await window.api.files.selectImage();
    if (!filePath) return;
    
    if (!club?.id) {
      // Store temp path, upload after save
      setTempLogoPath(filePath);
      return;
    }
    
    const vaultPath = await window.api.files.uploadToVault(filePath, 'clubs', club.id);
    setFormData({ ...formData, logo_path: vaultPath });
  };
  ```
- [ ] Display logo preview using `dossier://` protocol
- [ ] Test: Create/edit clubs, upload logos, verify validation

**Task 6.3: Integrate Club Management into Settings Page**
- [ ] Open `src/renderer/features/settings/SettingsPage.tsx`
- [ ] Add "Club Management" to `SettingsTab` type:
  ```typescript
  type SettingsTab = 'rulesets' | 'database' | 'clubs';
  ```
- [ ] Add tab button in navigation:
  ```tsx
  <button
    onClick={() => setActiveTab('clubs')}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
      activeTab === 'clubs' 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Building2 size={18} />
    Club Management
  </button>
  ```
- [ ] Add tab content section:
  ```tsx
  {activeTab === 'clubs' && (
    <div className="animate-in fade-in duration-300">
      {editingClub || isAddingClub ? (
        <ClubForm
          club={editingClub || undefined}
          onBack={() => { setEditingClub(null); setIsAddingClub(false); }}
        />
      ) : (
        <ClubList onEdit={handleEditClub} onAdd={handleNewClub} />
      )}
    </div>
  )}
  ```
- [ ] Test: Navigate between tabs, verify club management works

#### Phase 7: Athlete Form Integration

**Task 7.1: Add Club Dropdown to Athlete Form**
- [ ] Open `src/renderer/features/athletes/AthleteForm.tsx`
- [ ] Import `useClubStore`
- [ ] Load clubs on mount:
  ```typescript
  const { clubs, loadClubs } = useClubStore();
  
  useEffect(() => {
    loadClubs();
  }, [loadClubs]);
  ```
- [ ] Add club field after rank field (before detailed information section):
  ```tsx
  {renderField('clubId', 'Club', 'select', [
    { value: null, label: 'Unattached' },
    ...clubs.map(club => ({ value: club.id, label: club.name }))
  ])}
  ```
- [ ] Update `renderField` to handle nullable select values
- [ ] Test: Create/edit athlete, select club, verify saves correctly

#### Phase 8: Athlete List Filtering

**Task 8.1: Add Club Filter to Athlete List**
- [ ] Open `src/renderer/features/athletes/AthleteList.tsx`
- [ ] Import `useClubStore`
- [ ] Load clubs on mount
- [ ] Add club filter state:
  ```typescript
  const [selectedClubs, setSelectedClubs] = useState<number[]>([]);
  ```
- [ ] Add multi-select club filter UI in filter section:
  ```tsx
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase">Clubs</label>
    <MultiSelect
      options={[
        { value: null, label: 'Unattached' },
        ...clubs.map(c => ({ value: c.id, label: c.name }))
      ]}
      selected={selectedClubs}
      onChange={setSelectedClubs}
      placeholder="All Clubs"
    />
  </div>
  ```
- [ ] Update filter logic to include club filtering:
  ```typescript
  const filteredAthletes = athletes.filter(athlete => {
    // ... existing filters ...
    
    // Club filter
    if (selectedClubs.length > 0) {
      const clubMatch = selectedClubs.includes(athlete.clubId) || 
                        (selectedClubs.includes(null) && !athlete.clubId);
      if (!clubMatch) return false;
    }
    
    return true;
  });
  ```
- [ ] Test: Filter by single club, multiple clubs, unattached, verify results

**Task 8.2: Display Club in Athlete List**
- [ ] In athlete list table, add club column or badge
- [ ] Display club name (fetch from clubs array by clubId)
- [ ] Show "Unattached" for null clubId
- [ ] Style as subtle badge or text
- [ ] Test: Verify club names display correctly

#### Phase 9: Tournament Roster Integration

**Task 9.1: Display Club Info in Tournament Roster Selection**
- [ ] Open `src/renderer/features/tournaments/TournamentDetail.tsx` (or equivalent roster selection component)
- [ ] Import `useClubStore`
- [ ] Load clubs on mount if not already loaded
- [ ] In the available athletes list (roster selection UI), display club information:
  ```tsx
  // For each athlete in the available pool
  <div className="athlete-card">
    <div className="athlete-info">
      <span className="athlete-name">{athlete.name}</span>
      <span className="athlete-details">
        {athlete.weight}kg • {athlete.rank}
      </span>
      {athlete.clubId && (
        <span className="club-badge">
          {clubs.find(c => c.id === athlete.clubId)?.name || 'Unknown Club'}
        </span>
      )}
    </div>
  </div>
  ```
- [ ] Style club badge as subtle, secondary information (e.g., small badge with muted colors)
- [ ] Test: Verify club names appear in roster selection

**Task 9.2: Display Club Info in Selected Roster View**
- [ ] In the selected athletes/roster view, include club information
- [ ] Display club name alongside athlete details
- [ ] Group by weight class, but show club within each athlete entry
- [ ] Example layout:
  ```
  -55kg Weight Class:
    • Athlete A (54kg, White Belt) - Judo Club Bandung
    • Athlete B (53kg, Yellow Belt) - Unattached
  ```
- [ ] Test: Verify club info persists in roster view

**Task 9.3: Optional Club Filtering in Tournament Roster Selection**
- [ ] Consider adding club filter to tournament roster selection (similar to athlete list)
- [ ] Allow filtering available athletes by club when building tournament roster
- [ ] This helps coaches quickly find athletes from specific clubs
- [ ] Test: Filter by club in tournament context

#### Phase 10: Polish & Edge Cases

**Task 10.1: Handle Club Deletion with Assigned Athletes**
- [ ] In `ClubList.tsx`, improve delete confirmation:
  ```typescript
  const handleDelete = async (id: number) => {
    const athleteCount = athletes.filter(a => a.clubId === id).length;
    const message = athleteCount > 0
      ? `Delete this club? ${athleteCount} athlete(s) will become unattached.`
      : 'Delete this club?';
    
    if (!confirm(message)) return;
    
    try {
      await deleteClub(id);
    } catch (error: any) {
      alert(error.message);
    }
  };
  ```
- [ ] Test: Try deleting club with athletes, verify warning

**Task 10.2: Add Visual Feedback (Toasts)**
- [ ] Club created → Success toast: "Club '[Name]' created"
- [ ] Club updated → Success toast: "Club '[Name]' updated"
- [ ] Club deleted → Success toast: "Club deleted"
- [ ] Use consistent toast/notification pattern
- [ ] Test: Verify toasts appear for all actions

**Task 10.3: Responsive Design**
- [ ] Test club list on mobile/tablet screen sizes
- [ ] Cards should stack vertically on mobile
- [ ] Form should be single-column on mobile
- [ ] Club filter in athlete list should be touch-friendly
- [ ] Test: Resize browser, verify all components adapt

**Task 10.4: Load Clubs on App Start**
- [ ] Open main app initialization (likely `App.tsx`)
- [ ] Add `useEffect` to load clubs:
  ```tsx
  useEffect(() => {
    useClubStore.getState().loadClubs();
  }, []);
  ```
- [ ] Test: Restart app, verify clubs load

### Acceptance Criteria

**AC 1: Create Club with Full Metadata**
- **Given** the coach is in Settings → Club Management
- **When** they click "Add Club", enter Name="Judo Club Bandung", Contact Person="John Doe", Phone="+62812345678", Email="contact@judoclubbd.com", Location="Bandung, West Java"
- **Then** the club is created and appears in the club list
- **And** all metadata is saved to the database

**AC 2: Upload Club Logo**
- **Given** the coach is creating/editing a club
- **When** they click "Upload Logo" and select an image file
- **Then** the logo is uploaded to the vault
- **And** a thumbnail preview is displayed
- **And** the logo path is saved in the club record

**AC 3: Assign Athlete to Club**
- **Given** the coach is creating/editing an athlete
- **When** they select "Judo Club Bandung" from the club dropdown
- **Then** the athlete is saved with clubId referencing the club
- **And** the athlete list shows the club name for this athlete

**AC 4: Filter Athletes by Single Club**
- **Given** the athlete list has athletes from multiple clubs
- **When** the coach selects "Judo Club Bandung" in the club filter
- **Then** only athletes assigned to "Judo Club Bandung" are displayed

**AC 5: Filter Athletes by Multiple Clubs**
- **Given** the athlete list has athletes from multiple clubs
- **When** the coach selects "Judo Club Bandung" AND "Judo Club Jakarta" in the club filter
- **Then** athletes from both clubs are displayed (OR logic)

**AC 6: Filter Unattached Athletes**
- **Given** some athletes have no club assignment
- **When** the coach selects "Unattached" in the club filter
- **Then** only athletes with null clubId are displayed

**AC 7: Update Club Information**
- **Given** a club "Judo Club Bandung" exists
- **When** the coach edits the club and changes Location to "Jakarta"
- **Then** the club is updated in the database
- **And** the updated location is displayed in the club list

**AC 8: Delete Club with No Athletes**
- **Given** a club "Test Club" has no assigned athletes
- **When** the coach deletes the club (with confirmation)
- **Then** the club is removed from the database
- **And** the club list updates to remove the club

**AC 9: Prevent Deletion of Club with Athletes**
- **Given** a club "Judo Club Bandung" has 5 assigned athletes
- **When** the coach attempts to delete the club
- **Then** a confirmation message warns: "Delete this club? 5 athlete(s) will become unattached."
- **And** if confirmed, the club is deleted
- **And** the 5 athletes' clubId is set to NULL (via CASCADE or manual update)

**AC 10: Club Persistence Across App Restarts**
- **Given** 3 clubs have been created
- **When** the coach closes and reopens the application
- **Then** all 3 clubs are loaded and displayed in the club list
- **And** athlete-club assignments are preserved

**AC 11: Club Information in Tournament Roster Selection**
- **Given** the coach is creating/editing a tournament roster
- **When** they view the available athletes list for roster selection
- **Then** each athlete displays their club name as a badge or label (e.g., "Judo Club Bandung")
- **And** athletes with no club assignment show "Unattached"
- **When** they add athletes to the tournament roster
- **Then** the selected roster view also displays club information for each athlete
- **And** club information is visible alongside athlete details (name, weight, rank)

## Additional Context

### Dependencies

**Existing Dependencies:**
- `useAthleteStore` - Athlete data for club assignment
- `FileService` - Logo upload to vault
- `SettingsPage.tsx` - Tab infrastructure for club management UI
- `useTournamentStore` - Tournament data for roster selection (if applicable)
- `TournamentDetail.tsx` - Tournament roster selection UI (if applicable)

**New Dependencies:**
- `clubRepository` - Club CRUD operations
- `useClubStore` - Club state management

### Testing Strategy

#### Unit Tests

**Repository Tests:**
- `clubRepository.create` creates club with all metadata
- `clubRepository.getAll` returns all clubs ordered by name
- `clubRepository.update` updates club metadata
- `clubRepository.delete` prevents deletion if athletes assigned
- `clubRepository.delete` succeeds if no athletes assigned

**Store Tests:**
- `useClubStore.addClub` calls IPC and updates state
- `useClubStore.updateClub` updates club in state
- `useClubStore.deleteClub` removes club from state

#### Integration Tests

**Manual Testing Workflow:**
1. Navigate to Settings → Club Management
2. Create club "Judo Club Bandung" with full metadata
3. Upload club logo, verify preview
4. Save club, verify appears in list
5. Create athlete, assign to "Judo Club Bandung"
6. Navigate to athlete list, verify club name displayed
7. Filter by "Judo Club Bandung", verify only assigned athletes shown
8. Create second club "Judo Club Jakarta"
9. Assign some athletes to second club
10. Filter by both clubs, verify combined results
11. Edit club, change location, verify update
12. Try deleting club with athletes, verify warning
13. Confirm deletion, verify athletes become unattached
14. **Navigate to Tournaments, create/edit a tournament**
15. **In roster selection, verify club names appear next to athletes**
16. **Add athletes to roster, verify club info persists in selected roster view**
17. **Optionally test club filtering in tournament roster selection**
18. Restart app, verify clubs and assignments persist

**Edge Case Testing:**
- Create club with minimal data (name only)
- Create club with duplicate name (should fail with UNIQUE constraint)
- Delete club with 0 athletes (should succeed)
- Delete club with 10+ athletes (should warn and unassign)
- Upload very large logo (should fail gracefully)
- Filter by club with 0 athletes (should show empty list)
- Assign athlete to club, delete club, verify athlete.clubId becomes NULL
- **Add athlete with club to tournament roster, delete club, verify roster still displays (shows "Unknown Club" or handles gracefully)**

#### Performance Tests

- Load 50 clubs, verify list renders quickly (<100ms)
- Filter athlete list with 100+ athletes by club, verify <100ms
- Upload club logo (1MB image), verify <2s upload time

### Notes

**Future Enhancements:**
- Club-level statistics (athlete count, tournament participation)
- Club branding in PDF/Excel exports (Epic 6)
- Club membership history tracking
- Club-to-club athlete transfers
- Club hierarchy (parent/sub-clubs)
- Bulk athlete assignment to clubs
- Club-specific tournament preferences

**Design Consistency:**
- Follow Midnight Hybrid color scheme
- Use card-based layouts for club list (similar to rulesets)
- Modern form design with inline validation
- Smooth transitions and hover effects
- Responsive design for mobile/tablet
