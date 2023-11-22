export const tabList = '.pf-c-tabs__list > li';

export enum tabs {
  Configuration = 'horizontal-link-Configuration',
  Console = 'horizontal-link-Console',
  Details = 'horizontal-link-Details',
  Diagnostics = 'horizontal-link-Diagnostics',
  Disks = 'horizontal-link-Disks',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Metrics = 'horizontal-link-Metrics',
  NetworkInterfaces = 'horizontal-link-Network interfaces',
  Overview = 'horizontal-link-Overview',
  Parameters = 'horizontal-link-Parameters',
  Scheduling = 'horizontal-link-Scheduling',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  YAML = 'horizontal-link-YAML',
}

export const navigateToTab = (tab: string) => {
  cy.byLegacyTestID(tab).should('be.visible');
  cy.byLegacyTestID(tab).click();
};

export const tab = {
  navigateToConfiguration: () => {
    navigateToTab(tabs.Configuration);
  },
  navigateToConsole: () => {
    navigateToTab(tabs.Console);
  },
  navigateToDetails: () => {
    navigateToTab(tabs.Details);
  },
  navigateToDiagnostics: () => {
    navigateToTab(tabs.Diagnostics);
  },
  navigateToDisks: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(0).click();
  },
  navigateToEnvironment: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(3).click();
  },
  navigateToEvents: () => {
    navigateToTab(tabs.Events);
  },
  navigateToMetrics: () => {
    navigateToTab(tabs.Metrics);
  },
  navigateToNetworks: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(1).click();
  },
  navigateToOverview: () => {
    navigateToTab(tabs.Overview);
  },
  navigateToParameters: () => {
    navigateToTab(tabs.Parameters);
  },
  navigateToScheduling: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(2).click();
  },
  navigateToScripts: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(4).click();
  },
  navigateToSnapshots: () => {
    navigateToTab(tabs.Snapshots);
  },
  navigateToTDisks: () => {
    navigateToTab(tabs.Disks);
  },
  navigateToTNetworks: () => {
    navigateToTab(tabs.NetworkInterfaces);
  },
  // navigate template's tabs
  navigateToTScheduling: () => {
    navigateToTab(tabs.Scheduling);
  },
  navigateToTScripts: () => {
    navigateToTab(tabs.Scripts);
  },
  navigateToYAML: () => {
    navigateToTab(tabs.YAML);
  },
};
