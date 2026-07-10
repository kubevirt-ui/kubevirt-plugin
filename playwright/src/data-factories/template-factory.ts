import type { KubernetesResource } from '@/data-models/kubernetes-types';

import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

/**
 * Data factory for generating OpenShift Template YAML configurations
 * Templates wrap VirtualMachine objects and provide parameterization
 */

// Disk source types for templates
export interface TemplateDiskSourceContainerDisk {
  type: 'containerDisk';
  image: string;
}

export interface TemplateDiskSourcePVC {
  type: 'persistentVolumeClaim';
  claimName: string;
}

export interface TemplateDiskSourceDataVolume {
  type: 'dataVolume';
  name: string;
}

export type TemplateDiskSource =
  | TemplateDiskSourceContainerDisk
  | TemplateDiskSourcePVC
  | TemplateDiskSourceDataVolume;

// Additional disk configuration for non-boot disks
export interface TemplateAdditionalDisk {
  bus?: 'sata' | 'scsi' | 'virtio';
  name: string;
  source: TemplateDiskSource;
}

export interface TemplateConfig extends BaseResourceConfig {
  // Additional disks (beyond root and cloud-init)
  additionalDisks?: TemplateAdditionalDisk[];
  additionalParameters?: TemplateParameter[];
  // Cloud-init configuration
  cloudInitDiskName?: string;
  cloudInitUser?: string;
  cpuCores?: number;
  cpuSockets?: number;
  cpuThreads?: number;
  description?: string;

  displayName?: string;
  flavor?: 'large' | 'medium' | 'small' | 'tiny';
  iconClass?: string;
  // Network configuration
  interfaceModel?: 'e1000' | 'e1000e' | 'rtl8139' | 'virtio';
  memory?: string;
  // Parameter configurations
  nameParameter?: TemplateParameter;
  networkInterfaceMultiqueue?: boolean;
  networkName?: string;
  os?: string;
  osLabel?: string;
  osName?: string;

  passwordParameter?: TemplateParameter;
  rootDiskBus?: 'sata' | 'scsi' | 'virtio';
  rootDiskImage?: string;

  // Disk configurations
  rootDiskName?: string;
  // Root disk source - supports containerDisk (default), persistentVolumeClaim, or dataVolume
  rootDiskSource?: TemplateDiskSource;
  runStrategy?: 'Always' | 'Halted' | 'Manual' | 'RerunOnFailure';

  // Size label
  size?: 'large' | 'medium' | 'small' | 'tiny';
  // Template-level metadata
  templateType?: string;

  terminationGracePeriodSeconds?: number;

  // VirtualMachine configuration (nested in template)
  vmDescription?: string;
  workload?: 'desktop' | 'highperformance' | 'server';
  workloadLabel?: string;

  // Scheduling configuration
  dedicatedCpuPlacement?: boolean;
  evictionStrategy?: 'LiveMigrate' | 'None';
}

export interface TemplateParameter {
  description: string;
  from?: string;
  generate?: 'expression';
  name: string;
  value?: string;
}

export class TemplateFactory extends BaseDataFactory {
  private static defaultConfig: TemplateConfig = {
    cloudInitDiskName: 'cloudinitdisk',
    cloudInitUser: 'fedora',
    cpuCores: 1,
    cpuSockets: 1,
    cpuThreads: 1,
    description: 'VM template example',
    displayName: 'Fedora VM',
    flavor: 'small',
    iconClass: 'icon-fedora',
    interfaceModel: 'virtio',
    memory: '2Gi',
    name: 'example',
    nameParameter: {
      description: 'Name for the new VM',
      from: 'example-[a-z0-9]{16}',
      generate: 'expression',
      name: 'NAME',
    },
    networkInterfaceMultiqueue: true,
    networkName: 'default',
    os: 'fedora',
    osLabel: 'fedora',
    osName: 'Fedora',
    passwordParameter: {
      description: 'Randomized password for the cloud-init user',
      from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
      generate: 'expression',
      name: 'CLOUD_USER_PASSWORD',
    },
    rootDiskBus: 'virtio',
    rootDiskImage: 'quay.io/containerdisks/fedora',
    rootDiskName: 'rootdisk',
    runStrategy: 'Halted',
    size: 'small',
    templateType: 'vm',
    terminationGracePeriodSeconds: 180,
    vmDescription: 'VM example',
    workload: 'server',
    workloadLabel: 'server',
  };

