import type { TemplateConfig, TemplateDiskSource, TemplateParameter } from './template-factory';

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  cloudInitDiskName: 'cloudinitdisk',
  cloudInitUser: 'fedora',
  cpuCores: 1,
  cpuSockets: 1,
  cpuThreads: 1,
  description: 'VM template example',
  displayName: 'Fedora VM',
  flavor: 'small',
  iconClass: 'icon-fedora',
  interfaceModel: 'virtio',
  memory: '2Gi',
  name: 'example',
  nameParameter: {
    description: 'Name for the new VM',
    from: 'example-[a-z0-9]{16}',
    generate: 'expression',
    name: 'NAME',
  },
  networkInterfaceMultiqueue: true,
  networkName: 'default',
  os: 'fedora',
  osLabel: 'fedora',
  osName: 'Fedora',
  passwordParameter: {
    description: 'Randomized password for the cloud-init user',
    from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
    generate: 'expression',
    name: 'CLOUD_USER_PASSWORD',
  },
  rootDiskBus: 'virtio',
  rootDiskImage: 'quay.io/containerdisks/fedora',
  rootDiskName: 'rootdisk',
  runStrategy: 'Halted',
  size: 'small',
  templateType: 'vm',
  terminationGracePeriodSeconds: 180,
  vmDescription: 'VM example',
  workload: 'server',
  workloadLabel: 'server',
};

export function buildRootDiskVolume(template: TemplateConfig): Record<string, unknown> {
  const diskName = template.rootDiskName || 'rootdisk';
  const diskSource = template.rootDiskSource;

  if (!diskSource) {
    return {
      name: diskName,
      containerDisk: {
        image: template.rootDiskImage || 'quay.io/containerdisks/fedora',
      },
    };
  }

  switch (diskSource.type) {
    case 'containerDisk':
      return {
        name: diskName,
        containerDisk: {
          image: diskSource.image,
        },
      };
    case 'persistentVolumeClaim':
      return {
        name: diskName,
        persistentVolumeClaim: {
          claimName: diskSource.claimName,
        },
      };
    case 'dataVolume':
      return {
        name: diskName,
        dataVolume: {
          name: diskSource.name,
        },
      };
    default:
      return {
        name: diskName,
        containerDisk: {
          image: template.rootDiskImage || 'quay.io/containerdisks/fedora',
        },
      };
  }
}

export function buildDiskVolume(
  diskName: string,
  diskSource: TemplateDiskSource,
): Record<string, unknown> {
  switch (diskSource.type) {
    case 'containerDisk':
      return {
        name: diskName,
        containerDisk: {
          image: diskSource.image,
        },
      };
    case 'persistentVolumeClaim':
      return {
        name: diskName,
        persistentVolumeClaim: {
          claimName: diskSource.claimName,
        },
      };
    case 'dataVolume':
      return {
        name: diskName,
        dataVolume: {
          name: diskSource.name,
        },
      };
    default:
      throw new Error(`Unknown disk source type`);
  }
}

export function buildParametersSection(template: TemplateConfig): string {
  const params: TemplateParameter[] = [];

  if (template.nameParameter) {
    params.push(template.nameParameter);
  }

  if (template.passwordParameter) {
    params.push(template.passwordParameter);
  }

  if (template.additionalParameters) {
    params.push(...template.additionalParameters);
  }

  if (params.length === 0) {
    return '';
  }

  let paramsYaml = 'parameters:\n';
  params.forEach((param) => {
    paramsYaml += `  - name: ${param.name}\n`;
    paramsYaml += `    description: ${param.description}\n`;
    if (param.generate) {
      paramsYaml += `    generate: ${param.generate}\n`;
    }
    if (param.from) {
      paramsYaml += `    from: '${param.from}'\n`;
    }
    if (param.value) {
      paramsYaml += `    value: ${param.value}\n`;
    }
  });

  return paramsYaml;
}

