import type { ConsoleUserSettingsLocation } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';

import './i18next';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation requires interface
  interface Window {
    SERVER_FLAGS: {
      authDisabled: boolean;
      branding: string;
      nodeArchitectures?: string[];
      userSettingsLocation?: ConsoleUserSettingsLocation;
    };
  }
}
