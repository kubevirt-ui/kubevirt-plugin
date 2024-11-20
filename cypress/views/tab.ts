export enum vmTabs {
  Configuration = 'horizontal-link-Configuration',
  Console = 'horizontal-link-Console',
  Diagnostics = 'horizontal-link-Diagnostics',
  Disks = 'horizontal-link-Disks',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Metadata = 'horizontal-link-Metadata',
  Metrics = 'horizontal-link-Metrics',
  NetworkInterfaces = 'horizontal-link-Network interfaces',
  Overview = 'horizontal-link-Overview',
  Parameters = 'horizontal-link-Parameters',
  Scheduling = 'horizontal-link-Scheduling',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  YAML = 'horizontal-link-YAML',
}

export enum overviewTabs {
  Migrations = 'horizontal-link-Migrations',
  Settings = 'horizontal-link-Settings',
  // virt overview tabs
  TopConsumers = 'horizontal-link-Top consumers',
}

export const navigateToTab = (tab: string) => {
  cy.byLegacyTestID(tab).should('be.visible');
  cy.byLegacyTestID(tab).click();
};

export const tab = {
  navigateToConfiguration: () => {
    navigateToTab(vmTabs.Configuration);
  },
  navigateToConsole: () => {
    navigateToTab(vmTabs.Console);
  },
  // VM configuration sub-tabs
  navigateToDetails: () => {
    navigateToTab(vmTabs.Configuration);
    cy.byButtonText('Details').click();
  },
  navigateToDiagnostics: () => {
    navigateToTab(vmTabs.Diagnostics);
  },
  navigateToEvents: () => {
    navigateToTab(vmTabs.Events);
  },
  navigateToInitialRun: () => {
    navigateToTab(vmTabs.Configuration);
    cy.byButtonText('Initial run').click();
  },
  navigateToMetadata: () => {
    navigateToTab(vmTabs.Configuration);
    cy.byButtonText('Metadata').click();
  },
  navigateToMetrics: () => {
    navigateToTab(vmTabs.Metrics);
  },
  navigateToMigrations: () => {
    navigateToTab(overviewTabs.Migrations);
  },
  navigateToNetwork: () => {
    navigateToTab(vmTabs.Configuration);
    cy.contains('.pf-v5-c-tabs__item-text', 'Network').click();
  },
  // VM tabs
  navigateToOverview: () => {
    navigateToTab(vmTabs.Overview);
  },
  navigateToScheduling: () => {
    navigateToTab(vmTabs.Configuration);
    cy.byButtonText('Scheduling').click();
  },
  navigateToSettings: () => {
    navigateToTab(overviewTabs.Settings);
  },
  navigateToSnapshots: () => {
    navigateToTab(vmTabs.Snapshots);
  },
  navigateToSSH: () => {
    navigateToTab(vmTabs.Configuration);
    cy.byButtonText('SSH').click();
  },
  navigateToStorage: () => {
    navigateToTab(vmTabs.Configuration);
    cy.contains('.pf-v5-c-tabs__item-text', 'Storage').click();
  },
  // template's tabs and vm creation tabs
  navigateToTDisks: () => {
    navigateToTab(vmTabs.Disks);
  },
  navigateToTEnvironment: () => {
    navigateToTab(vmTabs.Environment);
  },
  navigateToTMetadata: () => {
    navigateToTab(vmTabs.Metadata);
  },
  navigateToTNetworks: () => {
    navigateToTab(vmTabs.NetworkInterfaces);
  },
  // virt overview tabs
  navigateToTopConsumers: () => {
    navigateToTab(overviewTabs.TopConsumers);
  },
  navigateToTParameters: () => {
    navigateToTab(vmTabs.Parameters);
  },
  navigateToTScheduling: () => {
    navigateToTab(vmTabs.Scheduling);
  },
  navigateToTScripts: () => {
    navigateToTab(vmTabs.Scripts);
  },
  navigateToYAML: () => {
    navigateToTab(vmTabs.YAML);
  },
};
