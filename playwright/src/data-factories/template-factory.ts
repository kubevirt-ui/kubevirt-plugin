import type { KubernetesResource } from '@/data-models/kubernetes-types';

import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';
import {
  createCustomResourcesTemplate,
  createFedoraServerTemplate,
  createHighPerformanceTemplate,
  createMinimalTemplate,
  createRHELServerTemplate,
  createUbuntuServerTemplate,
  createWindowsDesktopTemplate,
  createWithCustomParametersTemplate,
} from './template-presets';
import {
  buildParametersSection,
  buildTemplateParameters,
  buildTemplateVmObject,
  DEFAULT_TEMPLATE_CONFIG,
} from './template-yaml-helpers';

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
  | TemplateDiskSourceDataVolume
  | TemplateDiskSourcePVC;

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
  private static defaultConfig: TemplateConfig = DEFAULT_TEMPLATE_CONFIG;

  /**
   * Generate a Template resource object (for use with Kubernetes API)
   * @param config - Configuration options for the Template (will be merged with defaults)
   * @returns Template resource object
   */
  static createResourceObject(config: Partial<TemplateConfig> = {}): KubernetesResource {
    const template = this.mergeConfig(this.defaultConfig, config);
    const parameters = buildTemplateParameters(template);

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

    const metadata: Record<string, unknown> = {
      name: template.name,
      labels,
      annotations,
    };
    if (template.namespace) {
      metadata.namespace = template.namespace;
    }

    return {
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata,
      objects: [buildTemplateVmObject(template)],
      parameters,
    };
  }

  /**
   * Generate a Template YAML configuration
   * @param config - Configuration options for the Template (will be merged with defaults)
   * @returns YAML string representation of the Template
   */
  static create(config: Partial<TemplateConfig> = {}): string {
    const template = this.mergeConfig(this.defaultConfig, config);

    const customLabels = this.buildLabelsSection(template.customLabels, 4);
    const customAnnotations = this.buildAnnotationsSection(template.customAnnotations, 4);
    const parameters = buildParametersSection(template);

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
    description: '${template.description}'
    openshift.io/display-name: '${template.displayName}'
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
      template.evictionStrategy ? `\n          evictionStrategy: ${template.evictionStrategy}` : ''
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

  static createCustomResources(
    name: string,
    cpuCores: number,
    memory: string,
    namespace?: string,
  ): string {
    return createCustomResourcesTemplate(this.create.bind(this), name, cpuCores, memory, namespace);
  }

  static createFedoraServer(name: string, namespace?: string): string {
    return createFedoraServerTemplate(this.create.bind(this), name, namespace);
  }

  static createHighPerformance(name: string, namespace?: string): string {
    return createHighPerformanceTemplate(this.create.bind(this), name, namespace);
  }

  static createMinimal(name: string, namespace?: string): string {
    return createMinimalTemplate(this.create.bind(this), name, namespace);
  }

  static createRHELServer(name: string, namespace?: string, version = '9'): string {
    return createRHELServerTemplate(this.create.bind(this), name, namespace, version);
  }

  static createUbuntuServer(name: string, namespace?: string, version = '22.04'): string {
    return createUbuntuServerTemplate(this.create.bind(this), name, namespace, version);
  }

  static createWindowsDesktop(name: string, namespace?: string, version = '10'): string {
    return createWindowsDesktopTemplate(this.create.bind(this), name, namespace, version);
  }

  static createWithCustomParameters(
    name: string,
    namespace: string | undefined,
    parameters: TemplateParameter[],
  ): string {
    return createWithCustomParametersTemplate(this.create.bind(this), name, namespace, parameters);
  }
}
