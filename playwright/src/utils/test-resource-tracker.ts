/**
 * Per-test resource tracking and cleanup utility.
 * Tracks Kubernetes resources created during tests and cleans them up automatically.
 */

export type TrackedResourceType =
  | 'ConfigMap'
  | 'DataSource'
  | 'DataVolume'
  | 'ManifestWork'
  | 'MigrationPolicy'
  | 'Namespace'
  | 'NetworkAttachmentDefinition'
  | 'PersistentVolumeClaim'
  | 'Secret'
  | 'Service'
  | 'Template'
  | 'VirtualMachine'
  | 'VirtualMachineClusterInstanceType'
  | 'VirtualMachineClusterPreference'
  | 'VirtualMachineInstanceType'
  | 'VirtualMachinePreference'
  | 'VirtualMachineSnapshot';

export interface TrackedResource {
  name: string;
  namespace?: string;
  type: TrackedResourceType;
  apiGroup: string;
  apiVersion: string;
  plural: string;
  isClusterScoped: boolean;
  trackedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Resource type definitions with API details
 */
const RESOURCE_TYPE_DEFINITIONS: Record<
  TrackedResourceType,
  Omit<TrackedResource, 'name' | 'namespace'>
> = {
  ConfigMap: {
    type: 'ConfigMap',
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'configmaps',
    isClusterScoped: false,
  },
  DataSource: {
    type: 'DataSource',
    apiGroup: 'cdi.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'datasources',
    isClusterScoped: false,
  },
  DataVolume: {
    type: 'DataVolume',
    apiGroup: 'cdi.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'datavolumes',
    isClusterScoped: false,
  },
  ManifestWork: {
    type: 'ManifestWork',
    apiGroup: 'work.open-cluster-management.io',
    apiVersion: 'v1',
    plural: 'manifestworks',
    isClusterScoped: false,
  },
  MigrationPolicy: {
    type: 'MigrationPolicy',
    apiGroup: 'migrations.kubevirt.io',
    apiVersion: 'v1alpha1',
    plural: 'migrationpolicies',
    isClusterScoped: true,
  },
  Namespace: {
    type: 'Namespace',
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'namespaces',
    isClusterScoped: true,
  },
  NetworkAttachmentDefinition: {
    type: 'NetworkAttachmentDefinition',
    apiGroup: 'k8s.cni.cncf.io',
    apiVersion: 'v1',
    plural: 'network-attachment-definitions',
    isClusterScoped: false,
  },
  PersistentVolumeClaim: {
    type: 'PersistentVolumeClaim',
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'persistentvolumeclaims',
    isClusterScoped: false,
  },
  Secret: {
    type: 'Secret',
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'secrets',
    isClusterScoped: false,
  },
  Service: {
    type: 'Service',
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'services',
    isClusterScoped: false,
  },
  Template: {
    type: 'Template',
    apiGroup: 'template.openshift.io',
    apiVersion: 'v1',
    plural: 'templates',
    isClusterScoped: false,
  },
  VirtualMachine: {
    type: 'VirtualMachine',
    apiGroup: 'kubevirt.io',
    apiVersion: 'v1',
    plural: 'virtualmachines',
    isClusterScoped: false,
  },
  VirtualMachineClusterInstanceType: {
    type: 'VirtualMachineClusterInstanceType',
    apiGroup: 'instancetype.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'virtualmachineclusterinstancetypes',
    isClusterScoped: true,
  },
  VirtualMachineClusterPreference: {
    type: 'VirtualMachineClusterPreference',
    apiGroup: 'instancetype.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'virtualmachineclusterpreferences',
    isClusterScoped: true,
  },
  VirtualMachineInstanceType: {
    type: 'VirtualMachineInstanceType',
    apiGroup: 'instancetype.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'virtualmachineinstancetypes',
    isClusterScoped: false,
  },
  VirtualMachinePreference: {
    type: 'VirtualMachinePreference',
    apiGroup: 'instancetype.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'virtualmachinepreferences',
    isClusterScoped: false,
  },
  VirtualMachineSnapshot: {
    type: 'VirtualMachineSnapshot',
    apiGroup: 'snapshot.kubevirt.io',
    apiVersion: 'v1beta1',
    plural: 'virtualmachinesnapshots',
    isClusterScoped: false,
  },
};

export interface CleanupResult {
  resource: TrackedResource;
  success: boolean;
  error?: string;
  duration?: number;
}

export interface CleanupSummary {
  totalResources: number;
  successCount: number;
  failureCount: number;
  results: CleanupResult[];
  duration: number;
}

export interface CleanupOptions {
  continueOnError?: boolean;
  timeoutPerResource?: number;
  verbose?: boolean;
  resourceTypes?: TrackedResourceType[];
  skip?: boolean;
}

export type CleanupCallback = (resource: TrackedResource) => Promise<boolean>;

export class TestResourceTracker {
  private resources: Map<string, TrackedResource> = new Map();
  private testName?: string;

