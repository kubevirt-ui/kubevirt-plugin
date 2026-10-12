import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

/**
 * Data factory for generating MigrationPolicy YAML configurations
 * Migration policies define migration settings and selectors for VMs and namespaces
 */

export interface MigrationPolicyConfig extends BaseResourceConfig {
  // Migration configuration options
  allowAutoConverge?: boolean;

  allowPostCopy?: boolean;
  bandwidthPerMigration?: string;
  completionTimeoutPerGiB?: number;
  description?: string;

  namespaceSelector?: Record<string, string>;
  // Selector configurations
  virtualMachineInstanceSelector?: Record<string, string>;
}

export class MigrationPolicyFactory extends BaseDataFactory {
  private static defaultConfig: MigrationPolicyConfig = {
    name: 'example',
  };

  /**
   * Generate a MigrationPolicy YAML configuration
   * @param config - Configuration options for the MigrationPolicy (will be merged with defaults)
   * @returns YAML string representation of the MigrationPolicy
   */
  static create(config: Partial<MigrationPolicyConfig> = {}): string {
    const policy = this.mergeConfig(this.defaultConfig, config);

    // Build custom labels and annotations using base class utilities
    const customLabels = this.buildLabelsSection(policy.customLabels, 4);
    const customAnnotations = this.buildAnnotationsSection(policy.customAnnotations, 4);

    // Build metadata section
    let metadataSection = `metadata:
  name: ${policy.name}`;

    // Add namespace if provided
    if (policy.namespace) {
      metadataSection += `\n  namespace: ${policy.namespace}`;
    }

    // Add annotations section if description or custom annotations exist
    if (policy.description || customAnnotations) {
      metadataSection += '\n  annotations:';
      if (policy.description) {
        // Quote the value if it contains ': ' to prevent YAML mapping mis-parse.
        const needsQuotes = policy.description.includes(': ') || policy.description.includes('#');
        const descValue = needsQuotes
          ? `"${policy.description.replace(/"/g, '\\"')}"`
          : policy.description;
        metadataSection += `\n    description: ${descValue}`;
      }
      if (customAnnotations) {
        metadataSection += `\n${customAnnotations}`;
      }
    }

    // Add labels if present
    if (customLabels) {
      metadataSection += `\n  labels:\n${customLabels}`;
    }

    // Build spec section
    let specSection = 'spec:';

    // Add migration configuration options
    if (policy.allowAutoConverge !== undefined) {
      specSection += `\n  allowAutoConverge: ${policy.allowAutoConverge}`;
    }

    if (policy.allowPostCopy !== undefined) {
      specSection += `\n  allowPostCopy: ${policy.allowPostCopy}`;
    }

    if (policy.bandwidthPerMigration !== undefined) {
      specSection += `\n  bandwidthPerMigration: ${policy.bandwidthPerMigration}`;
    }

    if (policy.completionTimeoutPerGiB !== undefined) {
      specSection += `\n  completionTimeoutPerGiB: ${policy.completionTimeoutPerGiB}`;
    }

    // Build selectors section
    const hasVMISelector =
      policy.virtualMachineInstanceSelector &&
      Object.keys(policy.virtualMachineInstanceSelector).length > 0;
    const hasNSSelector =
      policy.namespaceSelector && Object.keys(policy.namespaceSelector).length > 0;

    if (hasVMISelector || hasNSSelector) {
      specSection += '\n  selectors:';

      if (hasVMISelector) {
        specSection += '\n    virtualMachineInstanceSelector:';
        Object.entries(policy.virtualMachineInstanceSelector).forEach(([key, value]) => {
          specSection += `\n      ${key}: ${value}`;
        });
      }

      if (hasNSSelector) {
        specSection += '\n    namespaceSelector:';
        Object.entries(policy.namespaceSelector).forEach(([key, value]) => {
          specSection += `\n      ${key}: ${value}`;
        });
      }
    } else {
      specSection += '\n  selectors: {}';
    }

    const yaml = `apiVersion: migrations.kubevirt.io/v1alpha1
kind: MigrationPolicy
${metadataSection}
${specSection}`;

    return yaml;
  }

