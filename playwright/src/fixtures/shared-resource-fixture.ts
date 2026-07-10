/**
 * @deprecated Shared Resource Fixture - No longer used.
 * All tests now follow the self-contained pattern: each test creates its own
 * namespace, resources, and tracks cleanup via the `cleanup` fixture.
 * See `.cursor/rules/test-isolation.mdc` for the architecture rule.
 *
 * This file is retained temporarily for backward compatibility but should not
 * be used in new tests.
 */

import { getKubernetesClient } from '@/clients/kubernetes-client-singleton';
import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';

/**
 * @deprecated Legacy duck-typed client passed into SharedResourceManager.
 * Older code paths expected methods that are not modeled on KubernetesClient alone.
 */
export interface SharedResourceKubernetesSteps {
  createVmFromTemplate(
    templateName: string,
    vmName: string,
    namespace: string,
    templateProvider: string,
    running: boolean,
  ): Promise<void>;
  verifyVmCreatedWithToken(
    vmName: string,
    namespace: string,
    timeout: number,
  ): Promise<{ exists: boolean }>;
  waitForVmReady(vmName: string, namespace: string, timeout: number): Promise<void>;
  dataVolumeExists(name: string, namespace: string): Promise<boolean>;
  createDataVolume(
    dvName: string,
    namespace: string,
    opts: {
      sourceUrl?: string;
      size?: string;
      storageClassName?: string;
    },
  ): Promise<void>;
}

export interface SharedVmConfig {
  templateName: string;
  running?: boolean;
  templateProvider?: string;
  prefix?: string;
}

export interface SharedDataVolumeConfig {
  prefix?: string;
  sourceUrl?: string;
  size?: string;
  storageClassName?: string;
}

interface SharedResource {
  name: string;
  namespace: string;
  type: 'VirtualMachine' | 'DataVolume' | 'Template';
  configKey: string;
  createdAt: Date;
  lastUsedAt: Date;
  isReady: boolean;
}

export interface SharedResourceResult {
  name: string;
  namespace: string;
  isNew: boolean;
}

export class SharedResourceManager {
  private isInitialized = false;
  private kubernetesSteps: SharedResourceKubernetesSteps | null = null;
  private namespace: string;
  private resources: Map<string, SharedResource> = new Map();

  constructor() {
    const testConfig = TestConfigManager.getConfig();
    this.namespace = testConfig.testNamespace || EnvVariables.testNamespace;
  }

  private generateSharedName(prefix: string, configKey: string): string {
    const hash = this.simpleHash(configKey);
    return `${prefix}-${hash}`.toLowerCase().slice(0, 63);
  }

