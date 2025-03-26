import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  topology: 'src/views/topology/utils/kubevirtComponentFactory.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      getFactory: {
        $codeRef: 'topology.getKubevirtComponentFactory',
      },
    },
    type: 'console.topology/component/factory',
  },
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      getDataModel: {
        $codeRef: 'topology.getDataModel',
      },
      id: 'kubevirt-topology-model-factory',
      isResourceDepicted: {
        $codeRef: 'topology.isResourceDepicted',
      },
      priority: 200,
      resources: {
        dataVolumes: {
          model: { group: 'cdi.kubevirt.io', kind: 'DataVolume' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        migrations: {
          model: { group: 'kubevirt.io', kind: 'VirtualMachineInstanceMigration' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        pods: {
          opts: {
            isList: true,
            kind: 'Pod',
            optional: true,
          },
        },
        virtualmachineinstances: {
          model: { group: 'kubevirt.io', kind: 'VirtualMachineInstance' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        virtualmachines: {
          model: { group: 'kubevirt.io', kind: 'VirtualMachine' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        virtualmachinetemplates: {
          opts: {
            isList: true,
            kind: 'Template',
            optional: true,
            selector: {
              matchLabels: {
                'template.kubevirt.io/type': 'base',
              },
            },
          },
        },
      },
    },
    type: 'console.topology/data/factory',
  },
];
