import type {
  JsonPatchOp,
  KubernetesCondition,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

type HcoVersionEntry = {
  name?: string;
  version?: string;
};

export class HyperConvergedHandler {
  private static readonly JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';

  constructor(private readonly ctx: KubernetesHandlerContext) {}

  /**
   * Disable the native VM template feature gate by removing the
   * `kubevirt.kubevirt.io/jsonpatch` annotation from the HCO CR.
   *
   * No-op if the annotation is not present.
   */
  async disableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    if (!(await this.isNativeVmTemplateFeatureGateEnabled(name, namespace))) {
      return true;
    }
    const annotationPath = `/metadata/annotations/${HyperConvergedHandler.JSONPATCH_ANNOTATION.replace(
      '/',
      '~1',
    )}`;
    try {
      await this.patchHyperConverged(name, namespace, [
        { op: 'replace', path: annotationPath, value: '[]' },
      ]);
      return true;
    } catch (error: unknown) {
      throw new Error(
        `Failed to disable native VM template feature gate: ${getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Enable the native VM template feature gate by setting the
   * `kubevirt.kubevirt.io/jsonpatch` annotation on the HCO CR.
   *
   * The annotation instructs the HCO to add "Template" to
   * `/spec/configuration/developerConfiguration/featureGates` on the
   * KubeVirt CR.
   *
   * No-op if the feature gate is already enabled.
   */
  async enableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    if (await this.isNativeVmTemplateFeatureGateEnabled(name, namespace)) {
      return true;
    }
    const annotationPath = `/metadata/annotations/${HyperConvergedHandler.JSONPATCH_ANNOTATION.replace(
      '/',
      '~1',
    )}`;
    const featureGateValue = JSON.stringify([
      {
        op: 'add',
        path: '/spec/configuration/developerConfiguration/featureGates/-',
        value: 'Template',
      },
    ]);

    try {
      await this.patchHyperConverged(name, namespace, [
        { op: 'add', path: '/metadata/annotations', value: {} },
        { op: 'add', path: annotationPath, value: featureGateValue },
      ]);
      return true;
    } catch {
      try {
        await this.patchHyperConverged(name, namespace, [
          { op: 'replace', path: annotationPath, value: featureGateValue },
        ]);
        return true;
      } catch (error: unknown) {
        throw new Error(
          `Failed to enable native VM template feature gate: ${getErrorMessage(error)}`,
        );
      }
    }
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

  /**
   * Check whether the "Template" feature gate is already present in the
   * `kubevirt.kubevirt.io/jsonpatch` annotation on the HCO CR.
   */
  async isNativeVmTemplateFeatureGateEnabled(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    try {
      const hco = await this.getHyperConverged(name, namespace);
      if (!hco) return false;
      const annotation =
        hco.metadata?.annotations?.[HyperConvergedHandler.JSONPATCH_ANNOTATION] ?? '';
      if (!annotation) return false;
      const ops = JSON.parse(annotation) as Array<{ value?: string }>;
      return ops.some((op) => op.value === 'Template');
    } catch {
      return false;
    }
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
    } catch (error) {
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
    actualParallelMigrationsPerCluster?: string | number;
    actualParallelOutboundMigrationsPerNode?: string | number;
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
          | string
          | number
          | undefined,
        actualParallelOutboundMigrationsPerNode: actualParallelOutboundMigrationsPerNode as
          | string
          | number
          | undefined,
      };
    } catch (error) {
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
    actualMemoryOvercommitPercentage?: string | number;
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
              | string
              | number
              | undefined,
          };
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        } else {
          return {
            memoryOvercommitPercentage: false,
            actualMemoryOvercommitPercentage: actualMemoryOvercommitPercentage as
              | string
              | number
              | undefined,
          };
        }
      } catch (error) {
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
