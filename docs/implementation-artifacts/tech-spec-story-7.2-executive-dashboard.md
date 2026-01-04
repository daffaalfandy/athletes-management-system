# Tech-Spec: Sprint 7.2 - Executive Dashboard (Home)

**Created:** 2026-01-04  
**Status:** Ready for Development  
**Story:** E7.S2 - Executive Dashboard (Home)

## Overview

### Problem Statement

The application currently lacks a welcoming landing page that provides coaches with an immediate overview of their athlete pool's health and key metrics. Additionally, there is no way to track athlete activity status (Constant, Intermittent, Dormant), which is essential for understanding the "Competitive Pool" size and overall program health.

### Solution

Create a comprehensive Executive Dashboard as the default landing page that displays:
1. **Regency Branding** - Logo and name from settings (E7.S1)
2. **Key Performance Indicators (KPIs)** - Total Pool, Competitive Pool (Constant + Intermittent), Gender Distribution
3. **Medallion Summary** - Total medal counts (Gold, Silver, Bronze) with year filtering
4. **Quick Actions** - Navigation shortcuts to common tasks
5. **Activity Status Management** - Add capability to set/edit athlete activity status in athlete profiles

### Scope

**In Scope:**
- Update existing database migration (001) to add `activity_status` column to athletes table
- Dashboard page component with KPI cards and medallion summary
- Year selector for filtering medallion data
- Quick action buttons for navigation
- Activity status dropdown in AthleteForm
- Update AthleteList to use real activity status instead of hardcoded value
- Router logic to make Dashboard the default view

**Out of Scope:**
- Advanced analytics or charts (future enhancement)
- Tournament participation history on dashboard (Epic 8)
- Automated activity status based on attendance tracking
- Export/print dashboard functionality

---

## Context for Development

### Codebase Patterns

1. **Database Schema Changes**: Use migration files in `src/main/migrations/`
2. **Repository Pattern**: All DB operations go through repositories in `src/main/repositories/`
3. **IPC Communication**: Define types in `src/shared/types/electron.d.ts`, expose in `preload.ts`, implement handlers in services
4. **State Management**: Zustand stores in `src/renderer/features/*/use*Store.ts`
5. **Component Structure**: Feature-based organization under `src/renderer/features/`
6. **Styling**: Tailwind CSS with "Midnight Hybrid" theme (slate-900 sidebar, white content, blue accents)

### Files to Reference

**Existing Files to Modify:**
- `src/main/migrations/001_initial_schema.ts` - Add activity_status column to athletes table
- `src/shared/schemas.ts` - Update AthleteSchema to include activity_status
- `src/shared/types/domain.ts` - ActivityStatus enum already exists
- `src/main/repositories/athleteRepository.ts` - Update create/update queries
- `src/main/repositories/historyRepository.ts` - Add getMedalCountsByYear method
- `src/renderer/renderer.tsx` - Add Dashboard route and make it default
- `src/renderer/features/athletes/AthleteForm.tsx` - Add activity status field
- `src/renderer/features/athletes/AthleteList.tsx` - Remove hardcoded status, use real data

**New Files to Create:**
- `src/renderer/features/dashboard/Dashboard.tsx` - Main dashboard component
- `src/renderer/features/dashboard/KPICard.tsx` - Reusable KPI card component
- `src/renderer/features/dashboard/MedallionSummary.tsx` - Medal summary component

### Technical Decisions

1. **Activity Status Default**: New athletes default to `ActivityStatus.Constant`
2. **Competitive Pool Definition**: Constant + Intermittent (excludes Dormant)
3. **Year Filter**: Medal counts filtered by `date` field in medals table (YYYY format)
4. **Dashboard as Default**: Change initial `activeView` state from 'athletes' to 'dashboard'
5. **Medal Year Extraction**: Use `date.substring(0, 4)` to extract year from YYYY-MM-DD format
6. **Logo Display**: Reuse existing `useSettingsStore` logic from E7.S1

---

## Implementation Plan

### Phase 1: Database Schema & Backend (Foundation)

#### Task 1.1: Update Initial Schema Migration to Include Activity Status
**File:** `src/main/migrations/001_initial_schema.ts`

Add `activity_status` column to the athletes table creation (around line 26):

