export const configurationSubTab = (tabName: string) =>
  `[data-test-id="vm-configuration-${tabName}"]`;
export const diagnosticsSubTab = (tabName: string) => `[data-test-id="vm-diagnostics-${tabName}"]`;
export const horizontalLink = (tabName: string) => `[data-test-id="horizontal-link-${tabName}"]`;

export enum tabName {
  Configuration = 'Configuration',
  Console = 'Console',
  Diagnostics = 'Diagnostics',
  Disks = 'Disks',
  Environment = 'Environment',
  Events = 'Events',
  Metadata = 'Metadata',
  Metrics = 'Metrics',
  Migrations = 'Migrations',
  NetworkInterfaces = 'Network interfaces',
  Overview = 'Overview',
  Parameters = 'Parameters',
  Scheduling = 'Scheduling',
  Scripts = 'Scripts',
  Settings = 'Settings',
  Snapshots = 'Snapshots',
  TopConsumers = 'Top consumers',
  YAML = 'YAML',
}

export enum subTabName {
  Details = 'details',
  GuestSystemLog = 'guest-system-log',
  InitialRun = 'initial',
  Metadata = 'metadata',
  Network = 'network',
  Scheduling = 'scheduling',
  SSH = 'ssh',
  StatusConditions = 'status-conditions',
  Storage = 'storage',
}

export const navigateToTab = (name: string) => {
  cy.get(horizontalLink(name), { timeout: 120000 }).should('be.visible');
  cy.get(horizontalLink(name)).click();
};

export const navigateToConfigurationSubTab = (name: string) => {
  navigateToTab(tabName.Configuration);
  cy.get(configurationSubTab(name)).should('be.visible');
  cy.get(configurationSubTab(name)).click();
};

export const navigateToDiagnosticsSubTab = (name: string) => {
  navigateToTab(tabName.Diagnostics);
  cy.get(diagnosticsSubTab(name)).should('be.visible');
  cy.get(diagnosticsSubTab(name)).click();
};

export const tab = {
  navigateToConfiguration: () => {
    navigateToTab(tabName.Configuration);
  },
  // VM configuration sub-tabs
  navigateToConfigurationDetails: () => {
    navigateToConfigurationSubTab(subTabName.Details);
  },
  navigateToConfigurationInitialRun: () => {
    navigateToConfigurationSubTab(subTabName.InitialRun);
  },
  navigateToConfigurationMetadata: () => {
    navigateToConfigurationSubTab(subTabName.Metadata);
  },
  navigateToConfigurationNetwork: () => {
    navigateToConfigurationSubTab(subTabName.Network);
  },
  navigateToConfigurationScheduling: () => {
    navigateToConfigurationSubTab(subTabName.Scheduling);
  },
  navigateToConfigurationSSH: () => {
    navigateToConfigurationSubTab(subTabName.SSH);
  },
  navigateToConfigurationStorage: () => {
    navigateToConfigurationSubTab(subTabName.Storage);
  },
  navigateToConsole: () => {
    navigateToTab(tabName.Console);
  },
  navigateToDiagnostics: () => {
    navigateToTab(tabName.Diagnostics);
  },
  // VM diagnostics sub-tabs
  navigateToDiagnosticsGuestSystemLog: () => {
    navigateToDiagnosticsSubTab(subTabName.GuestSystemLog);
  },
  navigateToDiagnosticsStatusConditions: () => {
    navigateToDiagnosticsSubTab(subTabName.StatusConditions);
  },
  navigateToDisks: () => {
    navigateToTab(tabName.Disks);
  },
  navigateToEnvironment: () => {
    navigateToTab(tabName.Environment);
  },
  navigateToEvents: () => {
    navigateToTab(tabName.Events);
  },
  navigateToMetadata: () => {
    navigateToTab(tabName.Metadata);
  },
  navigateToMetrics: () => {
    navigateToTab(tabName.Metrics);
  },
  navigateToMigrations: () => {
    navigateToTab(tabName.Migrations);
  },
  navigateToNetworks: () => {
    navigateToTab(tabName.NetworkInterfaces);
  },
  navigateToOverview: () => {
    navigateToTab(tabName.Overview);
  },
  // navigate template's tabs and vm creation tabs
  navigateToParameters: () => {
    navigateToTab(tabName.Parameters);
  },
  navigateToScheduling: () => {
    navigateToTab(tabName.Scheduling);
  },
  navigateToScripts: () => {
    navigateToTab(tabName.Scripts);
  },
  navigateToSettings: () => {
    navigateToTab(tabName.Settings);
  },
  navigateToSnapshots: () => {
    navigateToTab(tabName.Snapshots);
  },
  navigateToTDisks: () => {
    navigateToTab(tabName.Disks);
  },
  navigateToTEnvironment: () => {
    navigateToTab(tabName.Environment);
  },
  navigateToTMetadata: () => {
    navigateToTab(tabName.Metadata);
  },
  navigateToTNetworks: () => {
    navigateToTab(tabName.NetworkInterfaces);
  },
  navigateToTopConsumers: () => {
    navigateToTab(tabName.TopConsumers);
  },
  navigateToTScheduling: () => {
    navigateToTab(tabName.Scheduling);
  },
  navigateToTScripts: () => {
    navigateToTab(tabName.Scripts);
  },
  navigateToYAML: () => {
    navigateToTab(tabName.YAML);
  },
};
