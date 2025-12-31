# Tech-Spec: Story 1.7 - Detailed Athlete Information

**Created:** 2025-12-31  
**Status:** Completed

## Overview

Extend the athlete profile with detailed personal information fields required for official tournament registration. This includes birth place, region, contact details, and parent/guardian information for minors.

## Problem Statement

Currently, the athlete profile only captures basic information (name, birth date, gender, weight, rank). However, official tournament registrations require additional details such as:
- Birth place and region (mandatory for most federations)
- Contact information (phone, email, address)
- Parent/guardian details for athletes under 18

Coaches currently have to maintain this information separately in spreadsheets, leading to data duplication and potential errors during registration.

## Solution

**Note:** Since the application is still in development and has not been deployed, we will modify the existing migration `001_initial_schema.ts` directly instead of creating a new migration. This requires deleting the existing database file to apply the changes.

### Database Schema Changes

Modify the `athletes` table in migration `001_initial_schema.ts` to include:

```sql
CREATE TABLE athletes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
    weight REAL NOT NULL,
    rank TEXT NOT NULL,
    clubId INTEGER,
    
    -- New detailed information fields
    birth_place TEXT,
    region TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    parent_guardian TEXT,
    parent_phone TEXT,
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clubId) REFERENCES clubs(id)
);
```

### Field Specifications

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `birth_place` | TEXT | Yes* | Min 2 chars | City/town of birth |
| `region` | TEXT | Yes* | Min 2 chars | Province/state/region |
| `address` | TEXT | No | - | Current residential address |
| `phone` | TEXT | No | Phone format | Contact phone number |
| `email` | TEXT | No | Email format | Email address |
| `parent_guardian` | TEXT | No | - | Parent/guardian name (for minors) |
| `parent_phone` | TEXT | No | Phone format | Parent/guardian contact |

*Required for tournament registration exports, but can be added later

### Zod Schema Updates

```typescript
export const AthleteSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    gender: z.enum(['male', 'female']),
    weight: z.number().positive(),
    rank: z.string().min(1, 'Rank is required'),
    clubId: z.number().nullable().optional(),
    
    // New fields
    birth_place: z.string().min(2, 'Birth place is required').optional(),
    region: z.string().min(2, 'Region is required').optional(),
    address: z.string().optional(),
    phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format').optional().or(z.literal('')),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    parent_guardian: z.string().optional(),
    parent_phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format').optional().or(z.literal('')),
});
```

### Frontend Changes

#### AthleteForm.tsx Updates

Add a new section in the Profile tab after the basic information:

```tsx
{/* Detailed Information Section */}
<div className="space-y-4">
    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">
        Detailed Information
    </h4>
    
    <div className="grid grid-cols-2 gap-4">
        {renderField('birth_place', 'Birth Place', 'text')}
        {renderField('region', 'Region/Province', 'text')}
    </div>
    
    {renderField('address', 'Address', 'textarea')}
    
    <div className="grid grid-cols-2 gap-4">
        {renderField('phone', 'Phone Number', 'tel')}
        {renderField('email', 'Email', 'email')}
    </div>
    
    {/* Parent/Guardian Info - Show for athletes under 18 */}
    {isMinor && (
        <>
            <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-4">
                Parent/Guardian Information
            </h5>
            <div className="grid grid-cols-2 gap-4">
                {renderField('parent_guardian', 'Parent/Guardian Name', 'text')}
                {renderField('parent_phone', 'Parent/Guardian Phone', 'tel')}
            </div>
        </>
    )}
</div>
```

## Implementation Plan

### Tasks

#### Phase 1: Database Schema Update
- [x] **Task 1.1:** Modify migration `001_initial_schema.ts`
  - Add new columns directly to the CREATE TABLE statement for athletes
  - No need for separate migration since app is not yet deployed
  - Delete existing database file to apply changes

#### Phase 2: Schema & Type Updates
- [x] **Task 2.1:** Update `src/shared/schemas.ts`
  - Extend `AthleteSchema` with new fields
  - Add validation rules (phone format, email format)
  - Make birth_place and region optional but recommended

- [x] **Task 2.2:** Update TypeScript types
  - Types will auto-update from schema
  - Update repository interfaces if needed

#### Phase 3: Backend Updates
- [x] **Task 3.1:** Update `athleteRepository.ts`
  - Modify INSERT query to include new fields
  - Modify UPDATE query to include new fields
  - Handle null/empty values properly

#### Phase 4: Frontend Updates
- [x] **Task 4.1:** Update `AthleteForm.tsx`
  - Add new form fields in Profile tab
  - Group fields logically (Personal Info, Contact Info, Parent/Guardian)
  - Add conditional rendering for parent/guardian section (show only for minors)
  - Update form default values

- [x] **Task 4.2:** Add helper function for minor detection
  - Calculate age based on birth date
  - Show/hide parent/guardian fields accordingly

#### Phase 5: Testing
- [x] **Task 5.1:** Test form validation
  - Phone number format validation
  - Email format validation
  - Required field validation for tournament exports

- [x] **Task 5.2:** Test with fresh database
  - Delete old database file
  - Restart app to run migrations
  - Verify all fields work correctly

### Acceptance Criteria

- [x] **AC 1:** When creating a new athlete, I can enter birth place, region, address, phone, email, and parent/guardian information

- [x] **AC 2:** When editing an existing athlete, all new fields are available and preserve existing data

- [x] **AC 3:** Phone number fields validate format (digits, spaces, dashes, parentheses, plus sign)

- [x] **AC 4:** Email field validates proper email format

- [x] **AC 5:** Parent/Guardian section is visible when athlete is under 18 years old (calculated from birth date)

- [x] **AC 6:** Modified migration 001 includes all new fields in the athletes table schema

- [x] **AC 7:** All new fields are optional (can be filled later) but birth_place and region show as "recommended" for tournament registration

## Additional Context

### Future Enhancements
- Export validation: Warn if birth_place or region is missing when exporting for tournament
- Auto-populate region based on club affiliation
- Address autocomplete/validation
- Photo ID upload linked to athlete profile

### Notes
- Keep athlete list view unchanged - detailed info only visible in detail modal
- Consider adding a "completeness" indicator showing which athletes have all required tournament info
- Phone format is flexible to accommodate international numbers

## Review Notes
- Adversarial review completed
- Findings: 14 total, 8 fixed, 6 skipped (F3 rejected, plus minor/future)
- **Fixes Applied:**
  - Precise age calculation (accounting for month/day)
  - Reactive parent/guardian section visibility
  - Strict validation (max length, phone digits, email trim)
  - Database indexes for search performance