  constructor(testName?: string) {
    this.testName = testName;
  }

  private getResourceKey(type: TrackedResourceType, name: string, namespace?: string): string {
    return namespace ? `${type}/${namespace}/${name}` : `${type}/_cluster_/${name}`;
  }

  track(
    type: TrackedResourceType,
    name: string,
    namespace?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const definition = RESOURCE_TYPE_DEFINITIONS[type];
    const key = this.getResourceKey(type, name, namespace);

    const resource: TrackedResource = {
      ...definition,
      name,
      namespace: definition.isClusterScoped ? undefined : namespace,
      trackedAt: new Date(),
      metadata,
    };

    this.resources.set(key, resource);
  }

  untrack(type: TrackedResourceType, name: string, namespace?: string): boolean {
    const key = this.getResourceKey(type, name, namespace);
    return this.resources.delete(key);
  }

  isTracked(type: TrackedResourceType, name: string, namespace?: string): boolean {
    const key = this.getResourceKey(type, name, namespace);
    return this.resources.has(key);
  }

  getTrackedResources(): TrackedResource[] {
    return Array.from(this.resources.values());
  }

  getResourcesByType(type: TrackedResourceType): TrackedResource[] {
    return this.getTrackedResources().filter((r) => r.type === type);
  }

  get count(): number {
    return this.resources.size;
  }

  clear(): void {
    this.resources.clear();
  }

  trackVirtualMachine(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachine', name, namespace, metadata);
  }

  trackDataVolume(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('DataVolume', name, namespace, metadata);
  }

  trackSecret(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('Secret', name, namespace, metadata);
  }

  trackConfigMap(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('ConfigMap', name, namespace, metadata);
  }

  trackTemplate(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('Template', name, namespace, metadata);
  }

  trackSnapshot(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachineSnapshot', name, namespace, metadata);
  }

  trackMigrationPolicy(name: string, metadata?: Record<string, unknown>): void {
    this.track('MigrationPolicy', name, undefined, metadata);
  }

  trackNamespace(name: string, metadata?: Record<string, unknown>): void {
    this.track('Namespace', name, undefined, metadata);
  }

  trackPVC(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('PersistentVolumeClaim', name, namespace, metadata);
  }

  trackService(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('Service', name, namespace, metadata);
  }

  trackInstanceType(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachineInstanceType', name, namespace, metadata);
  }

  /**
   * Track a ManifestWork for cleanup. Namespace is the managed cluster name (ManifestWork is namespaced under the cluster).
   */
  trackManifestWork(name: string, managedClusterNamespace: string): void {
    this.track('ManifestWork', name, managedClusterNamespace);
  }

  trackClusterInstanceType(name: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachineClusterInstanceType', name, undefined, metadata);
  }

  trackPreference(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachinePreference', name, namespace, metadata);
  }

  trackClusterPreference(name: string, metadata?: Record<string, unknown>): void {
    this.track('VirtualMachineClusterPreference', name, undefined, metadata);
  }

  trackNetworkAttachmentDefinition(
    name: string,
    namespace: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.track('NetworkAttachmentDefinition', name, namespace, metadata);
  }