  /**
   * Create a comprehensive migration policy with all options
   */
  static createComprehensive(
    name: string,
    config: {
      allowAutoConverge?: boolean;
      allowPostCopy?: boolean;
      bandwidthPerMigration?: string;
      completionTimeoutPerGiB?: number;
      description?: string;
      namespace?: string;
      namespaceSelector?: Record<string, string>;
      vmSelector?: Record<string, string>;
    },
  ): string {
    return this.create({
      allowAutoConverge: config.allowAutoConverge,
      allowPostCopy: config.allowPostCopy,
      bandwidthPerMigration: config.bandwidthPerMigration,
      completionTimeoutPerGiB: config.completionTimeoutPerGiB,
      description: config.description || `Comprehensive migration policy: ${name}`,
      name,
      namespace: config.namespace,
      namespaceSelector: config.namespaceSelector,
      virtualMachineInstanceSelector: config.vmSelector,
    });
  }

  /**
   * Create a migration policy with all configuration options
   */
  static createFullConfig(
    name: string,
    allowAutoConverge: boolean,
    allowPostCopy: boolean,
    bandwidthPerMigration: string,
    completionTimeoutPerGiB: number,
    namespace?: string,
  ): string {
    return this.create({
      allowAutoConverge,
      allowPostCopy,
      bandwidthPerMigration,
      completionTimeoutPerGiB,
      description: `Migration policy with full configuration: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a minimal migration policy configuration with just required fields
   */
  static createMinimal(name: string, namespace?: string): string {
    return this.create({
      name,
      namespace,
    });
  }

  /**
   * Create a migration policy with auto-converge enabled
   */
  static createWithAutoConverge(name: string, namespace?: string): string {
    return this.create({
      allowAutoConverge: true,
      description: `Migration policy with auto-converge: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a migration policy with bandwidth limit
   */
  static createWithBandwidthLimit(
    name: string,
    bandwidthPerMigration: string,
    namespace?: string,
  ): string {
    return this.create({
      bandwidthPerMigration,
      description: `Migration policy with bandwidth limit: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a migration policy with both VM and namespace selectors
   */
  static createWithBothSelectors(
    name: string,
    vmSelector: Record<string, string>,
    namespaceSelector: Record<string, string>,
    namespace?: string,
  ): string {
    return this.create({
      description: `Migration policy with both selectors: ${name}`,
      name,
      namespace,
      namespaceSelector,
      virtualMachineInstanceSelector: vmSelector,
    });
  }

  /**
   * Create a migration policy with completion timeout
   */
  static createWithCompletionTimeout(
    name: string,
    completionTimeoutPerGiB: number,
    namespace?: string,
  ): string {
    return this.create({
      completionTimeoutPerGiB,
      description: `Migration policy with completion timeout: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a migration policy with namespace selector
   */
  static createWithNamespaceSelector(
    name: string,
    namespaceSelector: Record<string, string>,
    namespace?: string,
  ): string {
    return this.create({
      description: `Migration policy with namespace selector: ${name}`,
      name,
      namespace,
      namespaceSelector,
    });
  }

  /**
   * Create a migration policy with post-copy enabled
   */
  static createWithPostCopy(name: string, namespace?: string): string {
    return this.create({
      allowPostCopy: true,
      description: `Migration policy with post-copy: ${name}`,
      name,
      namespace,
    });
  }

  /**
   * Create a migration policy with VM selector
   */
  static createWithVMSelector(
    name: string,
    vmSelector: Record<string, string>,
    namespace?: string,
  ): string {
    return this.create({
      description: `Migration policy with VM selector: ${name}`,
      name,
      namespace,
      virtualMachineInstanceSelector: vmSelector,
    });
  }
}
