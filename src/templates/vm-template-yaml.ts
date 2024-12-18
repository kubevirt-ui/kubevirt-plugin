import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { isClusterOnS390X, safeDump } from '@kubevirt-utils/utils/utils';

const defaultTemplate: V1Template = {
  apiVersion: `${TemplateModel.apiGroup}/${TemplateModel.apiVersion}`,
  kind: `${TemplateModel.kind}`,
  metadata: {
    annotations: {
      description: 'VM template example',
      iconClass: 'icon-fedora',
      'name.os.template.kubevirt.io/fedora': 'Fedora',
      'openshift.io/display-name': 'Fedora VM',
    },
    labels: {
      'os.template.kubevirt.io/fedora': 'true',
      'template.kubevirt.io/type': 'vm',
      'workload.template.kubevirt.io/server': 'true',
    },
    name: 'example',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        annotations: {
          description: 'VM example',
        },
        labels: {
          app: '\\${NAME}',
          'os.template.kubevirt.io/fedora': 'true',
          'vm.kubevirt.io/template': 'example',
        },
        name: '\\${NAME}',
      },
      spec: {
        runStrategy: 'Halted',
        template: {
          metadata: {
            annotations: {
              'vm.kubevirt.io/flavor': 'small',
              'vm.kubevirt.io/os': 'fedora',
              'vm.kubevirt.io/workload': 'server',
            },
            labels: {
              'kubevirt.io/domain': '\\${NAME}',
              'kubevirt.io/size': 'small',
            },
          },
          spec: {
            domain: {
              cpu: {
                cores: 1,
                sockets: 1,
                threads: 1,
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
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
                    model: 'virtio',
                    name: 'default',
                  },
                ],
                networkInterfaceMultiqueue: true,
                rng: {},
              },

              ...(!isClusterOnS390X && {
                features: {
                  acpi: {},
                  smm: {
                    enabled: true,
                  },
                },
                firmware: {
                  bootloader: {
                    efi: {},
                  },
                },
                machine: {
                  type: 'q35',
                },
              }),
              memory: {
                guest: '2Gi',
              },
            },
            hostname: '\\${NAME}',
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 180,
            volumes: [
              {
                containerDisk: {
                  image: 'quay.io/containerdisks/fedora',
                },
                name: 'rootdisk',
              },
              {
                cloudInitNoCloud: {
                  userData:
                    "#cloud-config\nuser: fedora\npassword: '\\${CLOUD_USER_PASSWORD}'\nchpasswd: { expire: False }",
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
      description: 'Name for the new VM',
      from: 'example-[a-z0-9]{16}',
      generate: 'expression',
      name: 'NAME',
    },
    {
      description: 'Randomized password for the cloud-init user',
      from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
      generate: 'expression',
      name: 'CLOUD_USER_PASSWORD',
    },
  ],
};

export const defaultVMTemplateYamlTemplate = safeDump(defaultTemplate);
