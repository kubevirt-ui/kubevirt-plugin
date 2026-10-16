import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../../locales/en/plugin__kubevirt-plugin.json';

const NAMESPACE = 'plugin__kubevirt-plugin';

let initialized = false;

export const initStoryI18n = (): void => {
  if (initialized || i18n.isInitialized) {
    return;
  }

  i18n.use(initReactI18next).init({
    defaultNS: NAMESPACE,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    lng: 'en',
    ns: [NAMESPACE],
    resources: {
      en: {
        [NAMESPACE]: en,
      },
    },
  });

  initialized = true;
};
