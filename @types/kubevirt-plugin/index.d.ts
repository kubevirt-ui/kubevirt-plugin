import type { ConsoleUserSettingsLocation } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';

import './i18next';
import './react';

declare global {
  interface Window {
    SERVER_FLAGS: {
      authDisabled: boolean;
      branding: string;
      nodeArchitectures?: string[];
      userSettingsLocation?: ConsoleUserSettingsLocation;
    };
  }
}
