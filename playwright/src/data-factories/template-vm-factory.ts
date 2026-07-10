import type { TemplateSelectorConfig } from '@/data-models/template-vm-test-fixtures';

import { generateRandomVmName } from '../utils/random-data-generator';

import type { VirtualMachineConfig } from './virtual-machine-factory';

/**
 * Configuration interface for template-based VM creation
 */
export interface TemplateVmConfig extends VirtualMachineConfig {
  /** Template selector configuration */
  templateSelector: TemplateSelectorConfig;
}

/**
 * Factory for creating template-based VM configurations
 */
export class TemplateVmFactory {
  /**
   * Create a VM configuration based on template selection
   * This method generates VM configuration that would be created from the selected template
   */
  static createVmFromTemplate(
    templateConfig: TemplateSelectorConfig,
    vmOverrides: Partial<VirtualMachineConfig> = {},
  ): VirtualMachineConfig {
    // Base configuration based on template
    const baseConfig: VirtualMachineConfig = {
      // Default VM configuration
      name: 'template-vm',
      namespace: 'default',
      description: `VM created from ${templateConfig.templateName} template`,

      // OS-specific configuration
      os: templateConfig.os,
      osLabel: templateConfig.os,
      workload: templateConfig.workload,

      // Size-based resource allocation
      ...this.getSizeBasedResources(templateConfig.size),

      // Template-specific image and user configuration
      ...this.getTemplateSpecificConfig(templateConfig),

      // Default run strategy
      runStrategy: 'Always',
    };

    // Merge with overrides
    return {
      ...baseConfig,
      ...vmOverrides,
    };
  }

  /**
   * Generate a unique VM name with template prefix
   */
  static generateVmName(templateConfig: TemplateSelectorConfig, prefix = 'template-vm'): string {
    const osShort = templateConfig.os.replace('-', '');
    return generateRandomVmName(`${prefix}-${osShort}`);
  }

  /**
   * Get all available template configurations
   */
  static getAvailableTemplates(): TemplateSelectorConfig[] {
    return [
      {
        templateTestId: 'rhel7-server-small',
        templateName: 'RHEL7 Server Small',
        os: 'rhel7',
        workload: 'server',
        size: 'small',
      },
      {
        templateTestId: 'fedora-server-small',
        templateName: 'Fedora Server Small',
        os: 'fedora',
        workload: 'server',
        size: 'small',
      },
      {
        templateTestId: 'centos-stream9-server-small',
        templateName: 'CentOS Stream9 Server Small',
        os: 'centos-stream9',
        workload: 'server',
        size: 'small',
      },
      {
        templateTestId: 'rhel8-server-small',
        templateName: 'RHEL8 Server Small',
        os: 'rhel8',
        workload: 'server',
        size: 'small',
      },
    ];
  }

  /**
   * Get resource configuration based on template size
   */
  private static getSizeBasedResources(size: string): Partial<VirtualMachineConfig> {
    switch (size) {
      case 'small':
        return {
          cpuCores: 1,
          memory: '2Gi',
          flavor: 'small',
          size: 'small',
        };
      case 'medium':
        return {
          cpuCores: 2,
          memory: '4Gi',
          flavor: 'medium',
          size: 'medium',
        };
      case 'large':
        return {
          cpuCores: 4,
          memory: '8Gi',
          flavor: 'large',
          size: 'large',
        };
      default:
        return {
          cpuCores: 2,
          memory: '4Gi',
          flavor: 'medium',
          size: 'medium',
        };
    }
  }

  /**
   * Get template display name for logging and test descriptions
   */
  static getTemplateDisplayName(templateConfig: TemplateSelectorConfig): string {
    return templateConfig.templateName;
  }

  /**
   * Get the data-test-id selector for template selection
   */
  static getTemplateSelector(templateConfig: TemplateSelectorConfig): string {
    return `[data-test-id="${templateConfig.templateTestId}"]`;
  }

  /**
   * Get template-specific configuration (images, users, etc.)
   */
  private static getTemplateSpecificConfig(
    templateConfig: TemplateSelectorConfig,
  ): Partial<VirtualMachineConfig> {
    const config: Partial<VirtualMachineConfig> = {};

    // OS-specific image and user configuration
    switch (templateConfig.os) {
      case 'rhel7':
        config.rootDiskImage = 'quay.io/containerdisks/rhel7';
        config.cloudInitUser = 'cloud-user';
        break;
      case 'rhel8':
        config.rootDiskImage = 'quay.io/containerdisks/rhel8';
        config.cloudInitUser = 'cloud-user';
        break;
      case 'fedora':
        config.rootDiskImage = 'quay.io/containerdisks/fedora';
        config.cloudInitUser = 'fedora';
        break;
      case 'centos-stream9':
        config.rootDiskImage = 'quay.io/containerdisks/centos-stream:9';
        config.cloudInitUser = 'centos';
        break;
    }

    return config;
  }

  /**
   * Validate template configuration
   */
  static validateTemplateConfig(templateConfig: TemplateSelectorConfig): boolean {
    const requiredFields = ['templateTestId', 'templateName', 'os', 'workload', 'size'];
    return requiredFields.every((field) => templateConfig[field as keyof TemplateSelectorConfig]);
  }
}
