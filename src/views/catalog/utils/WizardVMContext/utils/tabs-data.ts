import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

export type TabsData = {
  overview?: {
    templateMetadata?: {
      name?: string;
      namespace?: string;
      displayName?: string;
      osType?: OS_NAME_TYPES;
    };
  };
  scripts?: {
    cloudInit: {
      sshKey?: string;
    };
    sysprep?: {
      autounattend?: string;
      unattended?: string;
    };
  };
};
