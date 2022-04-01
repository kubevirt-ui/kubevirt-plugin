export type TabsData = {
  overview?: {
    templateMetadata?: {
      name?: string;
      namespace?: string;
      displayName?: string;
    };
  };
  scripts?: {
    sysprep?: {
      autounattend?: string;
      unattended?: string;
    };
  };
};