  /**
   * Build a disk volume from a disk source
   */
  private static buildDiskVolume(
    diskName: string,
    diskSource: TemplateDiskSource,
  ): Record<string, unknown> {
    switch (diskSource.type) {
      case 'containerDisk':
        return {
          name: diskName,
          containerDisk: {
            image: diskSource.image,
          },
        };
      case 'persistentVolumeClaim':
        return {
          name: diskName,
          persistentVolumeClaim: {
            claimName: diskSource.claimName,
          },
        };
      case 'dataVolume':
        return {
          name: diskName,
          dataVolume: {
            name: diskSource.name,
          },
        };
      default:
        throw new Error(`Unknown disk source type`);
    }
  }

  /**
   * Build the parameters section of the template
   */
  private static buildParametersSection(template: TemplateConfig): string {
    const params: TemplateParameter[] = [];

    // Add name parameter if provided
    if (template.nameParameter) {
      params.push(template.nameParameter);
    }

    // Add password parameter if provided
    if (template.passwordParameter) {
      params.push(template.passwordParameter);
    }

    // Add any additional parameters
    if (template.additionalParameters) {
      params.push(...template.additionalParameters);
    }

    if (params.length === 0) {
      return '';
    }

    let paramsYaml = 'parameters:\n';
    params.forEach((param) => {
      paramsYaml += `  - name: ${param.name}\n`;
      paramsYaml += `    description: ${param.description}\n`;
      if (param.generate) {
        paramsYaml += `    generate: ${param.generate}\n`;
      }
      if (param.from) {
        paramsYaml += `    from: '${param.from}'\n`;
      }
      if (param.value) {
        paramsYaml += `    value: ${param.value}\n`;
      }
    });

    return paramsYaml;
  }

  /**
   * Build the root disk volume based on the disk source type
   */
  private static buildRootDiskVolume(template: TemplateConfig): Record<string, unknown> {
    const diskName = template.rootDiskName || 'rootdisk';
    const diskSource = template.rootDiskSource;

    // Default to containerDisk if no source specified
    if (!diskSource) {
      return {
        name: diskName,
        containerDisk: {
          image: template.rootDiskImage || 'quay.io/containerdisks/fedora',
        },
      };
    }

    switch (diskSource.type) {
      case 'containerDisk':
        return {
          name: diskName,
          containerDisk: {
            image: diskSource.image,
          },
        };
      case 'persistentVolumeClaim':
        return {
          name: diskName,
          persistentVolumeClaim: {
            claimName: diskSource.claimName,
          },
        };
      case 'dataVolume':
        return {
          name: diskName,
          dataVolume: {
            name: diskSource.name,
          },
        };
      default:
        return {
          name: diskName,
          containerDisk: {
            image: template.rootDiskImage || 'quay.io/containerdisks/fedora',
          },
        };
    }
  }