```typescript
// Athletes Table
db.exec(`
  CREATE TABLE IF NOT EXISTS athletes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
    weight REAL NOT NULL,
    rank TEXT NOT NULL,
    clubId INTEGER,
    profile_photo_path TEXT,
    
    -- Detailed information fields for tournament registration
    birth_place TEXT,
    region TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    parent_guardian TEXT,
    parent_phone TEXT,
    
    -- Activity Status (Story 7.2)
    activity_status TEXT DEFAULT 'Constant' CHECK(activity_status IN ('Constant', 'Intermittent', 'Dormant')),
    
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_athlete_name_dob UNIQUE (name, birthDate)
  );
  
  CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
  CREATE INDEX IF NOT EXISTS idx_athletes_birth_place ON athletes(birth_place);
  CREATE INDEX IF NOT EXISTS idx_athletes_region ON athletes(region);
  CREATE INDEX IF NOT EXISTS idx_athletes_clubId ON athletes(clubId);
  CREATE INDEX IF NOT EXISTS idx_athletes_activity_status ON athletes(activity_status);
`);
```

**Note:** If you have existing data, you'll need to manually add the column using SQLite browser or delete your database file to recreate it with the new schema.

#### Task 1.2: Update Athlete Schema
**File:** `src/shared/schemas.ts`

Add to `AthleteSchema`:
```typescript
activity_status: z.enum(['Constant', 'Intermittent', 'Dormant']).default('Constant'),
```

#### Task 1.3: Update Athlete Repository
**File:** `src/main/repositories/athleteRepository.ts`

Update `create` method INSERT statement:
```typescript
INSERT INTO athletes (
    name, birthDate, gender, weight, rank, clubId, profile_photo_path, 
    birth_place, region, address, phone, email, parent_guardian, parent_phone,
    activity_status
)
VALUES (
    @name, @birthDate, @gender, @weight, @rank, @clubId, @profile_photo_path,
    @birth_place, @region, @address, @phone, @email, @parent_guardian, @parent_phone,
    @activity_status
)
```

Update `update` method SET clause:
```typescript
UPDATE athletes
SET name = @name,
    birthDate = @birthDate,
    gender = @gender,
    weight = @weight,
    rank = @rank,
    clubId = @clubId,
    profile_photo_path = @profile_photo_path,
    birth_place = @birth_place,
    region = @region,
    address = @address,
    phone = @phone,
    email = @email,
    parent_guardian = @parent_guardian,
    parent_phone = @parent_phone,
    activity_status = @activity_status,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = @id
```

Add to `safeAthlete` object in both methods:
```typescript
activity_status: athlete.activity_status || 'Constant',
```

#### Task 1.4: Add Dashboard Statistics Repository Methods
**File:** `src/main/repositories/athleteRepository.ts`

Add new methods:
```typescript
getStatistics: (): {
    totalPool: number;
    competitivePool: number;
    maleCount: number;
    femaleCount: number;
} => {
    const db = getDatabase();
    
    const totalPool = db.prepare('SELECT COUNT(*) as count FROM athletes').get() as { count: number };
    
    const competitivePool = db.prepare(`
        SELECT COUNT(*) as count 
        FROM athletes 
        WHERE activity_status IN ('Constant', 'Intermittent')
    `).get() as { count: number };
    
    const maleCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM athletes 
        WHERE gender = 'male'
    `).get() as { count: number };
    
    const femaleCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM athletes 
        WHERE gender = 'female'
    `).get() as { count: number };
    
    return {
        totalPool: totalPool.count,
        competitivePool: competitivePool.count,
        maleCount: maleCount.count,
        femaleCount: femaleCount.count,
    };
},
```

#### Task 1.5: Add Medal Statistics Repository Method
**File:** `src/main/repositories/historyRepository.ts`

Add new method:
```typescript
getMedalCountsByYear: (year?: number): {
    gold: number;
    silver: number;
    bronze: number;
} => {
    const db = getDatabase();
    
    let query = `
        SELECT 
            SUM(CASE WHEN medal = 'Gold' THEN 1 ELSE 0 END) as gold,
            SUM(CASE WHEN medal = 'Silver' THEN 1 ELSE 0 END) as silver,
            SUM(CASE WHEN medal = 'Bronze' THEN 1 ELSE 0 END) as bronze
        FROM medals
    `;
    
    if (year) {
        query += ` WHERE substr(date, 1, 4) = '${year}'`;
    }
    
    const result = db.prepare(query).get() as { gold: number | null; silver: number | null; bronze: number | null };
    
    return {
        gold: result.gold || 0,
        silver: result.silver || 0,
        bronze: result.bronze || 0,
    };
},

getAvailableMedalYears: (): number[] => {
    const db = getDatabase();
    
    const years = db.prepare(`
        SELECT DISTINCT substr(date, 1, 4) as year 
        FROM medals 
        ORDER BY year DESC
    `).all() as { year: string }[];
    
    return years.map(y => parseInt(y.year, 10)).filter(y => !isNaN(y));
},
```

