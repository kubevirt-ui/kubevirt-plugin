import type {
  JsonPatchOp,
  KubernetesCondition,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

interface HcoVersionEntry {
  name?: string;
  version?: string;
}

export class HyperConvergedHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async getHyperConvergedStatusAndVersion(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<{ status: string; version: string | undefined }> {
    const hco = await this.getHyperConverged(name, namespace);
    const status = hco?.status as Record<string, unknown> | undefined;
    let statusText = 'Unknown';
    const conditions = (status?.conditions as KubernetesCondition[] | undefined) ?? [];
    const degraded = conditions.find((c) => c.type === 'Degraded' && c.status === 'True');
    const available = conditions.find((c) => c.type === 'Available' && c.status === 'True');
    if (degraded) statusText = 'Degraded';
    else if (available) statusText = 'Healthy';
    const versions = (status?.versions as HcoVersionEntry[] | undefined) ?? [];
    const versionEntry =
      versions.find((v) => v.name === 'cnv' || v.name === 'openshift-cnv') ??
      versions.find((v) => v.name === 'kubevirt');
    const version = versionEntry?.version;
    return { status: statusText, version };
  }

  async getHyperConverged(name = 'kubevirt-hyperconverged', namespace = 'openshift-cnv') {
    return await this.ctx.getCustomResource(
      'hco.kubevirt.io',
      'v1beta1',
      namespace,
      'hyperconvergeds',
      name,
    );
  }

  async patchHyperConverged(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
    patchOps: JsonPatchOp[],
  ) {
    try {
      const patchApi = this.ctx.customObjectsApi as unknown as {
        patchNamespacedCustomObject: (
          request: {
            group: string;
            version: string;
            namespace: string;
            plural: string;
            name: string;
            body: unknown;
            dryRun?: string;
            fieldManager?: string;
            fieldValidation?: string;
          },
          contentType?: string,
          options?: { headers?: Record<string, string> },
        ) => Promise<{ body?: KubernetesResource } | KubernetesResource>;
      };
      const response = await patchApi.patchNamespacedCustomObject(
        {
          group: 'hco.kubevirt.io',
          version: 'v1beta1',
          namespace: namespace,
          plural: 'hyperconvergeds',
          name: name,
          body: patchOps,
          dryRun: undefined,
          fieldManager: undefined,
          fieldValidation: undefined,
        },
        'json',
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
        },
      );
      const r = response as { body?: KubernetesResource } | KubernetesResource;
      return ('body' in r && r.body !== undefined ? r.body : r) as KubernetesResource;
    } catch (error: unknown) {
      const statusCode =
        (typeof error === 'object' && error !== null && 'statusCode' in error
          ? (error as { statusCode?: number }).statusCode
          : undefined) ??
        (typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { statusCode?: number } }).response?.statusCode
          : undefined);
      const newError = new Error(
        `Failed to patch HyperConverged ${name}: ${getErrorMessage(error)}`,
      ) as Error & { statusCode?: number };
      newError.statusCode = statusCode;
      throw newError;
    }
  }

  async getHyperConvergedField(
    jsonPath: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<string | undefined> {
    const hco = await this.getHyperConverged(name, namespace);

    const cleanPath = jsonPath.startsWith('.') ? jsonPath.slice(1) : jsonPath;
    const pathParts = cleanPath.split('.');

    let value: unknown = hco;
    for (const part of pathParts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value =
        typeof value === 'object' && value !== null && part in value
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }

    return value !== undefined && value !== null ? String(value) : undefined;
  }

  async verifyHCOSpec(
    jsonPath: string,
    expectedValue: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    try {
      const hco = await this.getHyperConverged(name, namespace);

      if (!hco) {
        return false;
      }

      const pathParts = jsonPath.split('.').filter((part) => part && part !== 'spec');
      let current: unknown = hco.spec || hco;

      for (const part of pathParts) {
        if (
          current &&
          typeof current === 'object' &&
          part in (current as Record<string, unknown>)
        ) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return false;
        }
      }

      const actualValue = String(current ?? '');
      return actualValue.includes(expectedValue);
    } catch (_error) {
      return false;
    }
  }

  async verifyLiveMigrationLimits(
    expectedParallelMigrationsPerCluster: string,
    expectedParallelOutboundMigrationsPerNode: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<{
    parallelMigrationsPerCluster: boolean;
    parallelOutboundMigrationsPerNode: boolean;
    actualParallelMigrationsPerCluster?: number | string;
    actualParallelOutboundMigrationsPerNode?: number | string;
  }> {
    try {
      const hco = await this.getHyperConverged(name, namespace);

      if (!hco) {
        throw new Error('HCO resource is undefined');
      }

      const liveMigrationConfig = (hco.spec?.['liveMigrationConfig'] ?? {}) as Record<
        string,
        unknown
      >;

      const actualParallelMigrationsPerCluster =
        liveMigrationConfig['parallelMigrationsPerCluster'];
      const actualParallelOutboundMigrationsPerNode =
        liveMigrationConfig['parallelOutboundMigrationsPerNode'];

      const actualClusterStr = String(actualParallelMigrationsPerCluster ?? '');
      const actualNodeStr = String(actualParallelOutboundMigrationsPerNode ?? '');

      const clusterMatches = actualClusterStr === expectedParallelMigrationsPerCluster;
      const nodeMatches = actualNodeStr === expectedParallelOutboundMigrationsPerNode;

      return {
        parallelMigrationsPerCluster: clusterMatches,
        parallelOutboundMigrationsPerNode: nodeMatches,
        actualParallelMigrationsPerCluster: actualParallelMigrationsPerCluster as
          | number
          | string
          | undefined,
        actualParallelOutboundMigrationsPerNode: actualParallelOutboundMigrationsPerNode as
          | number
          | string
          | undefined,
      };
    } catch (_error) {
      return {
        parallelMigrationsPerCluster: false,
        parallelOutboundMigrationsPerNode: false,
      };
    }
  }

  async verifyMemoryDensity(
    expectedMemoryOvercommitPercentage: string,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
    maxRetries = 10,
    retryInterval = 2000,
  ): Promise<{
    memoryOvercommitPercentage: boolean;
    actualMemoryOvercommitPercentage?: number | string;
  }> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const hco = await this.getHyperConverged(name, namespace);

        if (!hco) {
          throw new Error('HCO resource is undefined');
        }

        const higherWorkloadDensity = (hco.spec?.['higherWorkloadDensity'] ?? {}) as Record<
          string,
          unknown
        >;

        const actualMemoryOvercommitPercentage =
          higherWorkloadDensity['memoryOvercommitPercentage'];

        const actualPercentageStr = String(actualMemoryOvercommitPercentage ?? '');

        const matches = actualPercentageStr === expectedMemoryOvercommitPercentage;

        if (matches) {
          return {
            memoryOvercommitPercentage: true,
            actualMemoryOvercommitPercentage: actualMemoryOvercommitPercentage as
              | number
              | string
              | undefined,
          };
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        } else {
          return {
            memoryOvercommitPercentage: false,
            actualMemoryOvercommitPercentage: actualMemoryOvercommitPercentage as
              | number
              | string
              | undefined,
          };
        }
      } catch (_error) {
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        } else {
          return {
            memoryOvercommitPercentage: false,
          };
        }
      }
    }

    return {
      memoryOvercommitPercentage: false,
    };
  }
}
