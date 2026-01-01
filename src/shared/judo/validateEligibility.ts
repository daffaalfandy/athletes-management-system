import { Athlete, Ruleset } from '../schemas';
import { calculateAgeCategory } from './calculateAgeCategory';

/**
 * Story 5.3: Eligibility Conflict Detection
 * 
 * Validates athlete eligibility against tournament rules (age category, weight class).
 * Returns an array of conflicts for display in the UI.
 */

export type ConflictType = 'age' | 'weight' | 'rank';

export interface EligibilityConflict {
    athleteId: number;
    type: ConflictType;
    severity: 'error' | 'warning';
    message: string;
    details?: string;
}

// Story 5.1: Weight Class Divisions (Placeholder - same as AthleteList)
const WEIGHT_DIVISIONS = {
    male: ['-60kg', '-66kg', '-73kg', '-81kg', '-90kg', '-100kg', '+100kg'],
    female: ['-48kg', '-52kg', '-57kg', '-63kg', '-70kg', '-78kg', '+78kg'],
};

/**
 * Calculate weight class for an athlete based on gender and weight
 */
function calculateWeightClass(gender: 'male' | 'female', weight: number): string {
    if (weight <= 0) return 'Unclassified';

    const divisions = WEIGHT_DIVISIONS[gender];
    for (const division of divisions) {
        if (division.startsWith('+')) {
            const threshold = parseInt(division.substring(1).replace('kg', ''));
            if (weight > threshold) {
                return division;
            }
        } else {
            const limit = parseInt(division.substring(1).replace('kg', ''));
            if (weight <= limit) {
                return division;
            }
        }
    }
    return 'Unclassified';
}

/**
 * Validate age category eligibility
 */
function validateAgeCategory(
    athlete: Athlete,
    ruleset: Ruleset,
    referenceYear: number
): EligibilityConflict[] {
    const conflicts: EligibilityConflict[] = [];

    const ageCategory = calculateAgeCategory(
        athlete.birthDate,
        athlete.gender,
        ruleset.categories || [],
        referenceYear
    );

    if (ageCategory === 'Unclassified') {
        const birthYear = athlete.birthDate ? new Date(athlete.birthDate).getFullYear() : null;
        const age = birthYear ? referenceYear - birthYear : null;

        conflicts.push({
            athleteId: athlete.id!,
            type: 'age',
            severity: 'error',
            message: 'No matching age category',
            details: age !== null
                ? `Athlete age (${age}) doesn't match any category in the active ruleset`
                : 'Invalid birth date',
        });
    }

    return conflicts;
}

/**
 * Validate weight class eligibility
 */
function validateWeightClass(athlete: Athlete): EligibilityConflict[] {
    const conflicts: EligibilityConflict[] = [];

    if (athlete.weight <= 0) {
        return conflicts; // No weight data, skip validation
    }

    const weightClass = calculateWeightClass(athlete.gender, athlete.weight);

    if (weightClass === 'Unclassified') {
        conflicts.push({
            athleteId: athlete.id!,
            type: 'weight',
            severity: 'error',
            message: 'Weight class unclassified',
            details: `Weight (${athlete.weight}kg) doesn't fit any standard weight class`,
        });
        return conflicts;
    }

    // Check if weight exceeds the class limit
    if (weightClass.startsWith('+')) {
        // For +100kg or +78kg, weight should be greater than threshold (already validated above)
        // No upper limit, so no conflicts possible
        return conflicts;
    } else {
        // For -60kg, -66kg, etc., only warn if weight EXCEEDS the limit
        const limit = parseInt(weightClass.substring(1).replace('kg', ''));

        if (athlete.weight > limit) {
            // Weight exceeds the class limit - this is a problem
            conflicts.push({
                athleteId: athlete.id!,
                type: 'weight',
                severity: 'error',
                message: 'Weight exceeds class limit',
                details: `Current weight (${athlete.weight}kg) exceeds ${weightClass} limit by ${(athlete.weight - limit).toFixed(1)}kg`,
            });
        }
        // Note: No warning for being under the limit - athletes can compete at lighter weights
    }

    return conflicts;
}

/**
 * Main validation function - validates all eligibility rules for an athlete
 */
export function validateEligibility(
    athlete: Athlete,
    ruleset: Ruleset,
    referenceYear: number
): EligibilityConflict[] {
    if (!athlete.id) return [];

    const conflicts: EligibilityConflict[] = [];

    // Validate age category
    conflicts.push(...validateAgeCategory(athlete, ruleset, referenceYear));

    // Validate weight class
    conflicts.push(...validateWeightClass(athlete));

    return conflicts;
}
