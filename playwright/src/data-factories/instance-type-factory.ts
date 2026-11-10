import type { BaseResourceConfig } from './base-data-factory';
import { BaseDataFactory } from './base-data-factory';

/**
 * Data factory for generating VirtualMachineClusterInstancetype YAML configurations
 * Instance types define CPU and memory specifications for VMs
 */

export interface VirtualMachineInstanceTypeConfig extends BaseResourceConfig {
  // CPU configuration
  cpuGuest?: number;

  // Whether to create a cluster-scoped or namespaced instance type
  isClusterScoped?: boolean;

  // Memory configuration
  memoryGuest?: string;
}

export class InstanceTypeFactory extends BaseDataFactory {
  private static defaultConfig: VirtualMachineInstanceTypeConfig = {
    cpuGuest: 1,
    isClusterScoped: true,
    memoryGuest: '2Gi',
    name: 'example',
  };

  /**
   * Generate an InstanceType YAML configuration
   * @param config - Configuration options for the InstanceType (will be merged with defaults)
   * @returns YAML string representation of the InstanceType
   */
  static create(config: Partial<VirtualMachineInstanceTypeConfig> = {}): string {
    const instanceType = this.mergeConfig(this.defaultConfig, config);

    // Determine kind based on scope
    const kind = instanceType.isClusterScoped
      ? 'VirtualMachineClusterInstancetype'
      : 'VirtualMachineInstancetype';

    // Build custom labels and annotations using base class utilities
    const customLabels = this.buildLabelsSection(instanceType.customLabels, 4);
    const customAnnotations = this.buildAnnotationsSection(instanceType.customAnnotations, 4);

    // Build metadata section
    let metadataSection = `metadata:
  name: ${instanceType.name}`;

    // Add namespace only for namespaced instance types
    if (!instanceType.isClusterScoped && instanceType.namespace) {
      metadataSection += `\n  namespace: ${instanceType.namespace}`;
    }

    // Add labels if present
    if (customLabels) {
      metadataSection += `\n  labels:\n${customLabels}`;
    }

    // Add annotations if present
    if (customAnnotations) {
      metadataSection += `\n  annotations:\n${customAnnotations}`;
    }

    const yaml = `apiVersion: instancetype.kubevirt.io/v1beta1
kind: ${kind}
${metadataSection}
spec:
  cpu:
    guest: ${instanceType.cpuGuest}
  memory:
    guest: ${instanceType.memoryGuest}`;

    return yaml;
  }

  /**
   * Create a cluster-scoped instance type with custom resources
   */
  static createClusterScoped(name: string, cpuGuest: number, memoryGuest: string): string {
    return this.create({
      cpuGuest,
      isClusterScoped: true,
      memoryGuest,
      name,
    });
  }

  /**
   * Create an extra large instance type (8 CPUs, 16Gi memory)
   */
  static createExtraLarge(name: string, namespace?: string): string {
    return this.create({
      cpuGuest: 8,
      ...(namespace ? { isClusterScoped: false } : {}),
      memoryGuest: '16Gi',
      name,
      namespace,
    });
  }

  /**
   * Create a large instance type (4 CPUs, 8Gi memory)
   */
  static createLarge(name: string, namespace?: string): string {
    return this.create({
      cpuGuest: 4,
      ...(namespace ? { isClusterScoped: false } : {}),
      memoryGuest: '8Gi',
      name,
      namespace,
    });
  }

  /**
   * Create a medium instance type (2 CPUs, 4Gi memory)
   */
  static createMedium(name: string, namespace?: string): string {
    return this.create({
      cpuGuest: 2,
      ...(namespace ? { isClusterScoped: false } : {}),
      memoryGuest: '4Gi',
      name,
      namespace,
    });
  }

  /**
   * Create a minimal instance type configuration with just required fields
   */
  static createMinimal(name: string, cpuGuest: number, memoryGuest: string): string {
    return this.create({
      cpuGuest,
      memoryGuest,
      name,
    });
  }

  /**
   * Create a namespaced instance type (instead of cluster-scoped)
   */
  static createNamespaced(
    name: string,
    namespace: string,
    cpuGuest: number,
    memoryGuest: string,
  ): string {
    return this.create({
      cpuGuest,
      isClusterScoped: false,
      memoryGuest,
      name,
      namespace,
    });
  }

  /**
   * Create a small instance type (1 CPU, 2Gi memory)
   */
  static createSmall(name: string, namespace?: string): string {
    return this.create({
      cpuGuest: 1,
      ...(namespace ? { isClusterScoped: false } : {}),
      memoryGuest: '2Gi',
      name,
      namespace,
    });
  }

  /**
   * Create an instance type with custom labels and annotations
   */
  static createWithMetadata(
    name: string,
    cpuGuest: number,
    memoryGuest: string,
    labels?: Record<string, string>,
    annotations?: Record<string, string>,
    namespace?: string,
  ): string {
    return this.create({
      cpuGuest,
      customAnnotations: annotations,
      customLabels: labels,
      memoryGuest,
      name,
      namespace,
    });
  }
}