  trackDataSource(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('DataSource', name, namespace, metadata);
  }

  /**
   * Convenience alias for trackDataSource - bootable volumes are DataSources in Kubernetes
   */
  trackBootableVolume(name: string, namespace: string, metadata?: Record<string, unknown>): void {
    this.track('DataSource', name, namespace, metadata);
  }

  async cleanup(
    deleteCallback: CleanupCallback,
    options: CleanupOptions = {},
  ): Promise<CleanupSummary> {
    const {
      continueOnError = true,
      timeoutPerResource = 30000,
      resourceTypes,
      skip = false,
    } = options;

    const startTime = Date.now();

    // Skip cleanup if requested
    if (skip) {
      return {
        totalResources: this.count,
        successCount: 0,
        failureCount: 0,
        results: [],
        duration: 0,
      };
    }

    if (this.count === 0) {
      return {
        totalResources: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
        duration: 0,
      };
    }

    // Group resources by type for ordered deletion
    const resourceGroups = this.groupResourcesForCleanup(resourceTypes);
    const results: CleanupResult[] = [];

    // Process each group in order
    for (const group of resourceGroups) {
      if (group.resources.length === 0) continue;

      // Delete resources in this group in parallel
      const groupResults = await Promise.allSettled(
        group.resources.map(async (resource) => {
          const resourceStartTime = Date.now();

          try {
            // Create a timeout wrapper
            const deletePromise = deleteCallback(resource);
            const timeoutPromise = new Promise<boolean>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Timeout after ${timeoutPerResource}ms`)),
                timeoutPerResource,
              ),
            );

            const success = await Promise.race([deletePromise, timeoutPromise]);
            const duration = Date.now() - resourceStartTime;

            return {
              resource,
              success,
              duration,
            };
          } catch (error: unknown) {
            const duration = Date.now() - resourceStartTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (!continueOnError) {
              throw error;
            }

            return {
              resource,
              success: false,
              error: errorMessage,
              duration,
            };
          }
        }),
      );

      // Collect results
      for (const settledResult of groupResults) {
        if (settledResult.status === 'fulfilled') {
          results.push(settledResult.value);
        } else {
          // This shouldn't happen with continueOnError=true, but handle it
          results.push({
            resource: group.resources[0], // Best effort
            success: false,
            error: settledResult.reason?.message || 'Unknown error',
          });
        }
      }
    }

    // Calculate summary
    const duration = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Clear tracked resources after cleanup
    this.clear();

    return {
      totalResources: results.length,
      successCount,
      failureCount,
      results,
      duration,
    };
  }

  private groupResourcesForCleanup(resourceTypes?: TrackedResourceType[]): Array<{
    type: TrackedResourceType;
    resources: TrackedResource[];
  }> {
    // Order of deletion (dependencies first)
    const deletionOrder: TrackedResourceType[] = [
      // First: Snapshots (depend on VMs)
      'VirtualMachineSnapshot',
      // Second: VMs (may have associated resources)
      'VirtualMachine',
      // Third: Storage resources
      'DataVolume',
      'DataSource',
      'PersistentVolumeClaim',
      // Fourth: Configuration resources
      'Template',
      'Secret',
      'ConfigMap',
      'Service',
      // Fifth: Instance types and preferences
      'VirtualMachineInstanceType',
      'VirtualMachineClusterInstanceType',
      'VirtualMachinePreference',
      'VirtualMachineClusterPreference',
      // Sixth: Policies
      'MigrationPolicy',
      // Last: Network resources
      'NetworkAttachmentDefinition',
    ];

    // Filter by requested types if specified
    const typesToProcess = resourceTypes
      ? deletionOrder.filter((t) => resourceTypes.includes(t))
      : deletionOrder;

    return typesToProcess.map((type) => ({
      type,
      resources: this.getResourcesByType(type),
    }));
  }
}

export function createResourceTracker(testName?: string): TestResourceTracker {
  return new TestResourceTracker(testName);
}