export function buildTemplateParameters(template: TemplateConfig): Record<string, unknown>[] {
  const parameters: Record<string, unknown>[] = [];

  if (template.nameParameter) {
    parameters.push({
      name: template.nameParameter.name,
      description: template.nameParameter.description,
      ...(template.nameParameter.generate && { generate: template.nameParameter.generate }),
      ...(template.nameParameter.from && { from: template.nameParameter.from }),
      ...(template.nameParameter.value && { value: template.nameParameter.value }),
    });
  }
  if (template.passwordParameter) {
    parameters.push({
      name: template.passwordParameter.name,
      description: template.passwordParameter.description,
      ...(template.passwordParameter.generate && {
        generate: template.passwordParameter.generate,
      }),
      ...(template.passwordParameter.from && { from: template.passwordParameter.from }),
      ...(template.passwordParameter.value && { value: template.passwordParameter.value }),
    });
  }
  if (template.additionalParameters) {
    template.additionalParameters.forEach((param) => {
      parameters.push({
        name: param.name,
        description: param.description,
        ...(param.generate && { generate: param.generate }),
        ...(param.from && { from: param.from }),
        ...(param.value && { value: param.value }),
      });
    });
  }

  return parameters;
}

export function buildTemplateVmObject(template: TemplateConfig): Record<string, unknown> {
  return {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: '${NAME}',
      annotations: {
        description: template.vmDescription || '',
      },
      labels: {
        app: '${NAME}',
        [`vm.kubevirt.io/template`]: template.name,
        [`os.template.kubevirt.io/${template.osLabel}`]: 'true',
      },
    },
    spec: {
      runStrategy: template.runStrategy || 'Halted',
      template: {
        metadata: {
          annotations: {
            [`vm.kubevirt.io/flavor`]: template.flavor || 'small',
            [`vm.kubevirt.io/os`]: template.os || 'fedora',
            [`vm.kubevirt.io/workload`]: template.workload || 'server',
          },
          labels: {
            'kubevirt.io/domain': '${NAME}',
            'kubevirt.io/size': template.size || 'small',
          },
        },
        spec: {
          domain: {
            cpu: {
              cores: template.cpuCores || 1,
              sockets: template.cpuSockets || 1,
              threads: template.cpuThreads || 1,
              ...(template.dedicatedCpuPlacement && { dedicatedCpuPlacement: true }),
            },
            devices: {
              disks: [
                {
                  disk: {
                    bus: template.rootDiskBus || 'virtio',
                  },
                  name: template.rootDiskName || 'rootdisk',
                },
                {
                  disk: {
                    bus: template.rootDiskBus || 'virtio',
                  },
                  name: template.cloudInitDiskName || 'cloudinitdisk',
                },
                ...(template.additionalDisks || []).map((disk) => ({
                  disk: {
                    bus: disk.bus || 'virtio',
                  },
                  name: disk.name,
                })),
              ],
              interfaces: [
                {
                  masquerade: {},
                  model: template.interfaceModel || 'virtio',
                  name: template.networkName || 'default',
                },
              ],
              ...(template.networkInterfaceMultiqueue !== false && {
                networkInterfaceMultiqueue: true,
              }),
              rng: {},
            },
            memory: {
              guest: template.memory || '2Gi',
            },
          },
          hostname: '${NAME}',
          networks: [
            {
              name: template.networkName || 'default',
              pod: {},
            },
          ],
          terminationGracePeriodSeconds: template.terminationGracePeriodSeconds || 180,
          ...(template.evictionStrategy && { evictionStrategy: template.evictionStrategy }),
          volumes: [
            buildRootDiskVolume(template),
            {
              cloudInitNoCloud: {
                userData: `#cloud-config
user: ${template.cloudInitUser || 'fedora'}
password: '\${CLOUD_USER_PASSWORD}'
chpasswd: { expire: False }`,
              },
              name: template.cloudInitDiskName || 'cloudinitdisk',
            },
            ...(template.additionalDisks || []).map((disk) =>
              buildDiskVolume(disk.name, disk.source),
            ),
          ],
        },
      },
    },
  };
}
