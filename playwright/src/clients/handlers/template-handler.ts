import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

export class TemplateHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async getTemplate(templateName: string, namespace: string) {
    return await this.ctx.getCustomResource(
      'template.openshift.io',
      'v1',
      namespace,
      'templates',
      templateName,
    );
  }

  async findTemplateByMetadataName(metadataName: string, namespace = 'openshift') {
    try {
      try {
        return await this.getTemplate(metadataName, namespace);
      } catch {
        const templates = await this.listTemplates(namespace);
        if (Array.isArray(templates)) {
          for (const template of templates) {
            const annotations = template.metadata?.annotations || {};
            const labels = template.metadata?.labels || {};
            const templateName = template.metadata?.name || '';

            if (
              templateName === metadataName ||
              annotations['name.os.template.kubevirt.io/rhel9'] === metadataName ||
              Object.keys(labels).some((key) => key.includes(metadataName))
            ) {
              return template;
            }
          }
        }
      }
      return null;
    } catch (error: unknown) {
      throw new Error(
        `Failed to find template by metadata name ${metadataName}: ${getErrorMessage(error)}`,
      );
    }
  }

  getTemplateBootDataSourceRef(
    template: KubernetesResource,
    defaultDataSourceNamespace = 'openshift-virtualization-os-images',
  ): { name: string; namespace: string } | null {
    const objects = template?.objects;
    if (!Array.isArray(objects)) return null;

    const paramMap = new Map<string, string>();
    if (Array.isArray(template.parameters)) {
      for (const p of template.parameters as Array<{ name?: string; value?: string }>) {
        if (p.name && p.value !== undefined) {
          paramMap.set(p.name, p.value);
        }
      }
    }

    const resolve = (val: string | undefined): string | undefined => {
      if (!val) return val;
      return val.replace(/\$\{(\w+)\}/g, (_, key) => paramMap.get(key) ?? _);
    };

    const vmObject = objects.find((obj: KubernetesResource) => obj.kind === 'VirtualMachine');
    const dvTemplates = vmObject?.spec?.dataVolumeTemplates;
    if (!Array.isArray(dvTemplates)) return null;
    for (const dv of dvTemplates) {
      const ref = dv.spec?.sourceRef;
      if (ref?.kind === 'DataSource' && ref?.name) {
        const name = resolve(ref.name) || ref.name;
        const namespace = resolve(ref.namespace) || defaultDataSourceNamespace;
        return { name, namespace };
      }
    }
    return null;
  }

  async listTemplates(namespace: string) {
    try {
      const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
        group: 'template.openshift.io',
        namespace,
        plural: 'templates',
        version: 'v1',
      });
      const bodyUnknown = response?.body ?? response;
      const listBody = bodyUnknown as KubernetesListResource<KubernetesResource>;
      return listBody?.items ?? [];
    } catch (error: unknown) {
      throw new Error(
        `Failed to list Templates in namespace ${namespace}: ${getErrorMessage(error)}`,
      );
    }
  }

  async getNativeVmTemplate(templateName: string, namespace: string) {
    return await this.ctx.getCustomResource(
      'template.kubevirt.io',
      'v1alpha1',
      namespace,
      'virtualmachinetemplates',
      templateName,
    );
  }

  async verifyNativeVmTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    template?: KubernetesResource;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const template = await this.getNativeVmTemplate(templateName, namespace);
        return { exists: true, template };
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return { error: msg, exists: false };
      }
    }

    return {
      error: `Timeout after ${timeoutMs}ms waiting for native VirtualMachineTemplate ${templateName}`,
      exists: false,
    };
  }

  async verifyTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    template?: KubernetesResource;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const template = await this.ctx.getCustomResource(
          'template.openshift.io',
          'v1',
          namespace,
          'templates',
          templateName,
        );

        return {
          exists: true,
          template: template,
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
      error: `Timeout after ${timeoutMs}ms waiting for Template ${templateName} to be created`,
      exists: false,
    };
  }

  /** Fedora VM template with a DataVolume root disk (registry-sourced), suitable for snapshot workflows. */
  async createFedoraTemplateWithDataVolumeRootDisk(templateName: string, namespace: string) {
    const templateResource = {
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: {
        name: templateName,
        namespace: namespace,
        labels: {
          'template.kubevirt.io/type': 'vm',
          'os.template.kubevirt.io/fedora': 'true',
          'workload.template.kubevirt.io/server': 'true',
        },
        annotations: {
          'name.os.template.kubevirt.io/fedora': 'Fedora',
          description: 'Fedora server template (DataVolume root disk, snapshotable)',
          'openshift.io/display-name': 'Fedora Server (snapshotable disk)',
          iconClass: 'icon-fedora',
        },
      },
      objects: [
        {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachine',
          metadata: {
            name: '${NAME}',
            labels: {
              app: '${NAME}',
              'os.template.kubevirt.io/fedora': 'true',
              'vm.kubevirt.io/template': templateName,
            },
          },
          spec: {
            runStrategy: 'Always',
            dataVolumeTemplates: [
              {
                metadata: {
                  name: '${NAME}-rootdisk',
                },
                spec: {
                  source: {
                    registry: {
                      url: 'docker://quay.io/containerdisks/fedora:latest',
                    },
                  },
                  storage: {
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
                annotations: {
                  'vm.kubevirt.io/flavor': 'medium',
                  'vm.kubevirt.io/os': 'fedora',
                  'vm.kubevirt.io/workload': 'server',
                },
                labels: {
                  'kubevirt.io/domain': '${NAME}',
                  'kubevirt.io/size': 'medium',
                },
              },
              spec: {
                domain: {
                  cpu: {
                    cores: 2,
                    sockets: 1,
                    threads: 1,
                  },
                  devices: {
                    disks: [
                      {
                        disk: { bus: 'virtio' },
                        name: 'rootdisk',
                      },
                      {
                        disk: { bus: 'virtio' },
                        name: 'cloudinitdisk',
                      },
                    ],
                  },
                  resources: {
                    requests: {
                      memory: '4Gi',
                    },
                  },
                },
                volumes: [
                  {
                    dataVolume: {
                      name: '${NAME}-rootdisk',
                    },
                    name: 'rootdisk',
                  },
                  {
                    cloudInitNoCloud: {
                      userData: `#cloud-config\nuser: fedora\npassword: '\${CLOUD_USER_PASSWORD}'\nchpasswd: { expire: False }`,
                    },
                    name: 'cloudinitdisk',
                  },
                ],
              },
            },
          },
        },
      ],
      parameters: [
        {
          name: 'NAME',
          description: 'Name for the new VM',
          required: true,
        },
        {
          name: 'CLOUD_USER_PASSWORD',
          description: 'Randomized password for the cloud-init user',
          generate: 'expression',
          from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
        },
      ],
    };

    return await this.ctx.createCustomResource(
      'template.openshift.io',
      'v1',
      namespace,
      'templates',
      templateResource,
    );
  }
}
