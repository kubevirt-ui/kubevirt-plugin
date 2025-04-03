import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  topology: 'src/views/topology/topology.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      getFactory: {
        $codeRef: 'topology.kubevirtComponentFactory',
      },
    },
    type: 'console.topology/component/factory',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      getDataModel: {
        $codeRef: 'topology.getKubevirtDataModel',
      },
      id: 'kubevirt-topology-model-factory',
      isResourceDepicted: {
        $codeRef: 'topology.isResourceDepicted',
      },
      priority: 200,
      resources: {
        dataVolumes: {
          model: { group: 'cdi.kubevirt.io', kind: 'DataVolume', version: 'v1beta1' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        migrations: {
          model: { group: 'kubevirt.io', kind: 'VirtualMachineInstanceMigration', version: 'v1' },
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
          model: { group: 'kubevirt.io', kind: 'VirtualMachineInstance', version: 'v1' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        virtualmachines: {
          model: { group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' },
          opts: {
            isList: true,
            optional: true,
          },
        },
        virtualmachinetemplates: {
          model: {
            group: 'template.openshift.io',
            kind: 'Template',
            version: 'v1',
          },
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
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      id: 'topology-tab-section-vm-details',
      provider: {
        $codeRef: 'topology.useVMSidePanelDetailsTabSection',
      },
      tab: 'topology-side-bar-tab-details',
    },
    type: 'console.topology/details/tab-section',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      adapt: {
        $codeRef: 'topology.getVMSidePanelPodsAdapter',
      },
    },
    type: 'console.topology/adapter/pod',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      adapt: {
        $codeRef: 'topology.getVMSidePanelNetworkAdapter',
      },
    },
    type: 'console.topology/adapter/network',
  },
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      link: { $codeRef: 'topology.getVMSideBarResourceLink' },
      priority: 100,
    },
    type: 'console.topology/details/resource-link',
  },
];
