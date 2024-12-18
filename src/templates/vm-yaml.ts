import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isClusterOnS390X, safeDump } from '@kubevirt-utils/utils/utils';

const defaultVM: V1VirtualMachine = {
  apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
  kind: VirtualMachineModel.kind,
  metadata: {
    annotations: {
      description: 'VM example',
    },
    labels: {
      app: 'example',
      'os.template.kubevirt.io/fedora': 'true',
    },
    name: 'example',
    namespace: 'default',
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
          'kubevirt.io/domain': 'example',
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
        hostname: 'example',
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
                '#cloud-config\nuser: fedora\npassword: fedora\nchpasswd: { expire: False }',
            },
            name: 'cloudinitdisk',
          },
        ],
      },
    },
  },
};

export const defaultVMYamlTemplate = safeDump(defaultVM);
