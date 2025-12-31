import { z } from 'zod';

export const AthleteSchema = z.object({
    id: z.number().optional(), // Auto-incremented in DB
    name: z.string().min(1, 'Name is required'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    gender: z.enum(['male', 'female']),
    weight: z.number().positive(),
    rank: z.string().min(1, 'Rank is required'),
    clubId: z.number().nullable().optional(), // Linked to Clubs table (Story 1.5)
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
});

export type Promotion = z.infer<typeof PromotionSchema>;

export const MedalSchema = z.object({
    id: z.number().optional(),
    athleteId: z.number(),
    tournament: z.string().min(1, 'Tournament name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    medal: z.enum(['Gold', 'Silver', 'Bronze']),
    category: z.string().optional(),
});

export type Medal = z.infer<typeof MedalSchema>;