  /**
   * Generate a Template YAML configuration
   * @param config - Configuration options for the Template (will be merged with defaults)
   * @returns YAML string representation of the Template
   */
  static create(config: Partial<TemplateConfig> = {}): string {
    const template = this.mergeConfig(this.defaultConfig, config);

    // Build custom labels and annotations using base class utilities
    const customLabels = this.buildLabelsSection(template.customLabels, 4);
    const customAnnotations = this.buildAnnotationsSection(template.customAnnotations, 4);

    // Build parameters section
    const parameters = this.buildParametersSection(template);

    const yaml = `apiVersion: template.openshift.io/v1
kind: Template
metadata:
  name: ${template.name}${this.addNamespaceField(template.namespace)}
  labels:
    template.kubevirt.io/type: ${template.templateType}
    os.template.kubevirt.io/${template.osLabel}: 'true'
    workload.template.kubevirt.io/${template.workloadLabel}: 'true'${
      customLabels ? `\n${customLabels}` : ''
    }
  annotations:
    name.os.template.kubevirt.io/${template.osLabel}: ${template.osName}
    description: ${template.description}
    openshift.io/display-name: ${template.displayName}
    iconClass: ${template.iconClass}${customAnnotations ? `\n${customAnnotations}` : ''}
objects:
  - apiVersion: kubevirt.io/v1
    kind: VirtualMachine
    metadata:
      name: '\${NAME}'
      annotations:
        description: ${template.vmDescription}
      labels:
        app: '\${NAME}'
        vm.kubevirt.io/template: ${template.name}
        os.template.kubevirt.io/${template.osLabel}: 'true'
    spec:
      runStrategy: ${template.runStrategy}
      template:
        metadata:
          annotations:
            vm.kubevirt.io/flavor: ${template.flavor}
            vm.kubevirt.io/os: ${template.os}
            vm.kubevirt.io/workload: ${template.workload}
          labels:
            kubevirt.io/domain: '\${NAME}'
            kubevirt.io/size: ${template.size}
        spec:
          domain:
            cpu:
              cores: ${template.cpuCores}
              sockets: ${template.cpuSockets}
              threads: ${template.cpuThreads}${
                template.dedicatedCpuPlacement ? `\n              dedicatedCpuPlacement: true` : ''
              }
            devices:
              disks:
                - disk:
                    bus: ${template.rootDiskBus}
                  name: ${template.rootDiskName}
                - disk:
                    bus: ${template.rootDiskBus}
                  name: ${template.cloudInitDiskName}
              interfaces:
                - masquerade: {}
                  model: ${template.interfaceModel}
                  name: ${template.networkName}
              networkInterfaceMultiqueue: ${template.networkInterfaceMultiqueue}
              rng: {}
            memory:
              guest: ${template.memory}
          hostname: '\${NAME}'
          networks:
            - name: ${template.networkName}
              pod: {}
          terminationGracePeriodSeconds: ${template.terminationGracePeriodSeconds}${
            template.evictionStrategy
              ? `\n          evictionStrategy: ${template.evictionStrategy}`
              : ''
          }
          volumes:
            - name: ${template.rootDiskName}
              containerDisk:
                image: ${template.rootDiskImage}
            - cloudInitNoCloud:
                userData: |-
                  #cloud-config
                  user: ${template.cloudInitUser}
                  password: '\${CLOUD_USER_PASSWORD}'
                  chpasswd: { expire: False }
              name: ${template.cloudInitDiskName}
${parameters}`;

    return yaml;
  }

  /**
   * Create a template with custom resource specifications
   */
  static createCustomResources(
    name: string,
    cpuCores: number,
    memory: string,
    namespace?: string,
  ): string {
    return this.create({
      cpuCores,
      cpuSockets: 1,
      cpuThreads: 1,
      description: `Custom template: ${name}`,
      displayName: `Custom ${name}`,
      memory,
      name,
      namespace,
    });
  }

  /**
   * Create a Fedora server template
   */
  static createFedoraServer(name: string, namespace?: string): string {
    return this.create({
      description: 'Fedora server template',
      displayName: 'Fedora Server',
      iconClass: 'icon-fedora',
      name,
      namespace,
      osLabel: 'fedora',
      osName: 'Fedora',
      workload: 'server',
      workloadLabel: 'server',
    });
  }

  /**
   * Create a high-performance template
   */
  static createHighPerformance(name: string, namespace?: string): string {
    return this.create({
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      description: 'High-performance template',
      displayName: 'High Performance VM',
      flavor: 'large',
      memory: '16Gi',
      name,
      namespace,
      size: 'large',
      workload: 'highperformance',
      workloadLabel: 'highperformance',
    });
  }

