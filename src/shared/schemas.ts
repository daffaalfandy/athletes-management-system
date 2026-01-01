import { z } from 'zod';

export const AthleteSchema = z.object({
    id: z.number().optional(), // Auto-incremented in DB
    name: z.string().min(1, 'Name is required'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    gender: z.enum(['male', 'female']),
    weight: z.number().positive(),
    rank: z.string().min(1, 'Rank is required'),
    clubId: z.number().nullable().optional(), // Linked to Clubs table (Story 1.5)
    profile_photo_path: z.string().optional(),

    // Detailed information fields for tournament registration
    birth_place: z.string().min(2, 'Birth place must be at least 2 characters').max(100, 'Birth place is too long').nullable().optional().or(z.literal('')),
    region: z.string().min(2, 'Region must be at least 2 characters').max(100, 'Region is too long').nullable().optional().or(z.literal('')),
    address: z.string().max(500, 'Address is too long').nullable().optional().or(z.literal('')),
    phone: z.string().regex(/^[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').nullable().optional().or(z.literal('')),
    email: z.string().trim().email('Invalid email format').max(255, 'Email is too long').nullable().optional().or(z.literal('')),
    parent_guardian: z.string().max(200, 'Name is too long').nullable().optional().or(z.literal('')),
    parent_phone: z.string().regex(/^[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*\d[\d\s\-\+\(\)]*$/, 'Phone must contain at least 3 digits').max(50, 'Phone number is too long').nullable().optional().or(z.literal('')),
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
