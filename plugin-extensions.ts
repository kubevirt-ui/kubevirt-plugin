import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';

import { extensions as MulticlusterExtensions } from './src/multicluster/extensions';
import { extensions as VirtualizationPerspectiveExtensions } from './src/perspective/extensions';
import { extensions as utilsExtensions } from './src/utils/extension';
import { extensions as CDIUploadProviderExtensions } from './src/views/cdi-upload-provider/extensions';
import { extensions as CheckupsExtensions } from './src/views/checkups/extensions';
import { extensions as dashboardExtensionsExtensions } from './src/views/dashboard-extensions/extensions';
import { extensions as PhysicalNetworksExtensions } from './src/views/physical-networks/extensions';
import { extensions as StorageClassExtensions } from './src/views/storageclasses/extensions';
import { extensions as StorageMigrationExtensions } from './src/views/storagemigrations/extensions';
import { extensions as TopologyExtensions } from './src/views/topology/extensions';
import { extensions as VirtualMachineInstanceMigrationsExtensions } from './src/views/virtualmachineinstancemigrations/extensions';
import { extensions as VirtualMachinesExtensions } from './src/views/virtualmachines/extensions';
import { extensions as VMNetworksExtensions } from './src/views/vmnetworks/extensions';

const extensions: EncodedExtension[] = [
  ...VirtualizationPerspectiveExtensions,
  ...CheckupsExtensions,
  ...dashboardExtensionsExtensions,
  ...utilsExtensions,
  ...VirtualMachinesExtensions,
  ...CDIUploadProviderExtensions,
  ...PhysicalNetworksExtensions,
  ...StorageClassExtensions,
  ...StorageMigrationExtensions,
  ...TopologyExtensions,
  ...MulticlusterExtensions,
  ...VirtualMachineInstanceMigrationsExtensions,
  ...VMNetworksExtensions,
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
  },
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
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
      id: 'virtualization',
      insertAfter: 'workloads',
      name: '%plugin__kubevirt-plugin~Virtualization%',
    },
    type: 'console.navigation/section',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-catalog',
        'data-test-id': 'virtualization-catalog-nav-item',
      },
      href: 'catalog',
      id: 'virtualization-catalog',
      insertBefore: 'virtualmachines',
      name: '%plugin__kubevirt-plugin~Catalog%',
      prefixNamespaced: true,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-templates',
        'data-test-id': 'templates-nav-item',
      },
      id: 'templates',
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Templates%',
      section: 'virtualization',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      component: { $codeRef: 'VirtualMachinesInstancesList' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: { $codeRef: 'VirtualMachineTemplatesList' },
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    flags: {
      required: ['KUBEVIRT_INSTANCETYPES'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachineclusterinstancetypes',
        'data-test-id': 'virtualmachineclusterinstancetypes-nav-item',
      },
      id: 'virtualmachineclusterinstancetypes',
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      section: 'virtualization',
    },
    type: 'console.navigation/resource-cluster',
  },
  {
    properties: {
      component: { $codeRef: 'InstanceTypePage' },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: {
        $codeRef: 'InstanceTypePage',
      },
      exact: true,
      path: [
        '/k8s/ns/:ns/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
        '/k8s/all-namespaces/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
      ],
      prefixNamespaced: true,
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: {
        $codeRef: 'PreferencePage',
      },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterPreference',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: {
        $codeRef: 'PreferencePage',
      },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachinePreference',
        version: 'v1beta1',
      },
      prefixNamespaced: true,
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: {
        $codeRef: 'Catalog',
      },
      path: ['/k8s/ns/:ns/catalog', '/k8s/all-namespaces/catalog'],
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: { $codeRef: 'DataSourcePage' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataSource',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  },
  {
    properties: {
      component: { $codeRef: 'VirtualMachinesInstancePage' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
    },
    type: 'console.page/resource/details',
  },
  {
    properties: {
      component: { $codeRef: 'TemplateNavPage' },
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
    },
    type: 'console.page/resource/details',
  },
  {
    properties: {
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useVirtualMachineInstanceActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  },
  {
    flags: {
      required: ['OPENSHIFT'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-overview',
        'data-test-id': 'virtualization-overview-nav-item',
      },
      href: 'virtualization-overview',
      id: 'overview',
      insertBefore: 'virtualization-catalog',
      name: '%plugin__kubevirt-plugin~Overview%',
      prefixNamespaced: true,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  },
  {
    properties: {
      component: {
        $codeRef: 'ClusterOverviewPage',
      },
      path: ['/k8s/ns/:ns/virtualization-overview', '/k8s/all-namespaces/virtualization-overview'],
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: {
        $codeRef: 'VirtualizationLandingPage',
      },
      path: ['/k8s/virtualization-landing'],
    },
    type: 'console.page/route',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVMYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVMTemplateYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataVolume',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultBootableVolumeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultMigrationPolicyYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineClusterInstancetypeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineInstancetype',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineInstancetypeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterPreference',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineClusterPreferenceYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  },
  {
    properties: {
      id: 'VirtualizationSeparator',
      insertAfter: 'virtualmachineclusterpreferences',
      insertBefore: 'virtualization-bootablevolumes',
      perspective: 'admin',
      section: 'virtualization',
      testID: 'VirtualizationSeparator',
    },
    type: 'console.navigation/separator',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test-id': 'bootablevolumes-nav-item',
      },
      href: 'bootablevolumes',
      id: 'virtualization-bootablevolumes',
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      prefixNamespaced: true,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  },
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumeYAMLPage',
      },
      path: ['/k8s/ns/:ns/bootablevolumes/~new'],
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumesList',
      },
      path: ['/k8s/ns/:ns/bootablevolumes', '/k8s/all-namespaces/bootablevolumes'],
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: { $codeRef: 'DataSourcesList' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataSource',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: { $codeRef: 'DataImportCronPage' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataImportCron',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test-id': 'migrationpolicies-nav-item',
      },
      id: 'migrationpolicies',
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      section: 'virtualization',
    },
    type: 'console.navigation/resource-cluster',
  },
  {
    properties: {
      component: { $codeRef: 'MigrationPoliciesList' },
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: { $codeRef: 'MigrationPolicyPage' },
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/details',
  },
  {
    properties: {
      href: 'hardwaredevices',
      id: 'hardwaredevices',
      insertBefore: 'baremetalhosts',
      name: '%plugin__kubevirt-plugin~Hardware Devices%',
      section: 'compute',
    },
    type: 'console.navigation/href',
  },
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyCreateForm',
      },
      path: '/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/form',
    },
    type: 'console.page/route',
  },
];

export default extensions;
