import { calculateAgeCategory } from '../calculateAgeCategory';
import { AgeCategory } from '../../schemas';

describe('calculateAgeCategory', () => {
    const categories: AgeCategory[] = [
        { name: 'U-15 Cadets (M)', min_age: 13, max_age: 14, gender: 'M' },
        { name: 'U-15 Cadets (F)', min_age: 13, max_age: 14, gender: 'F' },
        { name: 'U-18 Cadets (M)', min_age: 15, max_age: 17, gender: 'M' },
        { name: 'U-18 Cadets (F)', min_age: 15, max_age: 17, gender: 'F' },
        { name: 'U-21 Juniors (M)', min_age: 18, max_age: 20, gender: 'M' },
        { name: 'Seniors (M)', min_age: 21, max_age: 125, gender: 'M' },
        { name: 'Seniors (F)', min_age: 21, max_age: 125, gender: 'F' },
        { name: 'Open (MIXED)', min_age: 18, max_age: 125, gender: 'MIXED' },
    ];

    test('matches exact gender for male based on age in reference year', () => {
        // Born 2010, in 2025 = 15 years old → U-18 Cadets (15-17)
        expect(calculateAgeCategory('2010-05-15', 'male', categories, 2025)).toBe('U-18 Cadets (M)');
        // Born 2008, in 2025 = 17 years old → U-18 Cadets (15-17)
        expect(calculateAgeCategory('2008-01-01', 'male', categories, 2025)).toBe('U-18 Cadets (M)');
        // Born 2004, in 2025 = 21 years old → Seniors (21+)
        expect(calculateAgeCategory('2004-12-31', 'male', categories, 2025)).toBe('Seniors (M)');
    });

    test('matches exact gender for female based on age in reference year', () => {
        // Born 2011, in 2025 = 14 years old → U-15 Cadets (13-14)
        expect(calculateAgeCategory('2011-12-31', 'female', categories, 2025)).toBe('U-15 Cadets (F)');
        // Born 2007, in 2025 = 18 years old → U-21 Juniors would be M only, so falls to Seniors (F)
        expect(calculateAgeCategory('2007-06-20', 'female', categories, 2025)).toBe('Seniors (F)');
    });

    test('falls back to MIXED gender if no exact match', () => {
        // Born 2007, in 2025 = 18 years old, no U-21 for female → Open (MIXED)
        expect(calculateAgeCategory('2007-10-10', 'female', categories, 2025)).toBe('Open (MIXED)');
    });

    test('prioritizes exact gender over MIXED', () => {
        // Born 2004, in 2025 = 21 years old
        // Matches both Seniors (M) and Open (MIXED)
        // Should pick Seniors (M) for male
        expect(calculateAgeCategory('2004-01-01', 'male', categories, 2025)).toBe('Seniors (M)');
        // Should pick Seniors (F) for female
        expect(calculateAgeCategory('2004-01-01', 'female', categories, 2025)).toBe('Seniors (F)');
    });

    test('returns Unclassified if no match found', () => {
        // Born 2015, in 2025 = 10 years old (too young)
        expect(calculateAgeCategory('2015-01-01', 'male', categories, 2025)).toBe('Unclassified');
    });

    test('handles edge cases', () => {
        expect(calculateAgeCategory(undefined, 'male', categories, 2025)).toBe('Unclassified');
        expect(calculateAgeCategory('', 'male', categories, 2025)).toBe('Unclassified');
        expect(calculateAgeCategory('invalid', 'male', categories, 2025)).toBe('Unclassified');
        expect(calculateAgeCategory('2010-05-15', 'male', [], 2025)).toBe('Unclassified');
    });

    test('respects referenceYear for age calculation', () => {
        // Born 2008
        // In 2025: age 17 → U-18 Cadets (15-17)
        expect(calculateAgeCategory('2008-05-15', 'male', categories, 2025)).toBe('U-18 Cadets (M)');
        // In 2026: age 18 → U-21 Juniors (18-20)
        expect(calculateAgeCategory('2008-05-15', 'male', categories, 2026)).toBe('U-21 Juniors (M)');
        // In 2029: age 21 → Seniors (21+)
        expect(calculateAgeCategory('2008-05-15', 'male', categories, 2029)).toBe('Seniors (M)');
    });
});
