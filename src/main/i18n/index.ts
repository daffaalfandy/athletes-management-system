import * as fs from 'fs';
import * as path from 'path';

type Locale = 'en' | 'id';

interface Translations {
    [key: string]: string | Translations;
}

// Translation dictionaries loaded from JSON files
let translations: Record<Locale, Translations> = {
    en: {},
    id: {}
};

/**
 * Load translation files synchronously at module initialization
 */
function loadTranslations() {
    try {
        const enPath = path.join(__dirname, 'locales', 'en.json');
        const idPath = path.join(__dirname, 'locales', 'id.json');

        translations.en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
        translations.id = JSON.parse(fs.readFileSync(idPath, 'utf-8'));
    } catch (error) {
        console.error('[Main i18n] Failed to load translation files:', error);
        // Fallback to empty objects if loading fails
        translations = { en: {}, id: {} };
    }
}

// Load translations when module is imported
loadTranslations();

/**
 * Get nested translation value from object using dot notation key
 */
function getNestedValue(obj: Translations, path: string): string | undefined {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Translation function for main process
 * @param key Translation key in dot notation
 * @param locale Current locale
 * @param params Optional parameters for interpolation
 * @returns Translated string with fallback to English
 */
export function t(
    key: string,
    locale: Locale,
    params?: Record<string, string | number>
): string {
    // Try to get translation in current locale
    let translation = getNestedValue(translations[locale], key);

    // Fallback to English if not found
    if (!translation && locale !== 'en') {
        translation = getNestedValue(translations.en, key);
        console.warn(`[Main i18n] Missing translation for key "${key}" in locale "${locale}", using English fallback`);
    }

    // If still not found, return the key itself
    if (!translation) {
        console.error(`[Main i18n] Missing translation for key "${key}" in all locales`);
        return key;
    }

    // Simple parameter interpolation
    if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
            translation = translation!.replace(`{${paramKey}}`, String(value));
        });
    }

    return translation;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: Locale): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    const localeCode = locale === 'id' ? 'id-ID' : 'en-US';

    return new Intl.DateTimeFormat(localeCode, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(dateObj);
}

/**
 * Format number according to locale
 */
export function formatNumber(
    num: number,
    locale: Locale,
    options?: Intl.NumberFormatOptions
): string {
    const localeCode = locale === 'id' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(localeCode, options).format(num);
}
