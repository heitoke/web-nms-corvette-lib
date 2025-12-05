export const codes = [
    'en',
    'ru'
] as const;

export type CodeName = typeof codes[number];

export interface Language {
    name: string;
    emoji: string;
}

export const languages: Record<CodeName, Language> = {
    en: {
        name: 'English',
        emoji: '🇬🇧'
    },
    ru: {
        name: 'Русский',
        emoji: '🇷🇺'
    }
};