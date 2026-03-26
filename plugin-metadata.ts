import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { exposedModules as MulticlusterExposedModules } from './src/multicluster/extensions';
import { exposedModules as VirtualizationPerspectiveExposedModules } from './src/perspective/extensions';
import { exposedModules as YamlTemplatesExposedModules } from './src/templates/extensions';
import { exposedModules as utilsExposedModules } from './src/utils/extension';
import { exposedModules as BootableVolumesExposedModules } from './src/views/bootablevolumes/extensions';
import { exposedModules as CatalogExposedModules } from './src/views/catalog/extensions';
import { exposedModules as CDIUploadProviderExposedModules } from './src/views/cdi-upload-provider/extensions';
import { exposedModules as CheckupsExposedModules } from './src/views/checkups/extensions';
import { exposedModules as ClusterOverviewExposedModules } from './src/views/clusteroverview/extensions';
import { exposedModules as dashboardExtensionsExposedModules } from './src/views/dashboard-extensions/extensions';
import { exposedModules as DataSourcesExposedModules } from './src/views/datasources/extensions';
import { exposedModules as InstanceTypesExposedModules } from './src/views/instancetypes/extensions';
import { exposedModules as MigrationPoliciesExposedModules } from './src/views/migrationpolicies/extensions';
import { exposedModules as PreferencesExposedModules } from './src/views/preferences/extensions';
import { exposedModules as QuotasExposedModules } from './src/views/quotas/extensions';
import { exposedModules as SettingsExposedModules } from './src/views/settings/extensions';
import { exposedModules as StorageClassExposedModules } from './src/views/storageclasses/extensions';
import { exposedModules as StorageMigrationExposedModules } from './src/views/storagemigrations/extensions';
import { exposedModules as TemplatesExposedModules } from './src/views/templates/extensions';
import { exposedModules as TopologyExposedModules } from './src/views/topology/extensions';
import { exposedModules as VirtualMachineInstanceMigrationsExposedModules } from './src/views/virtualmachineinstancemigrations/extensions';
import { exposedModules as VirtualMachinesExposedModules } from './src/views/virtualmachines/extensions';
import { exposedModules as VirtualMachinesInstanceExposedModules } from './src/views/virtualmachinesinstance/extensions';
import { exposedModules as VMNetworksExposedModules } from './src/views/vmnetworks/extensions';

const metadata: ConsolePluginBuildMetadata = {
  dependencies: {
    '@console/pluginAPI': '>=4.17.0-0',
  },
  displayName: 'Kubevirt Plugin',
  exposedModules: {
    ...VirtualizationPerspectiveExposedModules,
    ...utilsExposedModules,
    ...dashboardExtensionsExposedModules,
    ...CDIUploadProviderExposedModules,
    ...TopologyExposedModules,
    ...MulticlusterExposedModules,
    ...VirtualMachineInstanceMigrationsExposedModules,
    ...StorageClassExposedModules,
    ...StorageMigrationExposedModules,
    ...VMNetworksExposedModules,
    ...ClusterOverviewExposedModules,
    ...CatalogExposedModules,
    ...VirtualMachinesExposedModules,
    ...TemplatesExposedModules,
    ...BootableVolumesExposedModules,
    ...InstanceTypesExposedModules,
    ...PreferencesExposedModules,
    ...MigrationPoliciesExposedModules,
    ...QuotasExposedModules,
    ...CheckupsExposedModules,
    ...SettingsExposedModules,
    ...DataSourcesExposedModules,
    ...VirtualMachinesInstanceExposedModules,
    ...YamlTemplatesExposedModules,
  },
  name: 'kubevirt-plugin',
  version: '4.22.0',
};

export default metadata;
