import { useSettingsStore } from '../features/settings/useSettingsStore';
import type { TranslationKey, Locale, Translations } from './types';
import en from './locales/en.json';
import id from './locales/id.json';

// Translation dictionaries
const translations: Record<Locale, Translations> = {
    en,
    id
};

/**
 * Get nested translation value from object using dot notation key
 * @param obj Translation object
 * @param path Dot notation path (e.g., 'nav.dashboard')
 * @returns Translation string or undefined
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
 * Translation function
 * @param key Translation key in dot notation
 * @param locale Current locale
 * @param params Optional parameters for interpolation
 * @returns Translated string with fallback to English
 */
export function translate(
    key: TranslationKey,
    locale: Locale,
    params?: Record<string, string | number>
): string {
    // Try to get translation in current locale
    let translation = getNestedValue(translations[locale], key);

    // Fallback to English if not found
    if (!translation && locale !== 'en') {
        translation = getNestedValue(translations.en, key);
        console.warn(`[i18n] Missing translation for key "${key}" in locale "${locale}", using English fallback`);
    }

    // If still not found, return the key itself
    if (!translation) {
        console.error(`[i18n] Missing translation for key "${key}" in all locales`);
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
 * @param date Date to format
 * @param locale Current locale
 * @returns Formatted date string
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
 * @param num Number to format
 * @param locale Current locale
 * @param options Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
    num: number,
    locale: Locale,
    options?: Intl.NumberFormatOptions
): string {
    const localeCode = locale === 'id' ? 'id-ID' : 'en-US';

    return new Intl.NumberFormat(localeCode, options).format(num);
}

/**
 * Custom hook for translations
 * @returns Translation utilities
 */
export function useTranslation() {
    const language = useSettingsStore((state) => state.language);

    // Fallback to 'en' if language is not set yet
    const locale: Locale = (language as Locale) || 'en';

    const t = (key: TranslationKey, params?: Record<string, string | number>) => {
        return translate(key, locale, params);
    };

    const fd = (date: Date | string) => {
        return formatDate(date, locale);
    };

    const fn = (num: number, options?: Intl.NumberFormatOptions) => {
        return formatNumber(num, locale, options);
    };

    return {
        t,
        formatDate: fd,
        formatNumber: fn,
        language: locale
    };
}