  /**
   * Create a minimal template configuration with just required fields
   */
  static createMinimal(name: string, namespace?: string): string {
    return this.create({
      description: `Minimal template: ${name}`,
      displayName: `${name} template`,
      name,
      namespace,
    });
  }

  /**
   * Generate a Template resource object (for use with Kubernetes API)
   * @param config - Configuration options for the Template (will be merged with defaults)
   * @returns Template resource object
   */
  static createResourceObject(config: Partial<TemplateConfig> = {}): KubernetesResource {
    const template = this.mergeConfig(this.defaultConfig, config);

    // Build parameters array
    const parameters: Record<string, unknown>[] = [];
    if (template.nameParameter) {
      parameters.push({
        name: template.nameParameter.name,
        description: template.nameParameter.description,
        ...(template.nameParameter.generate && { generate: template.nameParameter.generate }),
        ...(template.nameParameter.from && { from: template.nameParameter.from }),
        ...(template.nameParameter.value && { value: template.nameParameter.value }),
      });
    }
    if (template.passwordParameter) {
      parameters.push({
        name: template.passwordParameter.name,
        description: template.passwordParameter.description,
        ...(template.passwordParameter.generate && {
          generate: template.passwordParameter.generate,
        }),
        ...(template.passwordParameter.from && { from: template.passwordParameter.from }),
        ...(template.passwordParameter.value && { value: template.passwordParameter.value }),
      });
    }
    if (template.additionalParameters) {
      template.additionalParameters.forEach((param) => {
        parameters.push({
          name: param.name,
          description: param.description,
          ...(param.generate && { generate: param.generate }),
          ...(param.from && { from: param.from }),
          ...(param.value && { value: param.value }),
        });
      });
    }

    // Build labels
    const labels: { [key: string]: string } = {
      [`template.kubevirt.io/type`]: template.templateType || 'vm',
      [`os.template.kubevirt.io/${template.osLabel}`]: 'true',
      [`workload.template.kubevirt.io/${template.workloadLabel}`]: 'true',
    };
    if (template.customLabels) {
      Object.entries(template.customLabels).forEach(([key, value]) => {
        labels[key] = value;
      });
    }

    // Build annotations
    const annotations: { [key: string]: string } = {
      [`name.os.template.kubevirt.io/${template.osLabel}`]: template.osName || '',
      description: template.description || '',
      'openshift.io/display-name': template.displayName || '',
      iconClass: template.iconClass || '',
    };
    if (template.customAnnotations) {
      Object.entries(template.customAnnotations).forEach(([key, value]) => {
        annotations[key] = value;
      });
    }

    // Build metadata
    const metadata: Record<string, unknown> = {
      name: template.name,
      labels,
      annotations,
    };
    if (template.namespace) {
      metadata.namespace = template.namespace;
    }

    // Build VM object
    const vmObject = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        name: '${NAME}',
        annotations: {
          description: template.vmDescription || '',
        },
        labels: {
          app: '${NAME}',
          [`vm.kubevirt.io/template`]: template.name,
          [`os.template.kubevirt.io/${template.osLabel}`]: 'true',
        },
      },
      spec: {
        runStrategy: template.runStrategy || 'Halted',
        template: {
          metadata: {
            annotations: {
              [`vm.kubevirt.io/flavor`]: template.flavor || 'small',
              [`vm.kubevirt.io/os`]: template.os || 'fedora',
              [`vm.kubevirt.io/workload`]: template.workload || 'server',
            },
            labels: {
              'kubevirt.io/domain': '${NAME}',
              'kubevirt.io/size': template.size || 'small',
            },
          },
          spec: {
            domain: {
              cpu: {
                cores: template.cpuCores || 1,
                sockets: template.cpuSockets || 1,
                threads: template.cpuThreads || 1,
                ...(template.dedicatedCpuPlacement && { dedicatedCpuPlacement: true }),
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: template.rootDiskBus || 'virtio',
                    },
                    name: template.rootDiskName || 'rootdisk',
                  },
                  {
                    disk: {
                      bus: template.rootDiskBus || 'virtio',
                    },
                    name: template.cloudInitDiskName || 'cloudinitdisk',
                  },
                  // Add additional disks
                  ...(template.additionalDisks || []).map((disk) => ({
                    disk: {
                      bus: disk.bus || 'virtio',
                    },
                    name: disk.name,
                  })),
                ],
                interfaces: [
                  {
                    masquerade: {},
                    model: template.interfaceModel || 'virtio',
                    name: template.networkName || 'default',
                  },
                ],
                ...(template.networkInterfaceMultiqueue !== false && {
                  networkInterfaceMultiqueue: true,
                }),
                rng: {},
              },
              memory: {
                guest: template.memory || '2Gi',
              },
            },
            hostname: '${NAME}',
            networks: [
              {
                name: template.networkName || 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: template.terminationGracePeriodSeconds || 180,
            ...(template.evictionStrategy && { evictionStrategy: template.evictionStrategy }),
            volumes: [
              this.buildRootDiskVolume(template),
              {
                cloudInitNoCloud: {
                  userData: `#cloud-config
user: ${template.cloudInitUser || 'fedora'}
password: '\${CLOUD_USER_PASSWORD}'
chpasswd: { expire: False }`,
                },
                name: template.cloudInitDiskName || 'cloudinitdisk',
              },
              // Add additional disk volumes
              ...(template.additionalDisks || []).map((disk) =>
                this.buildDiskVolume(disk.name, disk.source),
              ),
            ],
          },
        },
      },
    };

    return {
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata,
      objects: [vmObject],
      parameters,
    };
  }

  /**
   * Create a RHEL server template
   */
  static createRHELServer(name: string, namespace?: string, version = '9'): string {
    return this.create({
      cloudInitUser: 'cloud-user',
      description: `RHEL ${version} server template`,
      displayName: `RHEL ${version} Server`,
      iconClass: 'icon-redhat',
      name,
      namespace,
      os: `rhel${version}`,
      osLabel: `rhel${version}`,
      osName: `RHEL ${version}`,
      rootDiskImage: `quay.io/containerdisks/rhel${version}`,
      workload: 'server',
      workloadLabel: 'server',
    });
  }

  /**
   * Create an Ubuntu server template
   */
  static createUbuntuServer(name: string, namespace?: string, version = '22.04'): string {
    return this.create({
      cloudInitUser: 'ubuntu',
      description: `Ubuntu ${version} server template`,
      displayName: `Ubuntu ${version} Server`,
      iconClass: 'icon-ubuntu',
      name,
      namespace,
      os: 'ubuntu',
      osLabel: 'ubuntu',
      osName: 'Ubuntu',
      rootDiskImage: `quay.io/containerdisks/ubuntu:${version}`,
      workload: 'server',
      workloadLabel: 'server',
    });
  }

  /**
   * Create a Windows desktop template
   */
  static createWindowsDesktop(name: string, namespace?: string, version = '10'): string {
    return this.create({
      cloudInitUser: 'Administrator',
      cpuCores: 2,
      description: `Windows ${version} desktop template`,
      displayName: `Windows ${version} Desktop`,
      flavor: 'medium',
      iconClass: 'icon-windows',
      memory: '8Gi',
      name,
      namespace,
      os: `win${version}`,
      osLabel: `win${version}`,
      osName: `Windows ${version}`,
      rootDiskImage: `quay.io/containerdisks/windows-${version}`,
      size: 'medium',
      workload: 'desktop',
      workloadLabel: 'desktop',
    });
  }

  /**
   * Create a template with custom parameters
   */
  static createWithCustomParameters(
    name: string,
    namespace: string | undefined,
    parameters: TemplateParameter[],
  ): string {
    return this.create({
      additionalParameters: parameters,
      name,
      namespace,
    });
  }
}
