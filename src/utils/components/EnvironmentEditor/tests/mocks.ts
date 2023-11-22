import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const exampleVirtualMachineWithEnvironments: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    annotations: {
      description: 'VM example',
      'name.os.template.kubevirt.io/rhel8.5': 'Red Hat Enterprise Linux 8.0 or higher',
      'vm.kubevirt.io/validations': `[
          {    
            "name": "minimal-required-memory",    
            "path": "jsonpath::.spec.domain.memory.guest",
            "rule": "integer",    
            "message": "This VM requires more memory.",    
            "min": 1610612736  
          }
        ]`,
    },
    labels: {
      app: 'vm-example',
      'flavor.template.kubevirt.io/tiny': 'true',
      'os.template.kubevirt.io/rhel8.5': 'true',
      'vm.kubevirt.io/template': 'rhel8-server-tiny',
      'vm.kubevirt.io/template.namespace': 'openshift',
      'vm.kubevirt.io/template.revision': '1',
      'vm.kubevirt.io/template.version': 'v0.19.1',
      'workload.template.kubevirt.io/server': 'true',
    },
    name: 'vm-example',
    namespace: 'default',
  },
  spec: {
    running: false,
    template: {
      metadata: {
        annotations: {
          'vm.kubevirt.io/flavor': 'tiny',
          'vm.kubevirt.io/os': 'rhel8',
          'vm.kubevirt.io/workload': 'server',
        },
        labels: {
          'flavor.template.kubevirt.io/tiny': 'true',
          'kubevirt.io/domain': 'vm-example',
          'kubevirt.io/size': 'tiny',
          'os.template.kubevirt.io/rhel8.5': 'true',
          'vm.kubevirt.io/name': 'vm-example',
          'workload.template.kubevirt.io/server': 'true',
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
                bootOrder: 1,
                disk: {
                  bus: 'virtio',
                },
                name: 'containerdisk',
              },
              {
                disk: {
                  bus: 'virtio',
                },
                name: 'cloudinitdisk',
              },
              { disk: {}, name: 'first-env-disk', serial: '7ZP33F' },
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
          resources: {
            requests: {
              memory: '1.5Gi',
            },
          },
        },
        hostname: 'vm-example',
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
              image: 'registry.redhat.io/rhel8/rhel-guest-image',
            },
            name: 'containerdisk',
          },
          {
            cloudInitNoCloud: {
              userData:
                '#cloud-config\nuser: cloud-user\npassword: aibc-ppj2-bmg6\nchpasswd:\n  expire: false\n',
            },
            name: 'cloudinitdisk',
          },
          { name: 'first-env-disk', secret: { secretName: 'first-env' } },
        ],
      },
    },
  },
  status: {
    printableStatus: 'Running',
  },
};
