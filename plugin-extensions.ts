import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { HrefNavItem, ModelFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as MulticlusterExtensions } from './src/multicluster/extensions';
import { extensions as VirtualizationPerspectiveExtensions } from './src/perspective/extensions';
import { extensions as YamlTemplatesExtensions } from './src/templates/extensions';
import { extensions as utilsExtensions } from './src/utils/extension';
import { extensions as BootableVolumesExtensions } from './src/views/bootablevolumes/extensions';
import { extensions as CatalogExtensions } from './src/views/catalog/extensions';
import { extensions as CDIUploadProviderExtensions } from './src/views/cdi-upload-provider/extensions';
import { extensions as CheckupsExtensions } from './src/views/checkups/extensions';
import { extensions as ClusterOverviewExtensions } from './src/views/clusteroverview/extensions';
import { extensions as dashboardExtensionsExtensions } from './src/views/dashboard-extensions/extensions';
import { extensions as DataSourcesExtensions } from './src/views/datasources/extensions';
import { extensions as InstanceTypesExtensions } from './src/views/instancetypes/extensions';
import { extensions as MigrationPoliciesExtensions } from './src/views/migrationpolicies/extensions';
import { extensions as VirtualizationSectionExtensions } from './src/views/navigation/virtualizationSection';
import { extensions as PreferencesExtensions } from './src/views/preferences/extensions';
import { extensions as QuotasExtensions } from './src/views/quotas/extensions';
import { extensions as SettingsExtensions } from './src/views/settings/extensions';
import { extensions as StorageClassExtensions } from './src/views/storageclasses/extensions';
import { extensions as StorageMigrationExtensions } from './src/views/storagemigrations/extensions';
import { extensions as TemplatesExtensions } from './src/views/templates/extensions';
import { extensions as TopologyExtensions } from './src/views/topology/extensions';
import { extensions as VirtualMachineInstanceMigrationsExtensions } from './src/views/virtualmachineinstancemigrations/extensions';
import { extensions as VMWizardExtensions } from './src/views/virtualmachines/creation-wizard/extensions';
import { extensions as VirtualMachinesExtensions } from './src/views/virtualmachines/extensions';
import { extensions as VirtualMachinesInstanceExtensions } from './src/views/virtualmachinesinstance/extensions';
import { extensions as VMNetworksExtensions } from './src/views/vmnetworks/extensions';

const extensions: EncodedExtension[] = [
  ...VirtualizationPerspectiveExtensions,
  ...VirtualizationSectionExtensions,
  ...utilsExtensions,
  ...dashboardExtensionsExtensions,
  ...CDIUploadProviderExtensions,
  ...TopologyExtensions,
  ...MulticlusterExtensions,
  ...VirtualMachineInstanceMigrationsExtensions,
  ...StorageClassExtensions,
  ...StorageMigrationExtensions,
  ...ClusterOverviewExtensions,
  ...CatalogExtensions,
  ...VirtualMachinesExtensions,
  ...TemplatesExtensions,
  ...BootableVolumesExtensions,
  ...InstanceTypesExtensions,
  ...VMNetworksExtensions,
  ...MigrationPoliciesExtensions,
  ...QuotasExtensions,
  ...CheckupsExtensions,
  ...SettingsExtensions,
  ...PreferencesExtensions,
  ...DataSourcesExtensions,
  ...VirtualMachinesInstanceExtensions,
  ...YamlTemplatesExtensions,
  ...VMWizardExtensions,

  {
    properties: {
      flag: 'KUBEVIRT_CDI',
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'CDIConfig',
        version: 'v1beta1',
      },
    },
    type: 'console.flag/model',
  } as EncodedExtension<ModelFeatureFlag>,
  {
    properties: {
      flag: 'CONSOLE_CLI_DOWNLOAD',
      model: {
        group: 'console.openshift.io',
        kind: 'ConsoleCLIDownload',
        version: 'v1',
      },
    },
    type: 'console.flag/model',
  } as EncodedExtension<ModelFeatureFlag>,

  // Hardware Devices (compute section, not virtualization)
  {
    flags: {
      required: ['KUBEVIRT_VIRTUALIZATION_NAV'],
    },
    properties: {
      href: '/hardwaredevices',
      id: 'hardwaredevices',
      insertBefore: 'baremetalhosts',
      name: '%plugin__kubevirt-plugin~Hardware Devices%',
      section: 'compute',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];

export default extensions;
