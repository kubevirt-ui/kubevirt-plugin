import './i18next';
import './react';

declare global {
  interface Window {
    SERVER_FLAGS: {
      authDisabled: boolean;
      branding: string;
      nodeArchitectures?: string[];
    };
  }
}
