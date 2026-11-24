import type { ConsoleUserSettingsLocation } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';

import './i18next';

type ConsoleBranding = 'azure' | 'dedicated' | 'ocp' | 'okd' | 'online' | 'openshift' | 'rosa';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation requires interface
  interface Window {
    SERVER_FLAGS: {
      authDisabled: boolean;
      branding: ConsoleBranding;
      nodeArchitectures?: string[];
      userSettingsLocation?: ConsoleUserSettingsLocation;
    };
  }

  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation requires interface
    interface ProcessEnv {
      OLS_API_BASE_URL?: string;
    }
  }
}
