import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

export const supportedLanguages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
];

export const defaultLanguage = 'pt-BR';

export const i18nConfig = {
  supportedLngs: supportedLanguages.map(lang => lang.code),
  fallbackLng: defaultLanguage,
  defaultNS: 'common',
  ns: ['common', 'dashboard', 'modules', 'settings', 'auth'],
  
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'optilog-language',
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
  },

  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value: any, format?: string) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'capitalize') {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
    },
  },

  pluralSeparator: '_',
  contextSeparator: '_',

  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    hashTransKey: (defaultValue: string) => defaultValue,
    omitBoundRessources: false,
  },
};

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;