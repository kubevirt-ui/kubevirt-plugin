import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { DetailsItem } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  VMIMSourceNodeDetails:
    './views/virtualmachineinstancemigrations/details/VMIMSourceNodeDetails.tsx',
  VMIMTargetNodeDetails:
    './views/virtualmachineinstancemigrations/details/VMIMTargetNodeDetails.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      column: 'right',
      component: { $codeRef: 'VMIMSourceNodeDetails' },
      id: 'vmim-source-node-details-item',
      model: VirtualMachineInstanceMigrationModelGroupVersionKind,
      path: 'status.migrationState.sourceNode',
      sortWeight: 1,
      title: 'Source node',
    },
    type: 'console.resource/details-item',
  } as EncodedExtension<DetailsItem>,
  {
    properties: {
      column: 'right',
      component: { $codeRef: 'VMIMTargetNodeDetails' },
      id: 'vmim-target-node-details-item',
      model: VirtualMachineInstanceMigrationModelGroupVersionKind,
      path: 'status.migrationState.targetNode',
      sortWeight: 2,
      title: 'Target node',
    },
    type: 'console.resource/details-item',
  } as EncodedExtension<DetailsItem>,
];
