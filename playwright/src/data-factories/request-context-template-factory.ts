import type { KubernetesResource } from '@/data-models/kubernetes-types';

/**
 * Data factory for generating OpenShift Template JSON payloads
 * for use with RequestContextClient API requests
 */
import { generateRandomString } from '../utils/random-data-generator';

export interface RequestContextTemplateParameter {
  description: string;
  from?: string;
  generate?: 'expression';
  name: string;
  value?: string;
}

export interface RequestContextTemplateConfig {
  // Basic metadata
  name?: string;
  namespace?: string;

  // Template metadata
  templateType?: string;
  description?: string;
  displayName?: string;
  iconClass?: string;

  // OS configuration
  os?: string;
  osLabel?: string;
  osName?: string;

  // Workload configuration
  workload?: string;
  workloadLabel?: string;

  // Resource configuration
  cpuCores?: number;
  cpuSockets?: number;
  cpuThreads?: number;
  memory?: string;
  runStrategy?: 'Always' | 'Halted' | 'Manual' | 'RerunOnFailure';

  // Size/flavor
  size?: 'large' | 'medium' | 'small' | 'tiny';
  flavor?: 'large' | 'medium' | 'small' | 'tiny';

  // Network configuration
  networkName?: string;
  interfaceModel?: 'e1000' | 'e1000e' | 'rtl8139' | 'virtio';
  networkInterfaceMultiqueue?: boolean;

  // Disk configuration
  rootDiskName?: string;
  rootDiskBus?: 'sata' | 'scsi' | 'virtio';
  rootDiskImage?: string;
  cloudInitDiskName?: string;

  // Cloud-init configuration
  cloudInitUser?: string;

  // Parameters
  nameParameter?: RequestContextTemplateParameter;
  passwordParameter?: RequestContextTemplateParameter;
  additionalParameters?: RequestContextTemplateParameter[];

  // VM-level configuration
  vmDescription?: string;

  // Terminations
  terminationGracePeriodSeconds?: number;
}

export class RequestContextTemplateFactory {
  private static defaultConfig: RequestContextTemplateConfig = {
    name: 'example',
    templateType: 'vm',
    description: 'VM template example',
    displayName: 'Fedora VM',
    iconClass: 'icon-fedora',
    os: 'fedora',
    osLabel: 'fedora',
    osName: 'Fedora',
    workload: 'server',
    workloadLabel: 'server',
    cpuCores: 1,
    cpuSockets: 1,
    cpuThreads: 1,
    memory: '2Gi',
    runStrategy: 'Halted',
    size: 'small',
    flavor: 'small',
    networkName: 'default',
    interfaceModel: 'virtio',
    networkInterfaceMultiqueue: true,
    rootDiskName: 'rootdisk',
    rootDiskBus: 'virtio',
    rootDiskImage: 'quay.io/containerdisks/fedora',
    cloudInitDiskName: 'cloudinitdisk',
    cloudInitUser: 'fedora',
    nameParameter: {
      description: 'Name for the new VM',
      from: 'example-[a-z0-9]{16}',
      generate: 'expression',
      name: 'NAME',
    },
    passwordParameter: {
      description: 'Randomized password for the cloud-init user',
      from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
      generate: 'expression',
      name: 'CLOUD_USER_PASSWORD',
    },
    vmDescription: 'VM example',
    terminationGracePeriodSeconds: 180,
  };

