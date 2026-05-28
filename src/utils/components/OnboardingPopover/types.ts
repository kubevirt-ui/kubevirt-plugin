export enum OnboardingPopoverKey {
  Catalog = 'catalog',
  CreateProject = 'createProject',
  NavCollapse = 'navCollapse',
  VMsTab = 'vmsTab',
}

export type OnboardingPopoversHidden = Record<OnboardingPopoverKey, boolean>;
