import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { exposedModules as MulticlusterExposedModules } from './src/multicluster/extensions';
import { exposedModules as VirtualizationPerspectiveExposedModules } from './src/perspective/extensions';
import { exposedModules as utilsExposedModules } from './src/utils/extension';
import { exposedModules as CDIUploadProviderExposedModules } from './src/views/cdi-upload-provider/extensions';
import { exposedModules as CheckupsExposedModules } from './src/views/checkups/extensions';
import { exposedModules as dashboardExtensionsExposedModules } from './src/views/dashboard-extensions/extensions';
import { exposedModules as StorageMigrationExposedModules } from './src/views/storagemigrations/extensions';
import { exposedModules as TopologyExposedModules } from './src/views/topology/extensions';
import { exposedModules as VirtualMachinesExposedModules } from './src/views/virtualmachines/extensions';

const metadata: ConsolePluginBuildMetadata = {
  dependencies: {
    '@console/pluginAPI': '>=4.17.0-0',
  },
  displayName: 'Kubevirt Plugin',
  exposedModules: {
    ...CheckupsExposedModules,
    ...VirtualizationPerspectiveExposedModules,
    ...dashboardExtensionsExposedModules,
    ...utilsExposedModules,
    ...VirtualMachinesExposedModules,
    ...CDIUploadProviderExposedModules,
    ...StorageMigrationExposedModules,
    ...TopologyExposedModules,
    ...MulticlusterExposedModules,
    BootableVolumesList: './views/bootablevolumes/list/BootableVolumesList.tsx',
    Catalog: './views/catalog/Catalog.tsx',
    ClusterOverviewPage: './views/clusteroverview/ClusterOverviewPage.tsx',
    DataImportCronPage: './views/datasources/dataimportcron/details/DataImportCronPage.tsx',
    DataSourcePage: './views/datasources/details/DataSourcePage.tsx',
    DataSourcesList: './views/datasources/list/DataSourcesList.tsx',
    InstanceTypePage: './views/instancetypes/list/InstanceTypePage.tsx',
    MigrationPoliciesList: './views/migrationpolicies/list/MigrationPoliciesList.tsx',
    MigrationPolicyCreateForm:
      './views/migrationpolicies/list/components/MigrationPolicyCreateForm/MigrationPolicyCreateForm.tsx',
    MigrationPolicyPage: './views/migrationpolicies/details/MigrationPolicyDetailsNav.tsx',
    PreferencePage: './views/preferences/list/PreferencePage.tsx',
    TemplateNavPage: './views/templates/details/TemplateNavPage.tsx',
    useVirtualMachineInstanceActionsProvider:
      './views/virtualmachinesinstance/actions/hooks/useVirtualMachineInstanceActionsProvider.tsx',
    VirtualMachinesInstancePage:
      './views/virtualmachinesinstance/details/VirtualMachinesInstancePage.tsx',
    VirtualMachinesInstancesList:
      './views/virtualmachinesinstance/list/VirtualMachinesInstancesList.tsx',
    VirtualMachineTemplatesList: './views/templates/list/VirtualMachineTemplatesList.tsx',
    yamlTemplates: 'src/templates/index.ts',
  },
  name: 'kubevirt-plugin',
  version: '4.19.0',
};

export default metadata;
