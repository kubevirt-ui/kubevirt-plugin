import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

const metadata: ConsolePluginBuildMetadata = {
  name: 'kubevirt-plugin',
  version: '0.0.0',
  displayName: 'Kubevirt Plugin',
  dependencies: {
    '@console/pluginAPI': '*',
  },
  exposedModules: {
    BootableVolumesList: './views/bootablevolumes/list/BootableVolumesList.tsx',
    Catalog: './views/catalog/Catalog.tsx',
    Checkups: './views/checkups/Checkups.tsx',
    CheckupsNetworkDetailsPage: './views/checkups/network/details/CheckupsNetworkDetailsPage.tsx',
    CheckupsNetworkForm: './views/checkups/network/components/form/CheckupsNetworkForm.tsx',
    CheckupsStorageDetailsPage: './views/checkups/storage/details/CheckupsStorageDetailsPage.tsx',
    CheckupsStorageForm: './views/checkups/storage/components/form/CheckupsStorageForm.tsx',
    ClusterOverviewPage: './views/clusteroverview/ClusterOverviewPage.tsx',
    ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
    contextProvider: 'src/views/cdi-upload-provider/utils/context.tsx',
    dashboardActivity: 'src/views/dashboard-extensions/Activity.tsx',
    dashboardActivityUtils: 'src/views/dashboard-extensions/utils.ts',
    dashboardExtensions: './utils/extensions/dashboard/index.ts',
    dashboardInventory: 'src/views/dashboard-extensions/Inventory.tsx',
    dashboardStatus: 'src/views/dashboard-extensions/KubevirtHealthPopup/KubevirtHealthPopup.tsx',
    DataImportCronPage: './views/datasources/dataimportcron/details/DataImportCronPage.tsx',
    DataSourcePage: './views/datasources/details/DataSourcePage.tsx',
    DataSourcesList: './views/datasources/list/DataSourcesList.tsx',
    HardwareDevicesPage: './utils/components/HardwareDevices/HardwareDevicesPage.tsx',
    icons: './utils/icons.tsx',
    InstanceTypePage: './views/instancetypes/list/InstanceTypePage.tsx',
    kubevirtFlags: './utils/flags',
    LogsStandAlone:
      './views/virtualmachines/details/tabs/diagnostic/VirtualMachineLogViewer/VirtualMachineLogViewerStandAlone/VirtualMachineLogViewerStandAlone.tsx',
    MigrationPoliciesList: './views/migrationpolicies/list/MigrationPoliciesList.tsx',
    MigrationPolicyCreateForm:
      './views/migrationpolicies/list/components/MigrationPolicyCreateForm/MigrationPolicyCreateForm.tsx',
    MigrationPolicyPage: './views/migrationpolicies/details/MigrationPolicyDetailsNav.tsx',
    modalProvider: './utils/components/ModalProvider/ModalProvider.tsx',
    PreferencePage: './views/preferences/list/PreferencePage.tsx',
    pvcAlert: 'src/views/cdi-upload-provider/PVCAlertExtension.tsx',
    pvcCloneStatus: 'src/views/cdi-upload-provider/upload-pvc-form/statuses/ClonePVCStatus.tsx',
    pvcDelete: 'src/views/cdi-upload-provider/PVCDeleteAlertExtension.tsx',
    pvcSelectors: 'src/views/cdi-upload-provider/utils/selectors.ts',
    pvcUploadStatus: 'src/views/cdi-upload-provider/popover/UploadPVCPopover.tsx',
    pvcUploadUtils: 'src/views/cdi-upload-provider/utils/utils.tsx',
    TemplateNavPage: './views/templates/details/TemplateNavPage.tsx',
    UploadPVC: 'src/views/cdi-upload-provider/upload-pvc-form/UploadPVC.tsx',
    useCDIUpload: 'src/views/cdi-upload-provider/hooks/useCDIUpload.tsx',
    useVirtualMachineActionsProvider:
      './views/virtualmachines/actions/hooks/useVirtualMachineActionsProvider.ts',
    useVirtualMachineInstanceActionsProvider:
      './views/virtualmachinesinstance/actions/hooks/useVirtualMachineInstanceActionsProvider.tsx',
    VirtualMachineNavPage: './views/virtualmachines/details/VirtualMachineNavPage.tsx',
    VirtualMachinesInstancePage:
      './views/virtualmachinesinstance/details/VirtualMachinesInstancePage.tsx',
    VirtualMachinesInstancesList:
      './views/virtualmachinesinstance/list/VirtualMachinesInstancesList.tsx',
    VirtualMachinesList: './views/virtualmachines/list/VirtualMachinesList.tsx',
    VirtualMachineTemplatesList: './views/templates/list/VirtualMachineTemplatesList.tsx',
    yamlTemplates: 'src/templates/index.ts',
  },
};

export default metadata;
