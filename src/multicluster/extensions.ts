import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  HrefNavItem,
  RoutePage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceRoute } from '@stolostron/multicluster-sdk';

import { ACMVirtualMachineActionExtension } from './hooks/useACMExtensionActions/constants';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from './constants';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  acmFlags: './multicluster/flags.ts',
  ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
  CrossClusterMigration:
    './multicluster/components/CrossClusterMigration/CrossClusterMigration.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
  urls: './multicluster/urls.ts',
  VirtualMachineSearchResults: './views/virtualmachines/search/VirtualMachineSearchResults.tsx',
};

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
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
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
    flags: {
      required: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      href: '/k8s/all-clusters/all-namespaces/kubevirt.io~v1~VirtualMachine',
      id: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
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
      path: ['/multicloud/infrastructure/vmconsole/:cluster/:namespace/:name'],
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
        '/k8s/cluster/:cluster/ns/:ns/kubevirt.io~v1~VirtualMachine/:name',
        '/k8s/cluster/:cluster/ns/:ns/kubevirt.io~v1~VirtualMachine',
        '/k8s/cluster/:cluster/all-namespaces/kubevirt.io~v1~VirtualMachine',
        '/k8s/all-clusters/all-namespaces/kubevirt.io~v1~VirtualMachine',
      ],
    },
    type: 'console.page/route',
  },
  {
    properties: {
      component: { $codeRef: 'VirtualMachineSearchResults' },
      path: ['/k8s/all-clusters/all-namespaces/kubevirt.io~v1~VirtualMachine/search'],
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
  } as EncodedExtension<ACMVirtualMachineActionExtension>,

  {
    properties: {
      component: {
        $codeRef: 'Catalog',
      },
      path: [
        '/k8s/all-clusters/all-namespaces/catalog',
        '/k8s/cluster/:cluster/ns/:ns/catalog',
        '/k8s/cluster/:cluster/all-namespaces/catalog',
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      handler: { $codeRef: 'urls.getFleetResourceRoute' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
      },
    },
    type: 'acm.resource/route',
  } as EncodedExtension<ResourceRoute>,
  {
    properties: {
      handler: { $codeRef: 'urls.getFleetResourceRoute' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
      },
    },
    type: 'acm.resource/route',
  } as EncodedExtension<ResourceRoute>,
];
