import { type ACMVirtualMachineAction } from '@kubevirt-extensions/acm.virtualmachine';
import type { FeatureFlagHookProvider } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '../constants';

export const acmExtensions: EncodedExtension[] = [
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
      handler: { $codeRef: 'urls.getFleetNamespacedResourceRoute' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'acm.resource/route',
  } as EncodedExtension,
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
  } as EncodedExtension,
];
