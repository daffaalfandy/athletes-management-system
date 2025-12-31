import { AgeCategory } from '../schemas';

/**
 * Calculates the age category for an athlete based on their birth date, gender, 
 * and a list of available categories for a reference year.
 * 
 * Age is calculated as of January 1st of the reference year (standard for most sports federations).
 * 
 * @param birthDate Athlete's birth date in YYYY-MM-DD format
 * @param gender Athlete's gender ('male' | 'female')
 * @param categories List of AgeCategory objects from the ruleset
 * @param referenceYear Year to calculate age category for (defaults to current year)
 * @returns The name of the matching age category or "Unclassified"
 */
export function calculateAgeCategory(
    birthDate: string | undefined,
    gender: 'male' | 'female',
    categories: AgeCategory[],
    referenceYear: number = new Date().getFullYear()
): string {
    if (!birthDate) return 'Unclassified';

    const birthYear = parseInt(birthDate.split('-')[0], 10);
    if (isNaN(birthYear)) return 'Unclassified';

    if (!categories || categories.length === 0) return 'Unclassified';

    // Calculate age as of January 1st of the reference year
    // This is the standard cutoff date used by most sports federations (IJF, etc.)
    const ageOnCutoff = referenceYear - birthYear;

    // Priority 1: Exact Gender Match
    const exactMatch = categories.find(cat =>
        ageOnCutoff >= cat.min_age &&
        ageOnCutoff <= cat.max_age &&
        cat.gender === (gender === 'male' ? 'M' : 'F')
    );

    if (exactMatch) {
        return exactMatch.name;
    }

    // Priority 2: MIXED Gender Match
    const mixedMatch = categories.find(cat =>
        ageOnCutoff >= cat.min_age &&
        ageOnCutoff <= cat.max_age &&
        cat.gender === 'MIXED'
    );

    if (mixedMatch) {
        return mixedMatch.name;
    }

    return 'Unclassified';
}
