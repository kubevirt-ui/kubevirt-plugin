import type { KubernetesResource } from '@/data-models/kubernetes-types';

import { REGISTRY_URLS } from '@/data-models';
import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

export interface VmTemplateDiskSourceContainerDisk {
  image: string;
  type: 'containerDisk';
}

export interface VmTemplateDiskSourcePVC {
  claimName: string;
  type: 'persistentVolumeClaim';
}

export type VmTemplateDiskSource = VmTemplateDiskSourceContainerDisk | VmTemplateDiskSourcePVC;

export interface VmTemplateConfig extends BaseResourceConfig {
  cpuCores?: number;
  cpuSockets?: number;
  cpuThreads?: number;
  description?: string;
  displayName?: string;
  interfaceModel?: 'e1000' | 'e1000e' | 'virtio';
  memory?: string;
  os?: string;
  rootDiskBus?: 'sata' | 'scsi' | 'virtio';
  rootDiskSource?: VmTemplateDiskSource;
  runStrategy?: 'Always' | 'Halted' | 'Manual' | 'RerunOnFailure';
  workload?: 'desktop' | 'highperformance' | 'server';
}

/**
 * Data factory for generating KubeVirt VirtualMachineTemplate resource objects
 * (template.kubevirt.io/v1beta1).
 */
export class VmTemplateFactory extends BaseDataFactory {
  private static defaultConfig: VmTemplateConfig = {
    cpuCores: 1,
    cpuSockets: 1,
    cpuThreads: 1,
    description: 'VM template for E2E testing',
    displayName: 'Test VM Template',
    interfaceModel: 'virtio',
    memory: '2Gi',
    name: 'test-vm-template',
    os: 'fedora',
    rootDiskBus: 'virtio',
    rootDiskSource: { type: 'containerDisk', image: REGISTRY_URLS.FEDORA_LATEST },
    runStrategy: 'Halted',
    workload: 'server',
  };

  static createResourceObject(config: Partial<VmTemplateConfig> = {}): KubernetesResource {
    const c = this.mergeConfig(this.defaultConfig, config);

    const rootVolume =
      c.rootDiskSource?.type === 'persistentVolumeClaim'
        ? { name: 'rootdisk', persistentVolumeClaim: { claimName: c.rootDiskSource.claimName } }
        : {
            name: 'rootdisk',
            containerDisk: {
              image:
                (c.rootDiskSource as VmTemplateDiskSourceContainerDisk | undefined)?.image ??
                REGISTRY_URLS.FEDORA_LATEST,
            },
          };

    const metadata: Record<string, unknown> = {
      name: c.name,
      annotations: {
        description: c.description ?? '',
        'openshift.io/display-name': c.displayName ?? c.name,
      },
      labels: {
        [`os.template.kubevirt.io/${c.os}`]: 'true',
        [`workload.template.kubevirt.io/${c.workload}`]: 'true',
      },
    };
    if (c.namespace) {
      metadata.namespace = c.namespace;
    }

    return {
      apiVersion: 'template.kubevirt.io/v1beta1',
      kind: 'VirtualMachineTemplate',
      metadata,
      spec: {
        parameters: [{ description: 'VM name', name: 'NAME', value: c.name }],
        virtualMachine: {
          metadata: { labels: { app: '${NAME}' }, name: '${NAME}' },
          spec: {
            runStrategy: c.runStrategy,
            template: {
              metadata: { labels: { 'kubevirt.io/domain': '${NAME}' } },
              spec: {
                domain: {
                  cpu: { cores: c.cpuCores, sockets: c.cpuSockets, threads: c.cpuThreads },
                  devices: {
                    disks: [{ disk: { bus: c.rootDiskBus }, name: 'rootdisk' }],
                    interfaces: [{ masquerade: {}, model: c.interfaceModel, name: 'default' }],
                  },
                  memory: { guest: c.memory },
                },
                networks: [{ name: 'default', pod: {} }],
                volumes: [rootVolume],
              },
            },
          },
        },
      },
    };
  }
}