#### Task 1.6: Update Athlete Service IPC Handlers
**File:** `src/main/services/athleteService.ts`

Add handler:
```typescript
ipcMain.handle('athlete:getStatistics', async () => {
    try {
        const stats = athleteRepository.getStatistics();
        return { success: true, data: stats };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});
```

#### Task 1.7: Update History Service IPC Handlers
**File:** `src/main/services/historyService.ts`

Add handlers:
```typescript
ipcMain.handle('history:getMedalCountsByYear', async (_, year?: number) => {
    try {
        const counts = historyRepository.getMedalCountsByYear(year);
        return { success: true, data: counts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('history:getAvailableMedalYears', async () => {
    try {
        const years = historyRepository.getAvailableMedalYears();
        return { success: true, data: years };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});
```

#### Task 1.8: Update IPC Type Definitions
**File:** `src/shared/types/electron.d.ts`

Add to `api.athlete`:
```typescript
getStatistics: () => Promise<{
    success: boolean;
    data?: {
        totalPool: number;
        competitivePool: number;
        maleCount: number;
        femaleCount: number;
    };
    error?: string;
}>;
```

Add to `api.history`:
```typescript
getMedalCountsByYear: (year?: number) => Promise<{
    success: boolean;
    data?: {
        gold: number;
        silver: number;
        bronze: number;
    };
    error?: string;
}>;
getAvailableMedalYears: () => Promise<{
    success: boolean;
    data?: number[];
    error?: string;
}>;
```

#### Task 1.9: Update Preload Script
**File:** `src/main/preload.ts`

Add to `athlete` object:
```typescript
getStatistics: () => ipcRenderer.invoke('athlete:getStatistics'),
```

Add to `history` object:
```typescript
getMedalCountsByYear: (year?: number) => ipcRenderer.invoke('history:getMedalCountsByYear', year),
getAvailableMedalYears: () => ipcRenderer.invoke('history:getAvailableMedalYears'),
```

---

### Phase 2: Frontend Components (Dashboard UI)

#### Task 2.1: Create KPI Card Component
**File:** `src/renderer/features/dashboard/KPICard.tsx`

```typescript
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-blue-500',
    trend,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-slate-50 ${iconColor}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-slate-900">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-slate-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};
```

#### Task 2.2: Create Medallion Summary Component
**File:** `src/renderer/features/dashboard/MedallionSummary.tsx`

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export const MedallionSummary: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [medalCounts, setMedalCounts] = useState({ gold: 0, silver: 0, bronze: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadYears = async () => {
            const result = await window.api.history.getAvailableMedalYears();
            if (result.success && result.data) {
                setAvailableYears(result.data);
            }
        };
        loadYears();
    }, []);

    useEffect(() => {
        const loadMedalCounts = async () => {
            setIsLoading(true);
            const year = selectedYear === 'all' ? undefined : selectedYear;
            const result = await window.api.history.getMedalCountsByYear(year);
            if (result.success && result.data) {
                setMedalCounts(result.data);
            }
            setIsLoading(false);
        };
        loadMedalCounts();
    }, [selectedYear]);

    const totalMedals = medalCounts.gold + medalCounts.silver + medalCounts.bronze;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="text-amber-500" size={20} />
                    Medallion Summary
                </h3>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Time</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-slate-400">Loading...</div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-2xl font-bold text-slate-900">{totalMedals}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total</p>
                    </div>

                    {/* Gold */}
                    <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-100">
                        <Medal className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-bold text-amber-700">{medalCounts.gold}</p>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Gold</p>
                    </div>

                    {/* Silver */}
                    <div className="text-center p-4 rounded-lg bg-slate-100 border border-slate-200">
                        <Medal className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-2xl font-bold text-slate-700">{medalCounts.silver}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Silver</p>
                    </div>

                    {/* Bronze */}
                    <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
                        <Award className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold text-orange-700">{medalCounts.bronze}</p>
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mt-1">Bronze</p>
                    </div>
                </div>
            )}
        </div>
    );
};
```

#### Task 2.3: Create Main Dashboard Component
**File:** `src/renderer/features/dashboard/Dashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Users, Activity, UserCheck, UserX, Plus, Trophy } from 'lucide-react';
import { KPICard } from './KPICard';
import { MedallionSummary } from './MedallionSummary';
import { useSettingsStore } from '../settings/useSettingsStore';

