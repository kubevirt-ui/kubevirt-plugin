import * as https from 'https';

import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import type {
  V1AccessCredential,
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@/data-models/kubevirt-types';
import { TestTimeouts } from '@/utils/test-config';

import type { DataVolumeHandler } from './data-volume-handler';
import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { VmLifecycleHandler } from './vm-lifecycle-handler';

export class VmDiskQueryHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly dataVolume: DataVolumeHandler,
    private readonly lifecycle: VmLifecycleHandler,
  ) {}

  /**
   * Get the IP address of a running VirtualMachine from its VMI.
   * The VM must be running for this to return an IP address.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @returns The IP address of the VM, or null if not available
   */
  async getVmIpAddress(vmName: string, namespace: string): Promise<null | string> {
    try {
      const vmi = (await this.lifecycle.getVirtualMachineInstance(
        vmName,
        namespace,
      )) as unknown as V1VirtualMachineInstance;
      const ipAddress = vmi.status?.interfaces?.[0]?.ipAddress;
      if (ipAddress) {
        return ipAddress;
      }

      return null;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get VMI CPU sockets count.
   * @param vmName - Name of the VirtualMachineInstance
   * @param namespace - Namespace where the VMI exists
   * @returns The CPU sockets count as a string, or null if not available
   */
  async getVmiCpuSockets(vmName: string, namespace: string): Promise<null | string> {
    try {
      const vmi = (await this.lifecycle.getVirtualMachineInstance(
        vmName,
        namespace,
      )) as unknown as V1VirtualMachineInstance;
      const sockets = vmi.spec?.domain?.cpu?.sockets;
      return sockets != null ? String(sockets) : null;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get VMI memory guest value.
   * @param vmName - Name of the VirtualMachineInstance
   * @param namespace - Namespace where the VMI exists
   * @returns The memory guest value (e.g., "3Gi"), or null if not available
   */
  async getVmiMemoryGuest(vmName: string, namespace: string): Promise<null | string> {
    try {
      const vmi = (await this.lifecycle.getVirtualMachineInstance(
        vmName,
        namespace,
      )) as unknown as V1VirtualMachineInstance;
      const memoryGuest = vmi.spec?.domain?.memory?.guest;
      if (memoryGuest == null || memoryGuest === '') return null;
      return typeof memoryGuest === 'string' ? memoryGuest : String(memoryGuest);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get the disk bus type from a running VMI for a specific disk.
   * KubeVirt resolves the bus at runtime (e.g., virtio, scsi, sata) even when
   * the VM spec doesn't set it explicitly.
   * @param vmName - Name of the VirtualMachineInstance
   * @param namespace - Namespace where the VMI exists
   * @param diskName - Name of the disk (e.g., "rootdisk")
   * @returns The bus type string (e.g., "virtio"), or null if not available
   */
  async getVmiDiskBus(vmName: string, namespace: string, diskName: string): Promise<null | string> {
    try {
      const vmi = (await this.lifecycle.getVirtualMachineInstance(
        vmName,
        namespace,
      )) as unknown as V1VirtualMachineInstance;
      const disks = vmi.spec?.domain?.devices?.disks;
      if (!Array.isArray(disks)) return null;

      const disk = disks.find((d: V1Disk) => d.name === diskName);
      if (!disk) return null;

      const bus = disk.disk?.bus ?? disk.cdrom?.bus ?? disk.lun?.bus;
      return bus ?? null;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get the filesystem list from a running VMI via the filesystemlist subresource API.
   * Returns all filesystems reported by the guest agent (no item cap, unlike guestosinfo).
   */
  async getVmiFilesystemList(
    vmName: string,
    namespace: string,
  ): Promise<{
    items: Array<{
      diskName: string;
      mountPoint: string;
      fileSystemType: string;
      totalBytes: number;
      usedBytes: number;
    }>;
  }> {
    const cluster = this.ctx.kc.getCurrentCluster();
    if (!cluster) throw new Error('No current cluster in kubeconfig');

    const requestPath = `/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${vmName}/filesystemlist`;
    const url = new URL(requestPath, cluster.server);

    const opts: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || '443',
      path: url.pathname,
      method: 'GET',
      headers: { Accept: 'application/json' },
      rejectUnauthorized: false,
    };

    await this.ctx.kc.applyToHTTPSOptions(opts);

    return new Promise((resolve, reject) => {
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error(`Failed to parse filesystemlist response: ${data.slice(0, 200)}`));
            }
          } else {
            reject(new Error(`filesystemlist failed (${res.statusCode}): ${data.slice(0, 200)}`));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  async listVirtualMachines(namespace: string): Promise<V1VirtualMachine[]> {
    try {
      const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
        group: 'kubevirt.io',
        namespace,
        plural: 'virtualmachines',
        version: 'v1',
      });
      const body = response.body || response;
      const list = body as KubernetesListResource<V1VirtualMachine>;
      return (list?.items ?? []) as V1VirtualMachine[];
    } catch (error: unknown) {
      throw new Error(
        `Failed to list VirtualMachines in namespace ${namespace}: ${getErrorMessage(error)}`,
      );
    }
  }

  async verifyVmCreated(
    vmName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    vm?: V1VirtualMachine;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const vm = (await this.ctx.getCustomResource(
          'kubevirt.io',
          'v1',
          namespace,
          'virtualmachines',
          vmName,
        )) as unknown as V1VirtualMachine;

        return {
          exists: true,
          vm: vm,
        };
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return {
          error: msg,
          exists: false,
        };
      }
    }

    return {
      error: `Timeout after ${timeoutMs}ms waiting for VM ${vmName} to be created`,
      exists: false,
    };
  }

  /**
   * Check the VM spec to verify a disk is present in the template (persisted across restarts).
   * After "Make persistent", the volume should exist in `spec.template.spec.volumes`
   * and the corresponding disk in `spec.template.spec.domain.devices.disks`.
   */
  async isVmDiskPersistent(vmName: string, namespace: string, diskName: string): Promise<boolean> {
    const vm = (await this.lifecycle.getVirtualMachine(
      vmName,
      namespace,
    )) as unknown as V1VirtualMachine;
    const tmplSpec = vm.spec?.template?.spec;
    const volumes: V1Volume[] = tmplSpec?.volumes ?? [];
    const disks: V1Disk[] = tmplSpec?.domain?.devices?.disks ?? [];

    const hasVolume = volumes.some((v) => v.name === diskName);
    const hasDisk = disks.some((d) => d.name === diskName);

    return hasVolume && hasDisk;
  }

  /**
   * Verify that VMs and folder are deleted from the cluster
   * @param vmNames - Array of VM names to check
   * @param folderName - Name of the folder to check
   * @param namespace - Namespace where the VMs and folder should be deleted from
   * @param timeoutMs - Timeout in milliseconds (default: 60000)
   * @returns Object with deletion status for each VM and folder
   */
  async verifyVmFolderAndVmsDeleted(
    vmNames: string[],
    folderName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<{
    folderDeleted: boolean;
    vmsDeleted: { [vmName: string]: boolean };
    allDeleted: boolean;
    errors?: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    const vmsDeleted: { [vmName: string]: boolean } = {};

    vmNames.forEach((vmName) => {
      vmsDeleted[vmName] = false;
    });

    while (Date.now() - startTime < timeoutMs) {
      let allVmsDeleted = true;
      let folderDeleted = false;

      for (const vmName of vmNames) {
        try {
          const exists = await this.lifecycle.vmExists(vmName, namespace);
          vmsDeleted[vmName] = !exists;
          if (exists) {
            allVmsDeleted = false;
          }
        } catch (error: unknown) {
          errors.push(`Error checking VM ${vmName}: ${getErrorMessage(error)}`);
          allVmsDeleted = false;
        }
      }

      try {
        const allVMs = await this.ctx.listCustomResources(
          'kubevirt.io',
          'v1',
          namespace,
          'virtualmachines',
        );

        const vmsWithFolderLabel = allVMs.filter(
          (vm: KubernetesResource) =>
            vm.metadata?.labels?.['vm.openshift.io/folder'] === folderName,
        );

        folderDeleted = vmsWithFolderLabel.length === 0;
      } catch (error: unknown) {
        errors.push(`Error checking folder ${folderName}: ${getErrorMessage(error)}`);
        folderDeleted = false;
      }

      if (allVmsDeleted && folderDeleted) {
        return {
          folderDeleted: true,
          vmsDeleted,
          allDeleted: true,
          errors: errors.length > 0 ? errors : undefined,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return {
      folderDeleted: false,
      vmsDeleted,
      allDeleted: false,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Verify that a folder is deleted from the cluster (no VMs with folder label exist)
   * @param folderName - Name of the folder to check
   * @param namespace - Namespace where the folder should be deleted from
   * @param timeoutMs - Timeout in milliseconds (default: TestTimeouts.CLUSTER_OPERATION)
   * @returns Object with folder deletion status
   */
  async verifyFolderDeleted(
    folderName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<{
    folderDeleted: boolean;
    errors?: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];

    while (Date.now() - startTime < timeoutMs) {
      try {
        const allVMs = await this.ctx.listCustomResources(
          'kubevirt.io',
          'v1',
          namespace,
          'virtualmachines',
        );

        const vmsWithFolderLabel = allVMs.filter(
          (vm: KubernetesResource) =>
            vm.metadata?.labels?.['vm.openshift.io/folder'] === folderName,
        );

        if (vmsWithFolderLabel.length === 0) {
          return {
            folderDeleted: true,
            errors: errors.length > 0 ? errors : undefined,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: unknown) {
        errors.push(`Error checking folder ${folderName}: ${getErrorMessage(error)}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return {
      folderDeleted: false,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async verifyVmHasSSHKey(
    vmName: string,
    namespace: string,
  ): Promise<{ hasSSHKey: boolean; secretName?: string }> {
    try {
      const vm = await this.ctx.getCustomResource(
        'kubevirt.io',
        'v1',
        namespace,
        'virtualmachines',
        vmName,
      );

      if (!vm) {
        return { hasSSHKey: false };
      }

      const typedVm = vm as unknown as V1VirtualMachine;
      const accessCredentials = typedVm.spec?.template?.spec?.accessCredentials;
      if (accessCredentials && accessCredentials.length > 0) {
        const sshCredential = accessCredentials.find(
          (cred: V1AccessCredential) => !!cred.sshPublicKey?.source?.secret,
        );
        if (sshCredential) {
          return {
            hasSSHKey: true,
            secretName: sshCredential.sshPublicKey?.source?.secret?.secretName,
          };
        }
      }

      return { hasSSHKey: false };
    } catch {
      return { hasSSHKey: false };
    }
  }

  async enableSshAccess(
    vmName: string,
    namespace: string,
    sshServiceType: 'LoadBalancer' | 'NodePort' = 'NodePort',
  ): Promise<KubernetesResource> {
    try {
      const currentVm = await this.lifecycle.getVirtualMachine(vmName, namespace);
      const hasAnnotations = currentVm?.metadata?.annotations !== undefined;
      const annotationExists =
        currentVm?.metadata?.annotations?.['vm.kubevirt.io/ssh-access'] !== undefined;

      const patchOps: JsonPatchOp[] = [];

      if (!hasAnnotations) {
        patchOps.push({ op: 'add', path: '/metadata/annotations', value: {} });
      }

      const annotationPath = '/metadata/annotations/vm.kubevirt.io~1ssh-access';
      patchOps.push({
        op: annotationExists ? 'replace' : 'add',
        path: annotationPath,
        value: sshServiceType,
      });

      type PatchFn = (
        requestParameters: unknown,
        contentType?: string,
        options?: { headers?: Record<string, string> },
      ) => Promise<{ body?: KubernetesResource } | KubernetesResource>;

      const customObjectsApi = this.ctx.customObjectsApi as unknown as {
        patchNamespacedCustomObject: PatchFn;
      };

      const response = await customObjectsApi.patchNamespacedCustomObject(
        {
          group: 'kubevirt.io',
          version: 'v1',
          namespace: namespace,
          plural: 'virtualmachines',
          name: vmName,
          body: patchOps,
          dryRun: undefined,
          fieldManager: undefined,
          fieldValidation: undefined,
        },
        'json',
        { headers: { 'Content-Type': 'application/json-patch+json' } },
      );
      if (response && typeof response === 'object' && 'body' in response) {
        const withBody = response as { body?: KubernetesResource };
        return withBody.body ?? (response as KubernetesResource);
      }
      return response as KubernetesResource;
    } catch (error: unknown) {
      throw new Error(`Failed to enable SSH access on VirtualMachine: ${getErrorMessage(error)}`);
    }
  }

  async addCdromDiskToVm(
    vmName: string,
    namespace: string,
    options?: { volumeName?: string; pvcClaimName?: string; containerImage?: string },
  ): Promise<void> {
    const volumeName = options?.volumeName ?? 'cdrom-test';

    const volumeValue = options?.pvcClaimName
      ? { name: volumeName, persistentVolumeClaim: { claimName: options.pvcClaimName } }
      : {
          name: volumeName,
          containerDisk: {
            image: options?.containerImage ?? 'registry.redhat.io/rhel9/rhel-guest-image:latest',
          },
        };

    const patchBody = [
      { op: 'add', path: '/spec/template/spec/volumes/-', value: volumeValue },
      {
        op: 'add',
        path: '/spec/template/spec/domain/devices/disks/-',
        value: { name: volumeName, cdrom: { bus: 'sata' } },
      },
    ];

    await this.ctx.customObjectsApi.patchNamespacedCustomObject({
      group: 'kubevirt.io',
      version: 'v1',
      namespace,
      plural: 'virtualmachines',
      name: vmName,
      body: patchBody,
    });
  }

  async addBlankDiskToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    size = '1Gi',
  ): Promise<void> {
    await this.dataVolume.createBlankDataVolume(diskName, namespace, size);
    await this.dataVolume.waitForDataVolumeSucceeded(diskName, namespace);

    const patchBody = [
      {
        op: 'add',
        path: '/spec/template/spec/volumes/-',
        value: { name: diskName, dataVolume: { name: diskName } },
      },
      {
        op: 'add',
        path: '/spec/template/spec/domain/devices/disks/-',
        value: { name: diskName, disk: { bus: 'virtio' } },
      },
    ];

    await this.ctx.customObjectsApi.patchNamespacedCustomObject({
      group: 'kubevirt.io',
      version: 'v1',
      namespace,
      plural: 'virtualmachines',
      name: vmName,
      body: patchBody,
    });
  }

  async hotplugVolumeToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    dataVolumeName: string,
  ): Promise<void> {
    const cluster = this.ctx.kc.getCurrentCluster();
    if (!cluster) throw new Error('No current cluster in kubeconfig');

    const requestPath = `/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${vmName}/addvolume`;
    const body = JSON.stringify({
      name: diskName,
      disk: { disk: { bus: 'virtio' }, name: diskName },
      volumeSource: { dataVolume: { name: dataVolumeName } },
    });

    const url = new URL(requestPath, cluster.server);
    const opts: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || '443',
      path: url.pathname,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      rejectUnauthorized: false,
    };
    await this.ctx.kc.applyToHTTPSOptions(opts);

    return new Promise<void>((resolve, reject) => {
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`addvolume failed (${res.statusCode}): ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async waitForVmError(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const vm = await this.ctx.getCustomResource(
          'kubevirt.io',
          'v1',
          namespace,
          'virtualmachines',
          vmName,
        );
        const status = (vm as KubernetesResource)?.status?.['printableStatus'];
        if (status === 'Error') return true;
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      }
    }
    throw new Error(
      `Timeout waiting for VM ${vmName} to reach Error status in namespace ${namespace}`,
    );
  }

  async waitForVmDiskPresent(
    vmName: string,
    namespace: string,
    diskName: string,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const vm = (await this.lifecycle.getVirtualMachine(
        vmName,
        namespace,
      )) as unknown as V1VirtualMachine;
      const disks = vm.spec?.template?.spec?.domain?.devices?.disks ?? [];
      if (disks.some((d) => d.name === diskName)) return;
      await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
    }
    throw new Error(
      `Timeout waiting for disk "${diskName}" to appear in VM ${vmName} in namespace ${namespace}`,
    );
  }
}
