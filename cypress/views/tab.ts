export const tabList = '.pf-c-tabs__list > li';

export enum tabs {
  Overview = 'horizontal-link-Overview',
  Details = 'horizontal-link-Details',
  Metrics = 'horizontal-link-Metrics',
  YAML = 'horizontal-link-YAML',
  Configuration = 'horizontal-link-Configuration',
  Scheduling = 'horizontal-link-Scheduling',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Console = 'horizontal-link-Console',
  NetworkInterfaces = 'horizontal-link-Network interfaces',
  Disks = 'horizontal-link-Disks',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  Parameters = 'horizontal-link-Parameters',
  Diagnostic = 'horizontal-link-Diagnostic',
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
  navigateToConfiguration: () => {
    navigateToTab(tabs.Configuration);
  },
  navigateToScheduling: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(0).click();
  },
  navigateToEnvironment: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(1).click();
  },
  navigateToEvents: () => {
    navigateToTab(tabs.Events);
  },
  navigateToConsole: () => {
    navigateToTab(tabs.Console);
  },
  navigateToNetworks: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(2).click();
  },
  navigateToDisks: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(3).click();
  },
  navigateToScripts: () => {
    cy.byLegacyTestID(tabs.Configuration).click();
    cy.get(tabList).eq(4).click();
  },
  navigateToSnapshots: () => {
    navigateToTab(tabs.Snapshots);
  },
  navigateToParameters: () => {
    navigateToTab(tabs.Parameters);
  },
  navigateToDiagnostic: () => {
    navigateToTab(tabs.Diagnostic);
  },
  // navigate template's tabs
  navigateToTScheduling: () => {
    navigateToTab(tabs.Scheduling);
  },
  navigateToTNetworks: () => {
    navigateToTab(tabs.NetworkInterfaces);
  },
  navigateToTDisks: () => {
    navigateToTab(tabs.Disks);
  },
  navigateToTScripts: () => {
    navigateToTab(tabs.Scripts);
  },
};
