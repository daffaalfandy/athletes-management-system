import type en from './locales/en.json';

// Generate type-safe translation keys from English JSON structure
type TranslationKeys = typeof en;

// Recursive type to extract all possible dot-notation paths
type RecursiveKeyOf<TObj extends object> = {
    [TKey in keyof TObj & string]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & string];

export type TranslationKey = RecursiveKeyOf<TranslationKeys>;

export type Locale = 'en' | 'id';

export interface Translations {
    [key: string]: string | Translations;
}
