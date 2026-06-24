import type { KubernetesCondition, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import type { V1VirtualMachine } from '@/data-models/kubevirt-types';
import { TestTimeouts } from '@/utils/test-config';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { TemplateHandler } from './template-handler';

export class VmLifecycleHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly template: TemplateHandler,
  ) {}

  async createVmFromTemplate(
    templateMetadataName: string,
    vmName: string,
    namespace: string,
    templateNamespace = 'openshift',
    startAfterCreation = true,
    sysprepConfigMapName?: string,
    cloudInitConfig?: {
      username?: string;
      password?: string;
    },
    vmCustomization?: {
      description?: string;
      cpu?: number;
      memory?: number; // in GiB
      bootMode?: 'BIOS' | 'UEFI (secure)' | 'UEFI';
      workload?: string;
      hostname?: string;
      headless?: boolean;
    },
    storageClassName?: string,
    folderName?: string,
  ) {
    const template = await this.template.findTemplateByMetadataName(
      templateMetadataName,
      templateNamespace,
    );
    if (!template) {
      throw new Error(
        `Template with metadata name '${templateMetadataName}' not found in namespace '${templateNamespace}'`,
      );
    }

    interface TemplateParameter {
      name?: string;
      generate?: string;
      value?: string;
      default?: string;
    }

    const templateParameters = Array.isArray(template.parameters)
      ? (template.parameters as TemplateParameter[])
      : [];

    const parameterMap: { [key: string]: string } = {
      NAME: vmName,
    };

    for (const param of templateParameters) {
      const pname = param.name ?? '';
      if (!parameterMap[pname]) {
        if (param.generate) {
          parameterMap[pname] = param.value || param.default || '';
        } else {
          parameterMap[pname] = param.value || param.default || '';
        }
      }
    }

    const rawObjects = template.objects;
    if (!Array.isArray(rawObjects)) {
      throw new Error(`Template '${templateMetadataName}' has no objects array`);
    }

    const processedObjects = rawObjects.map((obj: KubernetesResource) => {
      let objStr = JSON.stringify(obj);
      for (const [paramName, paramValue] of Object.entries(parameterMap)) {
        const regex = new RegExp(`\\$\\{${paramName}\\}`, 'g');
        objStr = objStr.replace(regex, paramValue);
      }
      return JSON.parse(objStr);
    });

    const vmObject = processedObjects.find(
      (obj: KubernetesResource) => obj.kind === 'VirtualMachine',
    );
    if (!vmObject) {
      throw new Error(`No VirtualMachine object found in template '${templateMetadataName}'`);
    }

    vmObject.metadata.namespace = namespace;

    if (!vmObject.metadata.labels) {
      vmObject.metadata.labels = {};
    }
    const templateName = template.metadata?.name || templateMetadataName;
    if (!vmObject.metadata.labels['vm.kubevirt.io/template']) {
      vmObject.metadata.labels['vm.kubevirt.io/template'] = templateName;
    }
    if (!vmObject.metadata.labels['vm.kubevirt.io/template.namespace']) {
      vmObject.metadata.labels['vm.kubevirt.io/template.namespace'] = templateNamespace;
    }

    if (folderName) {
      vmObject.metadata.labels['vm.openshift.io/folder'] = folderName;
    }

    if (!vmObject.metadata.annotations) {
      vmObject.metadata.annotations = {};
    }
    if (!vmObject.metadata.annotations['vm.kubevirt.io/template']) {
      vmObject.metadata.annotations['vm.kubevirt.io/template'] = templateName;
    }

    if (vmObject.spec) {
      if (vmObject.spec.running !== undefined) {
        delete vmObject.spec.running;
      }

      if (startAfterCreation) {
        vmObject.spec.runStrategy = 'Always';
      } else {
        vmObject.spec.runStrategy = 'Manual';
      }
    }

    if (sysprepConfigMapName) {
      if (!vmObject.spec) {
        vmObject.spec = {};
      }
      if (!vmObject.spec.template) {
        vmObject.spec.template = {};
      }
      if (!vmObject.spec.template.spec) {
        vmObject.spec.template.spec = {};
      }

      const templateSpec = vmObject.spec.template.spec;

      if (!templateSpec.domain) {
        templateSpec.domain = {};
      }
      if (!templateSpec.domain.devices) {
        templateSpec.domain.devices = {};
      }
      if (!templateSpec.domain.devices.disks) {
        templateSpec.domain.devices.disks = [];
      }

      templateSpec.domain.devices.disks.push({
        cdrom: {
          bus: 'sata',
        },
        name: 'sysprep',
      });

      if (!templateSpec.volumes) {
        templateSpec.volumes = [];
      }
      templateSpec.volumes.push({
        name: 'sysprep',
        sysprep: {
          configMap: {
            name: sysprepConfigMapName,
          },
        },
      });
    }

    if (cloudInitConfig && (cloudInitConfig.username || cloudInitConfig.password)) {
      if (!vmObject.spec) {
        vmObject.spec = {};
      }
      if (!vmObject.spec.template) {
        vmObject.spec.template = {};
      }
      if (!vmObject.spec.template.spec) {
        vmObject.spec.template.spec = {};
      }

      const templateSpec = vmObject.spec.template.spec;

      if (!templateSpec.volumes) {
        templateSpec.volumes = [];
      }

      const userDataLines: string[] = ['#cloud-config'];

      if (cloudInitConfig.username || cloudInitConfig.password) {
        userDataLines.push('user: ' + (cloudInitConfig.username || 'cloud-user'));
        if (cloudInitConfig.password) {
          userDataLines.push('password: ' + cloudInitConfig.password);
          userDataLines.push('chpasswd:');
          userDataLines.push('  expire: false');
        }
      }

      const userData = userDataLines.join('\n');

      const cloudInitVolumeIndex = templateSpec.volumes.findIndex((v: Record<string, unknown>) => {
        const vol = v as KubernetesResource & Record<string, unknown>;
        return (
          vol.name === 'cloudinitdisk' || 'cloudInitNoCloud' in vol || 'cloudInitConfigDrive' in vol
        );
      });

      if (cloudInitVolumeIndex >= 0) {
        templateSpec.volumes[cloudInitVolumeIndex] = {
          name: templateSpec.volumes[cloudInitVolumeIndex].name || 'cloudinitdisk',
          cloudInitNoCloud: {
            userData: userData,
          },
        };
      } else {
        templateSpec.volumes.push({
          name: 'cloudinitdisk',
          cloudInitNoCloud: {
            userData: userData,
          },
        });

        if (!templateSpec.domain) {
          templateSpec.domain = {};
        }
        if (!templateSpec.domain.devices) {
          templateSpec.domain.devices = {};
        }
        if (!templateSpec.domain.devices.disks) {
          templateSpec.domain.devices.disks = [];
        }

        const cloudInitDiskExists = templateSpec.domain.devices.disks.some(
          (d: Record<string, unknown>) => d['name'] === 'cloudinitdisk',
        );
        if (!cloudInitDiskExists) {
          templateSpec.domain.devices.disks.push({
            disk: {
              bus: 'virtio',
            },
            name: 'cloudinitdisk',
          });
        }
      }
    }

    if (vmCustomization) {
      if (!vmObject.spec) {
        vmObject.spec = {};
      }
      if (!vmObject.spec.template) {
        vmObject.spec.template = {};
      }
      if (!vmObject.spec.template.spec) {
        vmObject.spec.template.spec = {};
      }

      const templateSpec = vmObject.spec.template.spec;

      if (!templateSpec.domain) {
        templateSpec.domain = {};
      }

      if (vmCustomization.description) {
        if (!vmObject.metadata.annotations) {
          vmObject.metadata.annotations = {};
        }
        vmObject.metadata.annotations['description'] = vmCustomization.description;
      }

      if (vmCustomization.cpu) {
        if (!templateSpec.domain.cpu) {
          templateSpec.domain.cpu = {};
        }
        templateSpec.domain.cpu.cores = vmCustomization.cpu;
        templateSpec.domain.cpu.sockets = 1;
        templateSpec.domain.cpu.threads = 1;
      }

      if (vmCustomization.memory) {
        if (!templateSpec.domain.memory) {
          templateSpec.domain.memory = {};
        }
        templateSpec.domain.memory.guest = `${vmCustomization.memory}Gi`;
      }

      if (vmCustomization.bootMode) {
        if (!templateSpec.domain.firmware) {
          templateSpec.domain.firmware = {};
        }
        if (vmCustomization.bootMode === 'BIOS') {
          delete templateSpec.domain.firmware.bootloader;
        } else {
          templateSpec.domain.firmware.bootloader = {
            efi: vmCustomization.bootMode === 'UEFI (secure)' ? { secureBoot: true } : {},
          };
        }
      }

      if (vmCustomization.workload) {
        if (!vmObject.spec.template.metadata) {
          vmObject.spec.template.metadata = {};
        }
        if (!vmObject.spec.template.metadata.annotations) {
          vmObject.spec.template.metadata.annotations = {};
        }
        vmObject.spec.template.metadata.annotations['vm.kubevirt.io/workload'] =
          vmCustomization.workload.toLowerCase().replace(/\s+/g, '-');
      }

      if (vmCustomization.hostname) {
        templateSpec.hostname = vmCustomization.hostname;
      }

      if (vmCustomization.headless) {
        if (!templateSpec.domain.devices) {
          templateSpec.domain.devices = {};
        }
        templateSpec.domain.devices.autoattachGraphicsDevice = false;
        templateSpec.subdomain = 'headless';
        if (!vmObject.spec.template.metadata) {
          vmObject.spec.template.metadata = {};
        }
        if (!vmObject.spec.template.metadata.labels) {
          vmObject.spec.template.metadata.labels = {};
        }
        vmObject.spec.template.metadata.labels['app.kubernetes.io/name'] = 'headless';
      }
    }

    if (storageClassName && vmObject.spec?.dataVolumeTemplates) {
      for (const dvTemplate of vmObject.spec.dataVolumeTemplates) {
        if (dvTemplate.spec?.storage) {
          dvTemplate.spec.storage.storageClassName = storageClassName;
        } else if (dvTemplate.spec) {
          dvTemplate.spec.storage = {
            storageClassName: storageClassName,
          };
        }
      }
    }

    return await this.ctx.createCustomResource(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      vmObject,
    );
  }

  /**
   * Create a VM from an instance type using the Kubernetes API
   * @param volumeName - The name of the bootable volume (DataSource name, e.g., 'rhel9')
   * @param vmName - Name for the VM to create
   * @param namespace - Namespace where the VM should be created
   * @param series - The instance type series (e.g., 'U series' maps to 'u1')
   * @param instanceTypeSize - The instance type size (e.g., 'small', 'medium', 'large')
   * @param startAfterCreation - Whether to start the VM after creation (default: true)
   * @param volumeNamespace - Namespace where the DataSource exists (default: 'openshift-virtualization-os-images')
   * @param storageClassName - Optional storage class name for the DataVolume (e.g., 'ocs-storagecluster-ceph-rbd-virtualization' for live migration support)
   * @param rootDiskName - Name of the root disk/volume in the VM spec (default: 'rootdisk'). DataVolume resource remains `${vmName}-volume`.
   * @returns The created VM resource
   */
  async createVmFromInstanceType(
    volumeName: string,
    vmName: string,
    namespace: string,
    series = 'U series',
    instanceTypeSize = 'small',
    startAfterCreation = true,
    volumeNamespace = 'openshift-virtualization-os-images',
    storageClassName?: string,
    rootDiskName = 'rootdisk',
  ) {
    const seriesMap: { [key: string]: string } = {
      'U series': 'u1',
      'u series': 'u1',
      U: 'u1',
      u: 'u1',
      'C series': 'cx1',
      'c series': 'cx1',
      CX: 'cx1',
      cx: 'cx1',
      C: 'cx1',
      c: 'cx1',
    };
    const seriesPrefix = seriesMap[series] || series.toLowerCase().replace(' series', '1');

    const instanceTypeName = `${seriesPrefix}.${instanceTypeSize}`;

    const vmResource = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        name: vmName,
        namespace: namespace,
        labels: {
          app: vmName,
          'test-framework': 'playwright',
        },
      },
      spec: {
        runStrategy: startAfterCreation ? 'Always' : 'Manual',
        instancetype: {
          name: instanceTypeName,
        },
        preference: {
          inferFromVolume: rootDiskName,
        },
        dataVolumeTemplates: [
          {
            metadata: {
              name: `${vmName}-volume`,
            },
            spec: {
              sourceRef: {
                kind: 'DataSource',
                name: volumeName,
                namespace: volumeNamespace,
              },
              storage: {
                ...(storageClassName && { storageClassName }),
                resources: {
                  requests: {
                    storage: '30Gi',
                  },
                },
              },
            },
          },
        ],
        template: {
          metadata: {
            labels: {
              'kubevirt.io/domain': vmName,
            },
          },
          spec: {
            domain: {
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: rootDiskName,
                  },
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'cloudinitdisk',
                  },
                ],
                interfaces: [
                  {
                    masquerade: {},
                    name: 'default',
                  },
                ],
                rng: {},
              },
            },
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            volumes: [
              {
                dataVolume: {
                  name: `${vmName}-volume`,
                },
                name: rootDiskName,
              },
              {
                cloudInitNoCloud: {
                  userData: `#cloud-config
user: cnv-tester
password: set-own-pwd
chpasswd:
  expire: false
`,
                },
                name: 'cloudinitdisk',
              },
            ],
          },
        },
      },
    };

    return await this.ctx.createCustomResource(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      vmResource,
    );
  }

  /**
   * Get a VirtualMachine resource
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @returns The VirtualMachine resource
   */
  async getVirtualMachine(vmName: string, namespace: string) {
    return await this.ctx.getCustomResource(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      vmName,
    );
  }

  /**
   * Get a VirtualMachineInstance resource
   * @param vmName - Name of the VirtualMachineInstance (same as VM name when running)
   * @param namespace - Namespace where the VMI exists
   * @returns The VirtualMachineInstance resource
   */
  async getVirtualMachineInstance(vmName: string, namespace: string) {
    return await this.ctx.getCustomResource(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachineinstances',
      vmName,
    );
  }

  /**
   * Clone a VirtualMachine using the KubeVirt VirtualMachineClone CRD
   * @param sourceVmName - Name of the source VirtualMachine to clone
   * @param targetVmName - Name for the cloned VirtualMachine
   * @param namespace - Namespace where both VMs reside
   * @param startAfterClone - Whether to start the cloned VM after creation (default: false)
   * @param timeoutMs - Maximum time to wait for clone to complete (default: VM_CREATION timeout)
   * @returns The created VirtualMachineClone resource
   */
  async cloneVirtualMachine(
    sourceVmName: string,
    targetVmName: string,
    namespace: string,
    startAfterClone = false,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ) {
    const cloneName = `${targetVmName}-clone`;
    const cloneResource = {
      apiVersion: 'clone.kubevirt.io/v1alpha1',
      kind: 'VirtualMachineClone',
      metadata: {
        name: cloneName,
        namespace: namespace,
      },
      spec: {
        source: {
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: sourceVmName,
        },
        target: {
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: targetVmName,
        },
      },
    };

    const cloneResult = await this.ctx.createCustomResource(
      'clone.kubevirt.io',
      'v1alpha1',
      namespace,
      'virtualmachineclones',
      cloneResource,
    );

    await this.waitForVmCloneSucceeded(cloneName, namespace, timeoutMs);

    if (startAfterClone) {
      await this.startVirtualMachine(targetVmName, namespace);
    }

    return cloneResult;
  }

  async waitForVmCloneSucceeded(
    cloneName: string,
    namespace: string,
    timeoutMs = 120000,
  ): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const clone = (await this.ctx.getCustomResource(
          'clone.kubevirt.io',
          'v1alpha1',
          namespace,
          'virtualmachineclones',
          cloneName,
        )) as KubernetesResource;

        const phase = clone?.status?.phase;
        if (phase === 'Succeeded') return true;
        if (phase === 'Failed') {
          throw new Error(
            `VirtualMachineClone ${cloneName} failed: ${
              (clone?.status?.conditions as KubernetesCondition[] | undefined)?.[0]?.message ||
              'Unknown error'
            }`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('failed')) throw error;
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      }
    }
    throw new Error(
      `Timeout waiting for VirtualMachineClone ${cloneName} to succeed in namespace ${namespace}`,
    );
  }

  async waitForVmExists(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.ctx.getCustomResource('kubevirt.io', 'v1', namespace, 'virtualmachines', vmName);
        return true;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      }
    }
    throw new Error(`Timeout waiting for VM ${vmName} to exist in namespace ${namespace}`);
  }

  async waitForVmRunning(vmName: string, namespace: string, timeoutMs = 300000): Promise<boolean> {
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
        const printableStatus = (vm as unknown as V1VirtualMachine).status?.printableStatus;
        if (printableStatus === 'Running') return true;
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
      }
    }
    throw new Error(
      `Timeout waiting for VM ${vmName} to reach Running status in namespace ${namespace}`,
    );
  }

  async startVirtualMachine(vmName: string, namespace: string) {
    return await this.ctx.patchResource('kubevirt.io', 'v1', 'virtualmachines', vmName, namespace, {
      spec: { running: true },
    });
  }

  async disableDeleteProtection(vmName: string, namespace: string): Promise<void> {
    try {
      const patchBody = [
        {
          op: 'replace',
          path: '/metadata/labels/kubevirt.io~1vm-delete-protection',
          value: 'false',
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
    } catch {
      // Ignore errors - label might not exist or VM not found
    }
  }

  async stopVm(vmName: string, namespace: string): Promise<boolean> {
    try {
      const patchBody = [{ op: 'replace', path: '/spec/runStrategy', value: 'Halted' }];
      await this.ctx.customObjectsApi.patchNamespacedCustomObject({
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        name: vmName,
        body: patchBody,
      });
      return true;
    } catch {
      return false;
    }
  }

  async startVm(vmName: string, namespace: string): Promise<boolean> {
    try {
      const patchBody = [{ op: 'replace', path: '/spec/runStrategy', value: 'Always' }];
      await this.ctx.customObjectsApi.patchNamespacedCustomObject({
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        name: vmName,
        body: patchBody,
      });
      return true;
    } catch {
      return false;
    }
  }

  async vmExists(vmName: string, namespace: string): Promise<boolean> {
    try {
      await this.ctx.getCustomResource('kubevirt.io', 'v1', namespace, 'virtualmachines', vmName);
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) return false;
      throw error;
    }
  }

  async waitForVmDeleted(vmName: string, namespace: string, timeoutMs = 60000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.ctx.getCustomResource('kubevirt.io', 'v1', namespace, 'virtualmachines', vmName);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) return true;
        throw error;
      }
    }
    throw new Error(`VM ${vmName} was not deleted within ${timeoutMs}ms`);
  }

  async removeVmDeleteProtection(vmName: string, namespace: string): Promise<boolean> {
    try {
      const vm = (await this.getVirtualMachine(vmName, namespace)) as KubernetesResource;
      const labels = vm.metadata?.labels || {};
      const hasProtection =
        labels['kubevirt.io/vm-delete-protection'] === 'enabled' ||
        labels['kubevirt.io/vm-delete-protection'] === 'true';
      if (!hasProtection) return true;

      await this.ctx.patchResource('kubevirt.io', 'v1', 'virtualmachines', vmName, namespace, {
        metadata: { labels: { 'kubevirt.io/vm-delete-protection': null } },
      });
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404')) return true;
      throw error;
    }
  }
}
