/**
 * Internationalization (i18n) Configuration
 * Supported locales and fallback translations
 */

const locales = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
    direction: 'ltr',
  },
  es: {
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español',
    direction: 'ltr',
  },
  fr: {
    name: 'French',
    flag: '🇫🇷',
    nativeName: 'Français',
    direction: 'ltr',
  },
  pt: {
    name: 'Portuguese',
    flag: '🇵🇹',
    nativeName: 'Português',
    direction: 'ltr',
  },
  sn: {
    name: 'Shona',
    flag: '🇿🇼',
    nativeName: 'Shona',
    direction: 'ltr',
  },
  nd: {
    name: 'Ndebele',
    flag: '🇿🇼',
    nativeName: 'Ndebele',
    direction: 'ltr',
  },
  zu: {
    name: 'Zulu',
    flag: '🇿🇦',
    nativeName: 'Zulu',
    direction: 'ltr',
  },
  sw: {
    name: 'Swahili',
    flag: '🇰🇪',
    nativeName: 'Kiswahili',
    direction: 'ltr',
  },
  de: {
    name: 'German',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
    direction: 'ltr',
  },
  ar: {
    name: 'Arabic',
    flag: '🇸🇦',
    nativeName: 'العربية',
    direction: 'rtl',
  },
};

const defaultLocale = 'en';
const supportedLocales = Object.keys(locales);

module.exports = {
  locales,
  defaultLocale,
  supportedLocales,
};
