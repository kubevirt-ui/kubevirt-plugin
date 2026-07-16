import * as fs from 'fs';

import { SshKeyFactory } from '@/data-factories/ssh-key-factory';
import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for KubeVirt VirtualMachine, VirtualMachineInstance,
 * and VirtualMachineInstanceMigration resources.
 *
 * Access via `apiClient.vm.*`
 */
export class VirtualMachineProxyHandler {
  private static readonly SERIES_PREFIX: Record<string, string> = {
    'u series': 'u1',
    'o series': 'o1',
    'cx series': 'cx1',
    'gn series': 'gn1',
    'm series': 'm1',
    'n series': 'n1',
    'rt series': 'rt1',
    'd series': 'd1',
  };

  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // VirtualMachines
  // ---------------------------------------------------------------------------

  /**
   * Create an SSH key Secret and inject `accessCredentials` into a VM spec
   * so the public key is propagated via QEMU guest agent.
   *
   * When `sshPublicKey` is omitted, a fresh RSA key pair is generated
   * via {@link SshKeyFactory} and the public half is used.
   */
  private async _injectSshKey(
    vmSpec: KubernetesResource,
    namespace: string,
    sshPublicKey?: string,
  ): Promise<void> {
    const pubKey =
      sshPublicKey ?? fs.readFileSync(SshKeyFactory.generatePublicKeyFile(), 'utf-8').trim();

    const vmName = vmSpec.metadata?.name ?? 'vm';
    const secretName = `${vmName}-ssh-key`;

    await this.ctx._request('post', `/kubernetes/api/v1/namespaces/${namespace}/secrets`, {
      data: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName, namespace },
        data: { key: Buffer.from(pubKey).toString('base64') },
      },
    });

    const spec = vmSpec.spec as Record<string, unknown>;
    const template = (spec.template ?? {}) as Record<string, unknown>;
    const templateSpec = (template.spec ?? {}) as Record<string, unknown>;

    templateSpec.accessCredentials = [
      {
        sshPublicKey: {
          propagationMethod: { qemuGuestAgent: { users: ['cloud-user'] } },
          source: { secret: { secretName } },
        },
      },
    ];

    template.spec = templateSpec;
    spec.template = template;
  }

  create(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource('kubevirt.io', 'v1', 'virtualmachines', spec, namespace);
  }

  createMigration(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      spec,
      namespace,
    );
  }

  async createVmFromInstanceType(
    bootableVolumeName: string,
    vmName: string,
    namespace: string,
    series = 'U series',
    size = 'small',
    startVm = false,
    sshPublicKey?: string,
  ): Promise<string> {
    const prefix =
      VirtualMachineProxyHandler.SERIES_PREFIX[series.toLowerCase()] ??
      series.toLowerCase().replace(/\s+/g, '');
    const vmSpec: KubernetesResource = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: vmName, namespace },
      spec: {
        instancetype: {
          kind: 'VirtualMachineClusterInstancetype',
          name: `${prefix}.${size}`,
        },
        preference: { kind: 'VirtualMachineClusterPreference', name: bootableVolumeName },
        runStrategy: startVm ? 'Always' : 'Halted',
        dataVolumeTemplates: [
          {
            metadata: { name: `${vmName}-volume` },
            spec: {
              sourceRef: {
                kind: 'DataSource',
                name: bootableVolumeName,
                namespace: 'openshift-virtualization-os-images',
              },
              storage: {},
            },
          },
        ],
        template: {
          spec: {
            domain: { devices: {} },
            volumes: [{ dataVolume: { name: `${vmName}-volume` }, name: 'rootdisk' }],
          },
        },
      },
    };

    if (sshPublicKey) {
      await this._injectSshKey(vmSpec, namespace, sshPublicKey);
    }

    await this.create(namespace, vmSpec);
    if (startVm) {
      await this.start(namespace, vmName);
    }
    return vmName;
  }

  async createVmFromTemplate(
    templateName: string,
    vmName: string,
    namespace: string,
    templateNamespace = 'openshift',
    startVm = true,
    sshPublicKey?: string,
  ): Promise<string> {
    const template = await this.ctx.getResource(
      'template.openshift.io',
      'v1',
      'templates',
      templateName,
      templateNamespace,
    );
    if (!template) {
      throw new Error(`Template '${templateName}' not found in namespace '${templateNamespace}'`);
    }

    template.metadata = template.metadata || {};
    template.metadata.namespace = namespace;
    delete template.metadata.resourceVersion;
    delete template.metadata.uid;

    const parameters = (template as Record<string, unknown>).parameters as
      | Array<{ name: string; value?: string }>
      | undefined;
    const nameParam = parameters?.find((p) => p.name === 'NAME');
    if (nameParam) {
      nameParam.value = vmName;
    }

    const processed = await this.ctx._request(
      'post',
      `/kubernetes/apis/template.openshift.io/v1/namespaces/${namespace}/processedtemplates`,
      { data: template },
    );

    const objects = (processed as Record<string, unknown>).objects as KubernetesResource[];
    const vmSpec = objects[0];

    if (!startVm) {
      vmSpec.spec = vmSpec.spec || {};
      (vmSpec.spec as Record<string, unknown>).runStrategy = 'Halted';
    }

    if (sshPublicKey) {
      await this._injectSshKey(vmSpec, namespace, sshPublicKey);
    }

    await this.create(namespace, vmSpec);
    return vmSpec.metadata?.name || vmName;
  }

  delete(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('kubevirt.io', 'v1', 'virtualmachines', name, namespace);
  }

  // ---------------------------------------------------------------------------
  // VM subresource actions
  // ---------------------------------------------------------------------------

  deleteMigration(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      name,
      namespace,
    );
  }

  async disableDeleteProtection(
    namespace: string,
    vmName: string,
  ): Promise<KubernetesResource | null> {
    return this.patch(namespace, vmName, [
      { op: 'remove', path: '/metadata/labels/kubevirt.io~1vm-delete-protection' },
    ]);
  }

  get(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('kubevirt.io', 'v1', 'virtualmachines', name, namespace);
  }

  // ---------------------------------------------------------------------------
  // VirtualMachineInstances
  // ---------------------------------------------------------------------------

  getInstance(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('kubevirt.io', 'v1', 'virtualmachineinstances', name, namespace);
  }

  getMigration(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      name,
      namespace,
    );
  }

  async getVmiCpuSockets(namespace: string, vmName: string): Promise<number | null> {
    const vmi = await this.getInstance(namespace, vmName);
    if (!vmi) return null;
    const spec = vmi.spec as Record<string, unknown> | undefined;
    const domain = spec?.domain as Record<string, unknown> | undefined;
    const cpu = domain?.cpu as Record<string, unknown> | undefined;
    return (cpu?.sockets as number) ?? null;
  }

  // ---------------------------------------------------------------------------
  // VirtualMachineInstanceMigrations
  // ---------------------------------------------------------------------------

  async getVmiDiskBus(namespace: string, vmName: string, diskName: string): Promise<string | null> {
    const vmi = await this.getInstance(namespace, vmName);
    if (!vmi) return null;
    const spec = vmi.spec as Record<string, unknown> | undefined;
    const domain = spec?.domain as Record<string, unknown> | undefined;
    const devices = domain?.devices as Record<string, unknown> | undefined;
    const disks = (devices?.disks as Array<Record<string, unknown>>) || [];
    const disk = disks.find((d) => d.name === diskName);
    if (!disk) return null;
    const diskInfo = disk.disk as Record<string, unknown> | undefined;
    if (diskInfo?.bus) return diskInfo.bus as string;
    const cdromInfo = disk.cdrom as Record<string, unknown> | undefined;
    if (cdromInfo?.bus) return cdromInfo.bus as string;
    return null;
  }

  async getVmiMemoryGuest(namespace: string, vmName: string): Promise<string | null> {
    const vmi = await this.getInstance(namespace, vmName);
    if (!vmi) return null;
    const spec = vmi.spec as Record<string, unknown> | undefined;
    const domain = spec?.domain as Record<string, unknown> | undefined;
    const memory = domain?.memory as Record<string, unknown> | undefined;
    return (memory?.guest as string) ?? null;
  }

  async getVmIpAddress(namespace: string, vmName: string): Promise<string | null> {
    const vmi = await this.getInstance(namespace, vmName);
    if (!vmi) return null;
    const status = vmi.status as Record<string, unknown> | undefined;
    const interfaces = status?.interfaces as Array<Record<string, unknown>> | undefined;
    if (interfaces && interfaces.length > 0) {
      const ipAddresses = interfaces[0].ipAddresses as string[] | undefined;
      if (ipAddresses && ipAddresses.length > 0) return ipAddresses[0];
      const ip = interfaces[0].ipAddress as string | undefined;
      if (ip) return ip;
    }
    return null;
  }

  async getVmNodeName(namespace: string, vmName: string): Promise<string | null> {
    const vmi = await this.getInstance(namespace, vmName);
    if (!vmi) return null;
    const status = vmi.status as Record<string, unknown> | undefined;
    return (status?.nodeName as string) ?? null;
  }

  // ---------------------------------------------------------------------------
  // VM lifecycle & inspection helpers
  // ---------------------------------------------------------------------------

  async hotplugVolumeToVm(
    namespace: string,
    vmName: string,
    volumeName: string,
    diskName: string,
  ): Promise<KubernetesResource | null> {
    const vm = await this.get(namespace, vmName);
    if (!vm) return null;

    const spec = vm.spec as Record<string, unknown>;
    const templateSpec =
      ((spec?.template as Record<string, unknown>)?.spec as Record<string, unknown>) || {};
    const domain = (templateSpec.domain as Record<string, unknown>) || {};
    const devices = (domain.devices as Record<string, unknown>) || {};
    const existingDisks = (devices.disks as Array<Record<string, unknown>>) || [];
    const existingVolumes = (templateSpec.volumes as Array<Record<string, unknown>>) || [];

    const disks = [...existingDisks, { name: diskName, disk: { bus: 'virtio' } }];
    const volumes = [
      ...existingVolumes,
      { name: diskName, persistentVolumeClaim: { claimName: volumeName } },
    ];

    return this.mergePatch(namespace, vmName, {
      spec: {
        template: {
          spec: {
            domain: { devices: { disks } },
            volumes,
          },
        },
      },
    });
  }

  async isVmDiskPersistent(namespace: string, vmName: string, diskName: string): Promise<boolean> {
    const vm = await this.get(namespace, vmName);
    if (!vm) return false;
    const spec = vm.spec as Record<string, unknown>;
    const templateSpec =
      ((spec?.template as Record<string, unknown>)?.spec as Record<string, unknown>) || {};
    const volumes = (templateSpec.volumes as Array<Record<string, unknown>>) || [];
    const volume = volumes.find((v) => v.name === diskName);
    if (!volume) return false;
    return !!volume.persistentVolumeClaim;
  }

  list(namespace?: string, queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources('kubevirt.io', 'v1', 'virtualmachines', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  listInstances(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('kubevirt.io', 'v1', 'virtualmachineinstances', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  listMigrations(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  mergePatch(
    namespace: string,
    name: string,
    patch: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    return this.ctx.mergePatchResource(
      'kubevirt.io',
      'v1',
      'virtualmachines',
      name,
      patch,
      namespace,
    );
  }

  patch(namespace: string, name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource('kubevirt.io', 'v1', 'virtualmachines', name, patch, namespace);
  }

  async patchVmEvictionStrategy(
    namespace: string,
    vmName: string,
    strategy: string,
  ): Promise<KubernetesResource | null> {
    return this.mergePatch(namespace, vmName, {
      spec: { template: { spec: { evictionStrategy: strategy } } },
    });
  }

  async removeVmDeleteProtection(
    namespace: string,
    vmName: string,
  ): Promise<KubernetesResource | null> {
    return this.disableDeleteProtection(namespace, vmName);
  }

  /** Hard-reset a VMI (VMI-level subresource). */
  resetInstance(namespace: string, vmName: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${vmName}/reset`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Gracefully restart a running VM (recreates the VMI). */
  restart(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/restart`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Start a VM (sets runStrategy: Always via subresource). */
  start(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/start`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Stop a VM (sets runStrategy: Halted via subresource). */
  stop(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/stop`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  async verifyVmCreated(
    namespace: string,
    vmName: string,
    timeoutMs = TestTimeouts.VM_BOOTUP,
  ): Promise<{ exists: boolean }> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vm = await this.get(namespace, vmName);
        if (vm) return { exists: true };
      } catch {
        // not found yet
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return { exists: false };
  }

  async waitForVmDeleted(namespace: string, vmName: string, timeoutMs = 60_000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vm = await this.get(namespace, vmName);
        if (!vm) return true;
      } catch {
        return true;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }

  async waitForVmDiskPresent(
    namespace: string,
    vmName: string,
    diskName: string,
    timeoutMs = 60_000,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vm = await this.get(namespace, vmName);
        if (vm) {
          const spec = vm.spec as Record<string, unknown>;
          const templateSpec =
            ((spec?.template as Record<string, unknown>)?.spec as Record<string, unknown>) || {};
          const domain = (templateSpec.domain as Record<string, unknown>) || {};
          const devices = (domain.devices as Record<string, unknown>) || {};
          const disks = (devices.disks as Array<Record<string, unknown>>) || [];
          if (disks.some((d) => d.name === diskName)) return true;
        }
      } catch {
        // not found yet
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }

  async waitForVmExists(namespace: string, vmName: string, timeoutMs = 60_000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vm = await this.get(namespace, vmName);
        if (vm) return true;
      } catch {
        // not found yet
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }

  async waitForVmRunning(
    namespace: string,
    vmName: string,
    timeoutMs = TestTimeouts.VM_BOOTUP,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vmi = await this.getInstance(namespace, vmName);
        if (vmi) {
          const status = vmi.status as Record<string, unknown> | undefined;
          if (status?.phase === 'Running') return true;
        }
      } catch {
        // VMI not yet available
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    return false;
  }
}
