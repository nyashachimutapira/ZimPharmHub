/**
 * Internationalization (i18n) Configuration
 * Supported locales and fallback translations
 */

const locales = {
  en: {
    name: 'English',
    flag: '/images/flags/logo.jpg',
    nativeName: 'English',
    direction: 'ltr',
  },
  es: {
    name: 'Spanish',
    flag: '/images/flags/job%20vacancies.jpg',
    nativeName: 'Español',
    direction: 'ltr',
  },
  fr: {
    name: 'French',
    flag: '/images/flags/products.jpg',
    nativeName: 'Français',
    direction: 'ltr',
  },
  pt: {
    name: 'Portuguese',
    flag: '/images/flags/profile.jpg',
    nativeName: 'Português',
    direction: 'ltr',
  },
  sn: {
    name: 'Shona',
    flag: '/images/flags/calendar.jpg',
    nativeName: 'Shona',
    direction: 'ltr',
  },
  nd: {
    name: 'Ndebele',
    flag: '/images/flags/community.webp',
    nativeName: 'Ndebele',
    direction: 'ltr',
  },
  zu: {
    name: 'Zulu',
    flag: '/images/flags/Resource%20Hub.jpg',
    nativeName: 'Zulu',
    direction: 'ltr',
  },
  sw: {
    name: 'Swahili',
    flag: '/images/flags/favicon.png',
    nativeName: 'Kiswahili',
    direction: 'ltr',
  },
  de: {
    name: 'German',
    flag: '/images/flags/logo.jpg',
    nativeName: 'Deutsch',
    direction: 'ltr',
  },
  ar: {
    name: 'Arabic',
    flag: '/images/flags/job%20vacancies.jpg',
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
