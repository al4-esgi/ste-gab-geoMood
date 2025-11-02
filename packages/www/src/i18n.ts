import { createI18n } from 'vue-i18n';
import { Language } from '@/vars/LanguageAttr';
import { COMMON_MESSAGES } from './locales/common';
import { API_ERRORS } from './locales/api-errors';

const fallbackLocale = Language.FR;
const locales = [Language.FR];

function checkLocaleValidity(locale?: Language) {
    return locale && locales.includes(locale) ? locale : undefined;
}

function findNavigatorLanguage(): Language | undefined {
    const browserLocales = navigator.languages || [navigator.language];
    for (const locale of browserLocales) {
        const languageCode = locale.split('-')[0].toLowerCase();
        const matchedLocale = Object.values(Language).find(
            (l) => l.toLowerCase() === languageCode,
        );
        if (matchedLocale) {
            return matchedLocale as Language;
        }
    }
    return undefined;
}

export const defaultLocale = () => {
    const browserLocale = checkLocaleValidity(findNavigatorLanguage());
    return browserLocale || fallbackLocale;
};

const messages = {
    [Language.FR]: {
        ...COMMON_MESSAGES.fr,
        api_errors: API_ERRORS.fr,
    },
};

const i18n = createI18n({
    legacy: false,
    locale: defaultLocale(),
    fallbackLocale,
    messages,
});

export default i18n;