  /**
   * Generate a Template JSON payload for API requests
   * @param config - Configuration options for the Template (will be merged with defaults)
   * @returns JSON object representation of the Template
   */
  static create(config: Partial<RequestContextTemplateConfig> = {}): KubernetesResource {
    const template = this.mergeConfig(this.defaultConfig, config);

    // Build labels
    const labels: Record<string, string> = {
      'template.kubevirt.io/type': template.templateType ?? '',
      [`os.template.kubevirt.io/${template.osLabel}`]: 'true',
      [`workload.template.kubevirt.io/${template.workloadLabel}`]: 'true',
    };

    // Build annotations
    const annotations: Record<string, string> = {
      [`name.os.template.kubevirt.io/${template.osLabel}`]: template.osName ?? '',
      description: template.description ?? '',
      'openshift.io/display-name': template.displayName ?? '',
      iconClass: template.iconClass ?? '',
    };

    // Build parameters array
    const parameters: unknown[] = [];
    if (template.nameParameter) {
      parameters.push(template.nameParameter);
    }
    if (template.passwordParameter) {
      parameters.push(template.passwordParameter);
    }
    if (template.additionalParameters) {
      parameters.push(...template.additionalParameters);
    }

    // Build the complete payload
    const payload: KubernetesResource = {
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: {
        name: template.name,
        namespace: template.namespace,
        labels: labels,
        annotations: annotations,
      },
      objects: [
        {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachine',
          metadata: {
            name: '${NAME}',
            annotations: {
              description: template.vmDescription,
            },
            labels: {
              app: '${NAME}',
              'vm.kubevirt.io/template': template.name,
              [`os.template.kubevirt.io/${template.osLabel}`]: 'true',
            },
          },
          spec: {
            runStrategy: template.runStrategy,
            template: {
              metadata: {
                annotations: {
                  'vm.kubevirt.io/flavor': template.flavor,
                  'vm.kubevirt.io/os': template.os,
                  'vm.kubevirt.io/workload': template.workload,
                },
                labels: {
                  'kubevirt.io/domain': '${NAME}',
                  'kubevirt.io/size': template.size,
                },
              },
              spec: {
                domain: {
                  cpu: {
                    cores: template.cpuCores,
                    sockets: template.cpuSockets,
                    threads: template.cpuThreads,
                  },
                  devices: {
                    disks: [
                      {
                        disk: {
                          bus: template.rootDiskBus,
                        },
                        name: template.rootDiskName,
                      },
                      {
                        disk: {
                          bus: template.rootDiskBus,
                        },
                        name: template.cloudInitDiskName,
                      },
                    ],
                    interfaces: [
                      {
                        masquerade: {},
                        model: template.interfaceModel,
                        name: template.networkName,
                      },
                    ],
                    networkInterfaceMultiqueue: template.networkInterfaceMultiqueue,
                    rng: {},
                  },
                  memory: {
                    guest: template.memory,
                  },
                },
                hostname: '${NAME}',
                networks: [
                  {
                    name: template.networkName,
                    pod: {},
                  },
                ],
                terminationGracePeriodSeconds: template.terminationGracePeriodSeconds,
                volumes: [
                  {
                    name: template.rootDiskName,
                    containerDisk: {
                      image: template.rootDiskImage,
                    },
                  },
                  {
                    cloudInitNoCloud: {
                      userData: `#cloud-config\nuser: ${template.cloudInitUser}\npassword: '\${CLOUD_USER_PASSWORD}'\nchpasswd: { expire: False }`,
                    },
                    name: template.cloudInitDiskName,
                  },
                ],
              },
            },
          },
        },
      ],
      parameters: parameters,
    };

    return payload;
  }

  /**
   * Create a template with custom resource specifications
   */
  static createCustomResources(
    name: string,
    namespace: string,
    cpuCores: number,
    memory: string,
  ): KubernetesResource {
    return this.create({
      name,
      namespace,
      cpuCores,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Custom template: ${name}`,
      displayName: `Custom ${name}`,
      memory,
    });
  }

  /**
   * Create a template with minimal configuration
   */
  static createMinimal(name: string, namespace: string): KubernetesResource {
    return this.create({
      name,
      namespace,
      description: `Minimal template: ${name}`,
      displayName: `${name} template`,
    });
  }

  /**
   * Generate a random template name
   * @returns A random template name
   */
  static generateRandomName(prefix = 'template'): string {
    return `${prefix}-${generateRandomString(8, 'alphanumeric').toLowerCase()}`;
  }

  /**
   * Merge configuration with defaults
   */
  private static mergeConfig(
    defaults: RequestContextTemplateConfig,
    config: Partial<RequestContextTemplateConfig>,
  ): RequestContextTemplateConfig {
    return { ...defaults, ...config };
  }
}
