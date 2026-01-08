import { z } from 'zod';

export const AthleteSchema = z.object({
    id: z.number().optional(), // Auto-incremented in DB
    name: z.string().min(1, 'Name is required'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    gender: z.enum(['male', 'female']),
    weight: z.number().positive(),
    rank: z.string().min(1, 'Rank is required'),
    clubId: z.union([z.number(), z.string(), z.null()])
        .optional()
        .transform(val => {
            if (val === '' || val === null || val === undefined) return null;
            const num = typeof val === 'number' ? val : parseInt(String(val), 10);
            return isNaN(num) ? null : num;
        }),
    profile_photo_path: z.union([z.string(), z.null(), z.undefined()]).optional(),

    // Detailed information fields for tournament registration
    birth_place: z.string().min(2, 'Birth place must be at least 2 characters').max(100, 'Birth place is too long').nullable().optional().or(z.literal('')),
    region: z.string().min(2, 'Region must be at least 2 characters').max(100, 'Region is too long').nullable().optional().or(z.literal('')),
    address: z.string().max(500, 'Address is too long').nullable().optional().or(z.literal('')),
    phone: z.string().regex(/^[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').nullable().optional().or(z.literal('')),
    email: z.string().trim().email('Invalid email format').max(255, 'Email is too long').nullable().optional().or(z.literal('')),
    parent_guardian: z.string().max(200, 'Name is too long').nullable().optional().or(z.literal('')),
    parent_phone: z.string().regex(/^[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').nullable().optional().or(z.literal('')),

    // Activity Status (Story 7.2)
    activity_status: z.enum(['Constant', 'Intermittent', 'Dormant']).default('Constant'),
});

export type Athlete = z.infer<typeof AthleteSchema>;

export const AthleteUpdateSchema = AthleteSchema.extend({
    id: z.number(),
});

export const PromotionSchema = z.object({
    id: z.number().optional(),
    athleteId: z.number(),
    rank: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    notes: z.string().optional(),
    proof_image_path: z.string().optional(),
});

export type Promotion = z.infer<typeof PromotionSchema>;

export const MedalSchema = z.object({
    id: z.number().optional(),
    athleteId: z.number(),
    tournament_id: z.number().nullable().optional(), // Link to tournament history
    tournament: z.string().min(1, 'Tournament name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    medal: z.enum(['Gold', 'Silver', 'Bronze']),
    category: z.string().optional(),
    proof_image_path: z.string().optional(),
});

export type Medal = z.infer<typeof MedalSchema>;

export const AgeCategorySchema = z.object({
    id: z.number().optional(),
    ruleset_id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    min_age: z.number().int().min(0),
    max_age: z.number().int().max(150),
    gender: z.enum(['M', 'F', 'MIXED']),
    weight_classes: z.array(z.object({
        limit: z.number().positive(),
        label: z.string().min(1),
    })).optional(), // Only used in tournament snapshots
});

export type AgeCategory = z.infer<typeof AgeCategorySchema>;

export const RulesetSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    is_active: z.union([z.boolean(), z.number()]).transform((val) => !!val).optional(),
    categories: z.array(AgeCategorySchema).optional(),
});

export type Ruleset = z.infer<typeof RulesetSchema>;

// Weight Class Schema
export const WeightClassSchema = z.object({
    limit: z.number().positive(),
    label: z.string().min(1),
});

export type WeightClass = z.infer<typeof WeightClassSchema>;

// Tournament Schema
export const TournamentSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Tournament name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    location: z.string().optional(),
    ruleset_snapshot: z.string(), // JSON string
    created_at: z.string().optional(),
});

export type Tournament = z.infer<typeof TournamentSchema>;

// Tournament Roster Entry Schema
export const TournamentRosterEntrySchema = z.object({
    id: z.number().optional(),
    tournament_id: z.number(),
    athlete_id: z.number(),
    weight_class: z.string().min(1),
    added_at: z.string().optional(),
});

export type TournamentRosterEntry = z.infer<typeof TournamentRosterEntrySchema>;

// Club Schema
export const ClubSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Club name is required').max(200, 'Name is too long'),
    logo_path: z.string().optional(),
    contact_person: z.string().max(200, 'Name is too long').optional().or(z.literal('')),
    contact_phone: z.string().regex(/^[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*\d[\d\s\-+()]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').optional().or(z.literal('')),
    contact_email: z.string().trim().email('Invalid email format').max(255, 'Email is too long').optional().or(z.literal('')),
    location: z.string().max(500, 'Location is too long').optional().or(z.literal('')),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type Club = z.infer<typeof ClubSchema>;

export const ClubUpdateSchema = ClubSchema.extend({
    id: z.number(),
});

// Tournament History Schema
export const TournamentHistorySchema = z.object({
    id: z.number().optional(),
    athlete_id: z.number(),
    tournament_id: z.number().nullable().optional(),
    tournament_name: z.string().min(1, 'Tournament name is required'),
    tournament_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    tournament_location: z.string().optional(),
    weight_class: z.string().optional(),
    age_category: z.string().optional(),
    is_auto_generated: z.boolean().optional(),
    created_at: z.string().optional(),
});

export type TournamentHistory = z.infer<typeof TournamentHistorySchema>;

