/* eslint-disable @typescript-eslint/no-var-requires */
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';

export const getMockTemplate = (): V1Template => ({
  kind: 'Template',
  apiVersion: 'template.openshift.io/v1',
  metadata: {
    name: 'a-r5k45p7w7',
    namespace: 'rhodes',
    uid: '26b4ec5b-2d2c-43b4-9059-e8462499eae0',
    resourceVersion: '61631262',
    creationTimestamp: '2022-07-27T01:14:16Z',
    labels: {
      'os.template.kubevirt.io/fedora36': 'true',
      'template.kubevirt.io/type': 'vm',
      'workload.template.kubevirt.io/server': 'true',
    },
    annotations: {
      description: 'VM template example',
      iconClass: 'icon-fedora',
      'name.os.template.kubevirt.io/fedora36': 'Fedora 36',
      'openshift.io/display-name': 'a-clone',
      'openshift.io/provider-display-name': 'RhodesCo',
      'template.kubevirt.io/provider': 'RhodesCo',
    },
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        name: '${NAME}',
        annotations: {
          description: 'VM example',
        },
        labels: {
          app: '${NAME}',
          'vm.kubevirt.io/template': 'a-r5k45p7w7',
          'os.template.kubevirt.io/fedora36': 'true',
          'vm.kubevirt.io/template.namespace': 'rhodes',
        },
      },
      spec: {
        running: false,
        template: {
          metadata: {
            annotations: {
              'vm.kubevirt.io/flavor': 'small',
              'vm.kubevirt.io/os': 'fedora36',
              'vm.kubevirt.io/workload': 'server',
            },
            labels: {
              'kubevirt.io/domain': '${NAME}',
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
              resources: {
                requests: {
                  memory: '2Gi',
                },
              },
            },
            hostname: '${NAME}',
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 180,
            volumes: [
              {
                name: 'rootdisk',
                containerDisk: {
                  image: 'quay.io/containerdisks/fedora:36',
                },
              },
              {
                name: 'cloudinitdisk',
                cloudInitConfigDrive: {
                  userData:
                    "#cloud-config\npassword: '${CLOUD_USER_PASSWORD}'\nchpasswd: { expire: False }",
                },
              },
            ],
          },
        },
        dataVolumeTemplates: [],
      },
    },
  ],
  parameters: [
    {
      name: 'NAME',
      description: 'Name for the new VM',
      generate: 'expression',
      from: 'vm-template-example-[a-z0-9]{16}',
    },
    {
      name: 'CLOUD_USER_PASSWORD',
      description: 'Randomized password for the cloud-init user',
      generate: 'expression',
      from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
    },
  ],
});