interface DashboardProps {
    onNavigate: (view: 'athletes' | 'tournaments') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { kabupatanName, kabupatanLogoPath } = useSettingsStore();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [statistics, setStatistics] = useState({
        totalPool: 0,
        competitivePool: 0,
        maleCount: 0,
        femaleCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (kabupatanLogoPath) {
            setLogoUrl(`dossier://${kabupatanLogoPath}`);
        } else {
            setLogoUrl(null);
        }
    }, [kabupatanLogoPath]);

    useEffect(() => {
        const loadStatistics = async () => {
            setIsLoading(true);
            const result = await window.api.athlete.getStatistics();
            if (result.success && result.data) {
                setStatistics(result.data);
            }
            setIsLoading(false);
        };
        loadStatistics();
    }, []);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50">
            {/* Header with Regency Branding */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-6">
                    {logoUrl && (
                        <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                            <img src={logoUrl} alt="Regency Logo" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Command Center</h1>
                        <p className="text-slate-300 text-sm font-medium">
                            {kabupatanName} • Athlete Management System
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                            <div className="h-12 bg-slate-100 rounded mb-4"></div>
                            <div className="h-8 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Pool"
                        value={statistics.totalPool}
                        subtitle="All registered athletes"
                        icon={Users}
                        iconColor="text-blue-600"
                    />
                    <KPICard
                        title="Competitive Pool"
                        value={statistics.competitivePool}
                        subtitle="Constant + Intermittent"
                        icon={Activity}
                        iconColor="text-emerald-600"
                    />
                    <KPICard
                        title="Male Athletes"
                        value={statistics.maleCount}
                        subtitle={`${Math.round((statistics.maleCount / statistics.totalPool) * 100) || 0}% of total`}
                        icon={UserCheck}
                        iconColor="text-indigo-600"
                    />
                    <KPICard
                        title="Female Athletes"
                        value={statistics.femaleCount}
                        subtitle={`${Math.round((statistics.femaleCount / statistics.totalPool) * 100) || 0}% of total`}
                        icon={UserX}
                        iconColor="text-pink-600"
                    />
                </div>
            )}

            {/* Medallion Summary */}
            <MedallionSummary />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => onNavigate('athletes')}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Plus size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700">Add Athlete</p>
                            <p className="text-xs text-slate-500">Register a new athlete to the pool</p>
                        </div>
                    </button>
                    <button
                        onClick={() => onNavigate('tournaments')}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Trophy size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Manage Tournaments</p>
                            <p className="text-xs text-slate-500">Create or edit tournament rosters</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
```

---

### Phase 3: Integration & UI Updates

#### Task 3.1: Update AthleteForm with Activity Status
**File:** `src/renderer/features/athletes/AthleteForm.tsx`

Add after the `clubId` field (around line 432):
```typescript
{renderField('activity_status', 'Activity Status', 'text', [
    { value: 'Constant', label: 'Constant - Regular Training' },
    { value: 'Intermittent', label: 'Intermittent - Occasional' },
    { value: 'Dormant', label: 'Dormant - Inactive' }
])}
```

Update default values in `useForm` (around line 54):
```typescript
defaultValues: initialData || {
    // ... existing fields
    activity_status: 'Constant',
},
```

#### Task 3.2: Update AthleteList to Use Real Status
**File:** `src/renderer/features/athletes/AthleteList.tsx`

Remove hardcoded status in `enhanceAthlete` function (around line 133):
```typescript
// BEFORE:
status: ActivityStatus.Constant,

// AFTER:
status: athlete.activity_status || ActivityStatus.Constant,
```

#### Task 3.3: Integrate Dashboard into Main App
**File:** `src/renderer/renderer.tsx`

1. Import Dashboard component (add to imports):
```typescript
import { Dashboard } from './features/dashboard/Dashboard';
```

2. Change default view (line 18):
```typescript
// BEFORE:
const [activeView, setActiveView] = useState<'dashboard' | 'athletes' | ...>('athletes');

// AFTER:
const [activeView, setActiveView] = useState<'dashboard' | 'athletes' | ...>('dashboard');
```

3. Add Dashboard to content area (replace "Coming Soon" placeholder around line 218):
```typescript
{activeView === 'dashboard' && (
    <Dashboard 
        onNavigate={(view) => {
            setActiveView(view);
            if (view === 'athletes') {
                handleNewAthlete();
            }
        }} 
    />
)}
```

4. Remove the old "Coming Soon" block for dashboard.

---

## Acceptance Criteria

### AC1: Database Schema
- [ ] **Given** the application starts for the first time after this update
- [ ] **When** the migration runs
- [ ] **Then** the `athletes` table should have an `activity_status` column with CHECK constraint
- [ ] **And** all existing athletes should have `activity_status = 'Constant'`

### AC2: Activity Status in Athlete Profile
- [ ] **Given** a coach is creating a new athlete
- [ ] **When** they view the athlete form
- [ ] **Then** they should see an "Activity Status" dropdown with options: Constant, Intermittent, Dormant
- [ ] **And** the default selection should be "Constant"

- [ ] **Given** a coach is editing an existing athlete profile
- [ ] **When** they click on the Activity Status field
- [ ] **Then** they should be able to change the status
- [ ] **And** clicking the checkmark should save the change immediately

### AC3: Dashboard Display
- [ ] **Given** the application is launched
- [ ] **When** the user lands on the Dashboard
- [ ] **Then** they should see the Regency Logo (if configured) prominently displayed
- [ ] **And** the Kabupaten Name should be shown in the header

### AC4: KPI Cards
- [ ] **Given** the Dashboard is displayed
- [ ] **When** the KPI cards load
- [ ] **Then** "Total Pool" should show the count of ALL athletes
- [ ] **And** "Competitive Pool" should show count of athletes with status = Constant OR Intermittent
- [ ] **And** "Male Athletes" should show count of athletes with gender = male
- [ ] **And** "Female Athletes" should show count of athletes with gender = female

### AC5: Medallion Summary
- [ ] **Given** the Dashboard is displayed
- [ ] **When** the Medallion Summary loads with "All Time" selected
- [ ] **Then** it should display total counts of Gold, Silver, and Bronze medals across all years
- [ ] **And** a "Total" count should be shown

- [ ] **Given** the year selector dropdown
- [ ] **When** the coach selects a specific year (e.g., "2025")
- [ ] **Then** the medal counts should update to show only medals awarded in that year
- [ ] **And** the year should be extracted from the `date` field in the medals table

### AC6: Quick Actions
- [ ] **Given** the Dashboard is displayed
- [ ] **When** the coach clicks "Add Athlete"
- [ ] **Then** they should be navigated to the Athletes view
- [ ] **And** the "New Athlete" modal should open automatically

- [ ] **Given** the Dashboard is displayed
- [ ] **When** the coach clicks "Manage Tournaments"
- [ ] **Then** they should be navigated to the Tournaments view

### AC7: Athlete List Integration
- [ ] **Given** the Athlete List is displayed
- [ ] **When** viewing athlete status badges
- [ ] **Then** the status should reflect the actual `activity_status` value from the database
- [ ] **And** not the hardcoded "Constant" value

### AC8: Default Landing Page
- [ ] **Given** the application is launched
- [ ] **When** the main window opens
- [ ] **Then** the Dashboard should be the active view by default
- [ ] **And** the "Dashboard" nav item should be highlighted in the sidebar

---

## Additional Context

### Dependencies

**NPM Packages:** (All already installed)
- `react`, `react-dom`
- `zustand`
- `lucide-react`
- `tailwindcss`
- `better-sqlite3`

**Internal Dependencies:**
- Story E7.S1 (Regency & Club Branding) must be completed for logo/name display
- Existing medal history data structure (medals table)

### Testing Strategy

**Manual Testing Checklist:**
1. **Migration Test**: Delete `app.db`, restart app, verify `activity_status` column exists
2. **Create Athlete**: Create new athlete, verify default status is "Constant"
3. **Edit Status**: Edit athlete, change status to "Intermittent", verify save
4. **Dashboard KPIs**: 
   - Create 10 athletes (5 male, 5 female)
   - Set 3 to "Dormant"
   - Verify Total Pool = 10, Competitive Pool = 7, Male = 5, Female = 5
5. **Medal Filtering**:
   - Add medals with dates in 2024 and 2025
   - Select "2024" in year filter
   - Verify only 2024 medals are counted
6. **Quick Actions**: Click each button, verify navigation works
7. **Logo Display**: Upload logo in Settings, verify it appears on Dashboard

**Edge Cases:**
- No athletes in database → KPIs show 0
- No medals in database → Medallion Summary shows 0
- No logo configured → Dashboard shows without logo (graceful degradation)
- Year with no medals → All counts show 0

### Performance Considerations

- Dashboard statistics queries are simple COUNT operations (fast)
- Medal year extraction uses `substr()` which is efficient in SQLite
- No pagination needed for KPIs (single query per metric)
- Consider caching statistics if pool size exceeds 10,000 athletes (future optimization)

### Notes

- The "Competitive Pool" definition (Constant + Intermittent) aligns with the PRD's concept of "Active/Intermittent" athletes
- Activity status is subjective and manually managed by the coach (no automated tracking in this story)
- Future enhancement: Automated status updates based on attendance or last training date
- The Dashboard provides a "Command Center" feel as specified in the epic acceptance criteria