  private getConfigKey(type: string, config: Record<string, unknown>): string {
    const sortedConfig = Object.keys(config)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = config[key];
          return acc;
        },
        {} as Record<string, unknown>,
      );
    return `${type}:${JSON.stringify(sortedConfig)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 8);
  }

  private async verifyVmExists(name: string, namespace: string): Promise<boolean> {
    try {
      const client = getKubernetesClient();
      if (!client) {
        return false;
      }

      const vm = await client.getCustomResource(
        'kubevirt.io',
        'v1',
        namespace,
        'virtualmachines',
        name,
      );

      return !!vm;
    } catch {
      return false;
    }
  }

  async cleanupAll(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const client = getKubernetesClient();
    if (!client) {
      return { success, failed: this.resources.size };
    }

    for (const resource of Array.from(this.resources.values())) {
      try {
        if (resource.type === 'VirtualMachine') {
          await client.deleteCustomResource(
            'kubevirt.io',
            'v1',
            resource.namespace,
            'virtualmachines',
            resource.name,
          );
        } else if (resource.type === 'DataVolume') {
          await client.deleteCustomResource(
            'cdi.kubevirt.io',
            'v1beta1',
            resource.namespace,
            'datavolumes',
            resource.name,
          );
        }
        success++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          success++;
        } else {
          failed++;
        }
      }
    }

    this.resources.clear();
    return { success, failed };
  }

  get count(): number {
    return this.resources.size;
  }

  async getSharedDataVolume(config: SharedDataVolumeConfig): Promise<SharedResourceResult> {
    if (!this.isInitialized || !this.kubernetesSteps) {
      throw new Error('SharedResourceManager not initialized. Ensure kubernetesSteps is provided.');
    }

    const { prefix = 'shared-dv', sourceUrl, size = '10Gi', storageClassName } = config;

    const configKey = this.getConfigKey('DataVolume', {
      sourceUrl,
      size,
      storageClassName,
    });

    const existing = this.resources.get(configKey);
    if (existing && existing.isReady) {
      existing.lastUsedAt = new Date();
      return {
        name: existing.name,
        namespace: existing.namespace,
        isNew: false,
      };
    }

    const dvName = this.generateSharedName(prefix, configKey);

    const alreadyExists = await this.kubernetesSteps.dataVolumeExists(dvName, this.namespace);
    if (alreadyExists) {
      const resource: SharedResource = {
        name: dvName,
        namespace: this.namespace,
        type: 'DataVolume',
        configKey,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isReady: true,
      };
      this.resources.set(configKey, resource);

      return {
        name: dvName,
        namespace: this.namespace,
        isNew: false,
      };
    }

    await this.kubernetesSteps.createDataVolume(dvName, this.namespace, {
      sourceUrl,
      size,
      storageClassName,
    });

    const resource: SharedResource = {
      name: dvName,
      namespace: this.namespace,
      type: 'DataVolume',
      configKey,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      isReady: true,
    };
    this.resources.set(configKey, resource);

    return {
      name: dvName,
      namespace: this.namespace,
      isNew: true,
    };
  }

  async getSharedVm(config: SharedVmConfig): Promise<SharedResourceResult> {
    if (!this.isInitialized || !this.kubernetesSteps) {
      throw new Error('SharedResourceManager not initialized. Ensure kubernetesSteps is provided.');
    }

    const {
      templateName,
      running = true,
      templateProvider = 'openshift',
      prefix = 'shared-vm',
    } = config;

    const configKey = this.getConfigKey('VirtualMachine', {
      templateName,
      running,
      templateProvider,
    });

    const existing = this.resources.get(configKey);
    if (existing && existing.isReady) {
      const exists = await this.verifyVmExists(existing.name, existing.namespace);
      if (exists) {
        existing.lastUsedAt = new Date();
        return {
          name: existing.name,
          namespace: existing.namespace,
          isNew: false,
        };
      }
      this.resources.delete(configKey);
    }

    const vmName = this.generateSharedName(prefix, configKey);

    const alreadyExists = await this.verifyVmExists(vmName, this.namespace);
    if (alreadyExists) {
      const resource: SharedResource = {
        name: vmName,
        namespace: this.namespace,
        type: 'VirtualMachine',
        configKey,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isReady: true,
      };
      this.resources.set(configKey, resource);

      return {
        name: vmName,
        namespace: this.namespace,
        isNew: false,
      };
    }

    await this.kubernetesSteps.createVmFromTemplate(
      templateName,
      vmName,
      this.namespace,
      templateProvider,
      running,
    );

    const verifyResult = await this.kubernetesSteps.verifyVmCreatedWithToken(
      vmName,
      this.namespace,
      TestTimeouts.VM_BOOTUP,
    );

    if (!verifyResult.exists) {
      throw new Error(`Failed to create shared VM: ${vmName}`);
    }

    if (running) {
      await this.kubernetesSteps.waitForVmReady(vmName, this.namespace, TestTimeouts.VM_BOOTUP);
    }

    const resource: SharedResource = {
      name: vmName,
      namespace: this.namespace,
      type: 'VirtualMachine',
      configKey,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      isReady: true,
    };
    this.resources.set(configKey, resource);

    return {
      name: vmName,
      namespace: this.namespace,
      isNew: true,
    };
  }

  getTrackedResources(): SharedResource[] {
    return Array.from(this.resources.values());
  }

  initialize(kubernetesSteps: SharedResourceKubernetesSteps): void {
    this.kubernetesSteps = kubernetesSteps;
    this.isInitialized = true;
  }
}

export interface SharedResourceFixture {
  getSharedVm(config: SharedVmConfig): Promise<SharedResourceResult>;
  getSharedDataVolume(config: SharedDataVolumeConfig): Promise<SharedResourceResult>;
  getTrackedResources(): Array<{
    name: string;
    namespace: string;
    type: string;
  }>;
  readonly count: number;
}

export function createSharedResourceFixture(
  manager: SharedResourceManager,
  kubernetesSteps: SharedResourceKubernetesSteps,
): SharedResourceFixture {
  manager.initialize(kubernetesSteps);

  return {
    async getSharedVm(config: SharedVmConfig): Promise<SharedResourceResult> {
      return manager.getSharedVm(config);
    },

    async getSharedDataVolume(config: SharedDataVolumeConfig): Promise<SharedResourceResult> {
      return manager.getSharedDataVolume(config);
    },

    getTrackedResources() {
      return manager.getTrackedResources().map((r) => ({
        name: r.name,
        namespace: r.namespace,
        type: r.type,
      }));
    },

    get count() {
      return manager.count;
    },
  };
}
