import { ACMVirtualMachineAction } from '@kubevirt-extensions/acm.virtualmachine';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  HrefNavItem,
  RoutePage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceRoute } from '@stolostron/multicluster-sdk';

import { CROSS_CLUSTER_MIGRATION_ACTION_ID, KUBEVIRT_VM_PATH } from './constants';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  acmFlags: './multicluster/flags.ts',
  ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
  CrossClusterMigration:
    './multicluster/components/CrossClusterMigration/CrossClusterMigration.tsx',
  MulticlusterYAMLCreation:
    './multicluster/components/MulticlusterYAMLCreation/MulticlusterYAMLCreation.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
  urls: './multicluster/urls.ts',
  VirtualMachineSearchResults: './views/virtualmachines/search/VirtualMachineSearchResults.tsx',
};

const DATA_VOLUME_PATH = 'cdi.kubevirt.io~v1beta1~DataVolume';
const CLUSTER_INSTANCETYPE_PATH =
  'instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype';
const INSTANCETYPE_PATH = 'instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype';
const MIGRATION_POLICY_PATH = 'migrations.kubevirt.io~v1alpha1~MigrationPolicy';

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      icon: { $codeRef: 'perspective.icon' },
      id: 'fleet-virtualization-perspective',
      importRedirectURL: { $codeRef: 'perspective.getACMLandingPageURL' },
      landingPageURL: { $codeRef: 'perspective.getACMLandingPageURL' },
      name: '%plugin__console-virt-perspective-plugin~Fleet Virtualization%',
    },
    type: 'console.perspective',
  },
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualization-overview',
        'data-test-id': 'virtualization-overview-nav-item',
      },
      href: '/k8s/all-clusters/all-namespaces/virtualization-overview',
      id: 'overview-virt-perspective',
      insertBefore: 'virtualization-catalog-virt-perspective',
      name: '%plugin__kubevirt-plugin~Overview%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualization-catalog',
        'data-test-id': 'virtualization-catalog-nav-item',
      },
      href: '/k8s/all-clusters/all-namespaces/catalog',
      id: 'virtualization-catalog-virt-perspective',
      insertBefore: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~Catalog%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      href: `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}`,
      id: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,

  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-templates',
        'data-test-id': 'templates-nav-item',
      },
      href: `/k8s/all-clusters/all-namespaces/templates`,
      id: 'templates-virt-perspective',
      name: '%plugin__kubevirt-plugin~Templates%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-instancetype',
        'data-test-id': 'instancetype-nav-item',
      },
      href: `/k8s/all-clusters/${CLUSTER_INSTANCETYPE_PATH}`,
      id: 'instancetype-virt-perspective',
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      id: 'VirtualizationSeparator',
      insertAfter: 'instancetype-virt-perspective',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/separator',
  },
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test-id': 'bootablevolumes-nav-item',
      },
      href: `/k8s/all-clusters/all-namespaces/bootablevolumes`,
      id: 'bootablevolumes-virt-perspective',
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test-id': 'migrationpolicies-nav-item',
      },
      href: `/k8s/all-clusters/${MIGRATION_POLICY_PATH}`,
      id: 'migrationpolicies-virt-perspective',
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-checkups',
        'data-test-id': 'checkups-nav-item',
      },
      href: `/k8s/all-clusters/all-namespaces/checkups/storage`,
      id: 'checkups-virt-perspective',
      name: '%plugin__kubevirt-plugin~Checkups%',
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: { $codeRef: 'ConsoleStandAlone' },
      exact: false,
      path: [`/k8s/cluster/:cluster/ns/:ns/${KUBEVIRT_VM_PATH}/:name/console/standalone`],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'Navigator',
      },
      path: [
        `/k8s/cluster/:cluster/ns/:ns/${KUBEVIRT_VM_PATH}/:name`,
        `/k8s/cluster/:cluster/ns/:ns/${KUBEVIRT_VM_PATH}`,
        `/k8s/cluster/:cluster/all-namespaces/${KUBEVIRT_VM_PATH}`,
        `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'InstanceTypePage',
      },
      path: [
        `/k8s/cluster/:cluster/ns/:ns/${CLUSTER_INSTANCETYPE_PATH}/:name`,
        `/k8s/cluster/:cluster/ns/:ns/${CLUSTER_INSTANCETYPE_PATH}`,
        `/k8s/cluster/:cluster/${CLUSTER_INSTANCETYPE_PATH}`,
        `/k8s/all-clusters/${CLUSTER_INSTANCETYPE_PATH}`,
        `/k8s/cluster/:cluster/ns/:ns/${INSTANCETYPE_PATH}/:name`,
        `/k8s/cluster/:cluster/ns/:ns/${INSTANCETYPE_PATH}`,
        `/k8s/cluster/:cluster/all-namespaces/${INSTANCETYPE_PATH}`,
        `/k8s/all-clusters/all-namespaces/${INSTANCETYPE_PATH}`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'BootableVolumeYAMLPage',
      },
      path: [`/k8s/cluster/:cluster/ns/:ns/bootablevolumes/~new`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'BootableVolumesList',
      },
      path: [
        `/k8s/cluster/:cluster/ns/:ns/bootablevolumes`,
        `/k8s/cluster/:cluster/all-namespaces/bootablevolumes`,
        `/k8s/all-clusters/all-namespaces/bootablevolumes`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: { $codeRef: 'VirtualMachineSearchResults' },
      path: [`/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}/search`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    properties: { handler: { $codeRef: 'acmFlags.useKubevirtDynamicACMFlag' } },
    type: 'console.flag/hookProvider',
  } as EncodedExtension<FeatureFlagHookProvider>,

  {
    properties: {
      component: {
        $codeRef: 'CrossClusterMigration.default',
      },
      id: CROSS_CLUSTER_MIGRATION_ACTION_ID,
      model: [
        {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachine',
        },
      ],
      title: '%plugin__kubevirt-plugin~Cross cluster migration%',
    },
    type: 'acm.virtualmachine/action',
  } as EncodedExtension<ACMVirtualMachineAction>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'ClusterOverviewPage',
      },
      path: [
        '/k8s/all-clusters/all-namespaces/virtualization-overview',
        '/k8s/cluster/:cluster/ns/:ns/virtualization-overview',
        '/k8s/cluster/:cluster/all-namespaces/virtualization-overview',
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'Catalog',
      },
      path: [
        '/k8s/all-clusters/all-namespaces/catalog',
        '/k8s/cluster/:cluster/ns/:ns/catalog',
        '/k8s/cluster/:cluster/all-namespaces/catalog',
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'VirtualMachineTemplatesList',
      },
      path: [
        `/k8s/all-clusters/all-namespaces/templates`,
        `/k8s/cluster/:cluster/ns/:ns/templates`,
        `/k8s/cluster/:cluster/all-namespaces/templates`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'TemplateNavPage',
      },
      path: [`/k8s/cluster/:cluster/ns/:ns/templates/:name`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [
        `/k8s/cluster/:cluster/ns/:ns/${KUBEVIRT_VM_PATH}/~new`,
        `/k8s/cluster/:cluster/ns/:ns/templates/~new`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MigrationPoliciesList',
      },
      path: [
        `/k8s/all-clusters/${MIGRATION_POLICY_PATH}`,
        `/k8s/cluster/:cluster/${MIGRATION_POLICY_PATH}`,
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MigrationPolicyPage',
      },
      path: [`/k8s/cluster/:cluster/${MIGRATION_POLICY_PATH}/:name`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MigrationPolicyCreateForm',
      },
      path: [`/k8s/cluster/:cluster/${MIGRATION_POLICY_PATH}/form`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`/k8s/cluster/:cluster/${MIGRATION_POLICY_PATH}/~new`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`/k8s/cluster/:cluster/ns/:ns/${DATA_VOLUME_PATH}/~new`],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      handler: { $codeRef: 'urls.getFleetNamespacedResourceRoute' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'acm.resource/route',
  } as EncodedExtension<ResourceRoute>,

  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'Checkups',
      },
      path: [
        '/k8s/all-clusters/all-namespaces/checkups',
        '/k8s/cluster/:cluster/all-namespaces/checkups',
        '/k8s/cluster/:cluster/ns/:ns/checkups',
      ],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsStorageForm',
      },
      path: ['/k8s/cluster/:cluster/ns/:ns/checkups/storage/form'],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsStorageDetailsPage',
      },
      path: ['/k8s/cluster/:cluster/ns/:ns/checkups/storage/:checkupName'],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationForm',
      },
      path: ['/k8s/cluster/:cluster/ns/:ns/checkups/self-validation/form'],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationDetailsPage',
      },
      path: ['/k8s/cluster/:cluster/ns/:ns/checkups/self-validation/:checkupName'],
      perspective: 'fleet-virtualization-perspective',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      handler: { $codeRef: 'urls.getFleetClusterResourceRoute' },
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
    },
    type: 'acm.resource/route',
  } as EncodedExtension<ResourceRoute>,
];
