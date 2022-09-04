export enum tabs {
  Overview = 'horizontal-link-Overview',
  Details = 'horizontal-link-Details',
  Metrics = 'horizontal-link-Metrics',
  YAML = 'horizontal-link-YAML',
  Scheduling = 'horizontal-link-Scheduling',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Console = 'horizontal-link-Console',
  NetworkInterfaces = 'horizontal-link-Network interfaces',
  Disks = 'horizontal-link-Disks',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  Parameters = 'horizontal-link-Parameters',
}

export const navigateToTab = (tab: string) => {
  cy.byLegacyTestID(tab).should('be.visible');
  cy.byLegacyTestID(tab).click();
};

export const tab = {
  navigateToOverview: () => {
    navigateToTab(tabs.Overview);
  },
  navigateToDetails: () => {
    navigateToTab(tabs.Details);
  },
  navigateToMetrics: () => {
    navigateToTab(tabs.Metrics);
  },
  navigateToYAML: () => {
    navigateToTab(tabs.YAML);
  },
  navigateToScheduling: () => {
    navigateToTab(tabs.Scheduling);
  },
  navigateToEnvironment: () => {
    navigateToTab(tabs.Environment);
  },
  navigateToEvents: () => {
    navigateToTab(tabs.Events);
  },
  navigateToConsole: () => {
    navigateToTab(tabs.Console);
  },
  navigateToNetworks: () => {
    navigateToTab(tabs.NetworkInterfaces);
  },
  navigateToDisks: () => {
    navigateToTab(tabs.Disks);
  },
  navigateToScripts: () => {
    navigateToTab(tabs.Scripts);
  },
  navigateToSnapshots: () => {
    navigateToTab(tabs.Snapshots);
  },
  navigateToParameters: () => {
    navigateToTab(tabs.Parameters);
  },
};
