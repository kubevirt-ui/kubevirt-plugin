import { ACMVirtualMachineAction } from '@kubevirt-extensions/acm.virtualmachine';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  HrefNavItem,
  RoutePage,
  Separator,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceRoute } from '@stolostron/multicluster-sdk';

import { PERSPECTIVES } from '../utils/constants/constants';
import { FLAG_KUBEVIRT_VIRTUALIZATION_NAV } from '../utils/flags/consts';

import {
  CROSS_CLUSTER_MIGRATION_ACTION_ID,
  FLEET_BOOTABLE_VOLUMES_PATH,
  FLEET_CATALOG_PATH,
  FLEET_CHECKUPS_PATH,
  FLEET_INSTANCETYPES_PATH,
  FLEET_MIGRATION_POLICIES_PATH,
  FLEET_NS_INSTANCETYPES_PATH,
  FLEET_TEMPLATES_PATH,
  FLEET_VIRTUAL_MACHINES_PATH,
  FLEET_WIZARD_PATH,
} from './constants';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  acmFlags: './multicluster/flags.ts',
  CrossClusterMigration:
    './multicluster/components/CrossClusterMigration/CrossClusterMigration.tsx',
  MulticlusterYAMLCreation:
    './multicluster/components/MulticlusterYAMLCreation/MulticlusterYAMLCreation.tsx',
  urls: './multicluster/urls.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      disallowed: ['KUBEVIRT_DISALLOW_DYNAMIC_ACM'],
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      icon: { $codeRef: 'perspective.icon' },
      id: PERSPECTIVES.FLEET_VIRTUALIZATION,
      importRedirectURL: { $codeRef: 'perspective.getACMLandingPageURL' },
      landingPageURL: { $codeRef: 'perspective.getACMLandingPageURL' },
      name: '%plugin__console-virt-perspective-plugin~Fleet Virtualization%',
    },
    type: 'console.perspective',
  },
  // Navigation order:
  // VirtualMachines
  // Templates
  // Bootable volumes
  // --- separator 1 ---
  // InstanceTypes
  // --- separator 2 ---
  // MigrationPolicies
  // Checkups
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      href: `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces`,
      id: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_VIRTUAL_MACHINES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-templates',
        'data-test-id': 'templates-nav-item',
      },
      href: `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`,
      id: 'templates-virt-perspective',
      insertAfter: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~Templates%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_TEMPLATES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test-id': 'bootablevolumes-nav-item',
      },
      href: `${FLEET_BOOTABLE_VOLUMES_PATH}/all-clusters/all-namespaces`,
      id: 'bootablevolumes-virt-perspective',
      insertAfter: 'templates-virt-perspective',
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_BOOTABLE_VOLUMES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      id: 'acm-separator-1',
      insertAfter: 'bootablevolumes-virt-perspective',
      insertBefore: 'instancetype-virt-perspective',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      testID: 'acm-separator-1',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-instancetype',
        'data-test-id': 'instancetype-nav-item',
      },
      href: `${FLEET_INSTANCETYPES_PATH}/all-clusters/all-namespaces`,
      id: 'instancetype-virt-perspective',
      insertAfter: 'acm-separator-1',
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_INSTANCETYPES_PATH.slice(1), FLEET_NS_INSTANCETYPES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      id: 'acm-separator-2',
      insertAfter: 'instancetype-virt-perspective',
      insertBefore: 'migrationpolicies-virt-perspective',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      testID: 'acm-separator-2',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test-id': 'migrationpolicies-nav-item',
      },
      href: `${FLEET_MIGRATION_POLICIES_PATH}/all-clusters`,
      id: 'migrationpolicies-virt-perspective',
      insertAfter: 'acm-separator-2',
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_MIGRATION_POLICIES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-checkups',
        'data-test-id': 'checkups-nav-item',
      },
      href: `${FLEET_CHECKUPS_PATH}/all-clusters/all-namespaces/storage`,
      id: 'checkups-virt-perspective',
      insertAfter: 'migrationpolicies-virt-perspective',
      name: '%plugin__kubevirt-plugin~Checkups%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_CHECKUPS_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      component: { $codeRef: 'ConsoleStandAlone' },
      exact: false,
      path: [`${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/:name/console/standalone`],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      component: {
        $codeRef: 'Navigator',
      },
      path: [
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/:name`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/ns/:ns`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      component: {
        $codeRef: 'InstanceTypePage',
      },
      path: [
        `${FLEET_INSTANCETYPES_PATH}/cluster/:cluster/:name`,
        `${FLEET_INSTANCETYPES_PATH}/cluster/:cluster`,
        `${FLEET_INSTANCETYPES_PATH}/all-clusters`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/ns/:ns/:name`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_NS_INSTANCETYPES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumeYAMLPage',
      },
      path: [`${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumesList',
      },
      path: [
        `${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_BOOTABLE_VOLUMES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'VirtualMachineSearchResults' },
      path: [`${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces/search`],
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
    properties: {
      component: {
        $codeRef: 'VMWizard',
      },
      path: [
        `${FLEET_WIZARD_PATH}/all-clusters/all-namespaces`,
        `${FLEET_WIZARD_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_WIZARD_PATH}/cluster/:cluster/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM', FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      component: {
        $codeRef: 'Catalog',
      },
      path: [
        `${FLEET_CATALOG_PATH}/all-clusters/all-namespaces`,
        `${FLEET_CATALOG_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_CATALOG_PATH}/cluster/:cluster/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VirtualMachineTemplatesList',
      },
      path: [
        `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'TemplateNavPage',
      },
      path: [`${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/~new`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/~new`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPoliciesList',
      },
      path: [
        `${FLEET_MIGRATION_POLICIES_PATH}/all-clusters`,
        `${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyPage',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyCreateForm',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns/datavolume/~new`],
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
    properties: {
      component: {
        $codeRef: 'Checkups',
      },
      path: [
        `${FLEET_CHECKUPS_PATH}/all-clusters/all-namespaces`,
        `${FLEET_CHECKUPS_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    properties: {
      component: {
        $codeRef: 'CheckupsStorageForm',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/storage/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsStorageDetailsPage',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/storage/:checkupName`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationForm',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/self-validation/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationDetailsPage',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/self-validation/:checkupName`],
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
