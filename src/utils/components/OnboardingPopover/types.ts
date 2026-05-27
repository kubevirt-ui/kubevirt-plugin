export enum OnboardingPopoverKey {
  Catalog = 'catalog',
  CreateNamespace = 'createNamespace',
  NavCollapse = 'navCollapse',
  VMsTab = 'vmsTab',
}

export type OnboardingPopoversHidden = Record<OnboardingPopoverKey, boolean>;
