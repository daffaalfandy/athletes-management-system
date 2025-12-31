import { z } from 'zod';

export const AthleteSchema = z.object({
    id: z.number().optional(), // Auto-incremented in DB
    name: z.string().min(1, 'Name is required'),
    birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
    gender: z.enum(['male', 'female']),
    weight: z.number().positive(),
    rank: z.string().min(1, 'Rank is required'),
    clubId: z.number().optional(), // Will be linked to Club entity later
});

export type Athlete = z.infer<typeof AthleteSchema>;

export const AthleteUpdateSchema = AthleteSchema.extend({
    id: z.number(),
});
