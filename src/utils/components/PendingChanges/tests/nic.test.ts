/* eslint-disable @typescript-eslint/no-shadow */
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getChangedNICs } from '../utils/helpers';

type TestData = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const enablePasst: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  binding: {
                    name: 'passt',
                  },
                  model: 'virtio',
                  name: 'default',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'a non-live-updatable field was changed in the template spec',
          status: 'True',
          type: 'RestartRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              binding: {
                name: 'l2bridge',
              },
              model: 'virtio',
              name: 'default',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
      ],
    },
    status: {
      conditions: [],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '192.168.10.5',
          ipAddresses: ['192.168.10.5', 'fe80::858:c0ff:fea8:a05'],
          linkState: 'up',
          mac: '0a:58:c0:a8:0a:05',
          name: 'default',
          podInterfaceName: 'ovn-udn1',
          queueCount: 1,
        },
      ],
    },
  },
};

const updateModel: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  name: 'default',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:0c',
                  model: 'e1000e',
                  name: 'nic-coffee-xerinae-51',
                  state: 'up',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-aesthetic-orangutan',
              },
              name: 'nic-coffee-xerinae-51',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'a non-live-updatable field was changed in the template spec',
          status: 'True',
          type: 'RestartRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:0c',
              model: 'virtio',
              name: 'nic-coffee-xerinae-51',
              state: 'up',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-coffee-xerinae-51',
        },
      ],
    },
    status: {
      conditions: [],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.128.2.150',
          ipAddresses: ['10.128.2.150', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
        {
          infoSource: 'domain, guest-agent, multus-status',
          interfaceName: 'eth1',
          linkState: 'up',
          mac: '02:62:1a:d8:e4:0c',
          name: 'nic-coffee-xerinae-51',
          podInterfaceName: 'pod91fed5b1a56',
          queueCount: 1,
        },
      ],
    },
  },
};

const updateNetwork_e1000e: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  name: 'default',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:0c',
                  model: 'e1000e',
                  name: 'nic-coffee-xerinae-51',
                  state: 'down',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-preliminary-alligator',
              },
              name: 'nic-coffee-xerinae-51',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'a non-live-updatable field was changed in the template spec',
          status: 'True',
          type: 'RestartRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:0c',
              model: 'e1000e',
              name: 'nic-coffee-xerinae-51',
              state: 'down',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-coffee-xerinae-51',
        },
      ],
    },
    status: {
      conditions: [],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.131.1.49',
          ipAddresses: ['10.131.1.49', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
        {
          infoSource: 'domain, guest-agent, multus-status',
          interfaceName: 'eth1',
          linkState: 'down',
          mac: '02:62:1a:d8:e4:0c',
          name: 'nic-coffee-xerinae-51',
          podInterfaceName: 'pod91fed5b1a56',
          queueCount: 1,
        },
      ],
    },
  },
};

const updateNetwork_virtio: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  name: 'default',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:1d',
                  model: 'virtio',
                  name: 'nic-lavender-kite-80',
                  state: 'up',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-preliminary-alligator',
              },
              name: 'nic-lavender-kite-80',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'a non-live-updatable field was changed in the template spec',
          status: 'True',
          type: 'RestartRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:1d',
              model: 'virtio',
              name: 'nic-lavender-kite-80',
              state: 'up',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-lavender-kite-80',
        },
      ],
    },
    status: {
      conditions: [],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.131.1.55',
          ipAddresses: ['10.131.1.55', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
        {
          infoSource: 'domain, guest-agent, multus-status',
          interfaceName: 'eth1',
          ipAddress: 'fe80::f40d:432b:e4db:5a15',
          ipAddresses: ['fe80::f40d:432b:e4db:5a15'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:1d',
          name: 'nic-lavender-kite-80',
          podInterfaceName: 'pod6f4c511ed27',
          queueCount: 1,
        },
      ],
    },
  },
};

const removeByDeleteTypeBridge: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  model: 'virtio',
                  name: 'default',
                  state: 'up',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'a non-live-updatable field was changed in the template spec',
          status: 'True',
          type: 'RestartRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
              state: 'up',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:1d',
              model: 'virtio',
              name: 'nic-lavender-kite-80',
              state: 'up',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-preliminary-alligator',
          },
          name: 'nic-lavender-kite-80',
        },
      ],
    },
    status: {
      conditions: [],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.131.1.57',
          ipAddresses: ['10.131.1.57', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
        {
          infoSource: 'domain, guest-agent, multus-status',
          interfaceName: 'eth1',
          ipAddress: 'fe80::f40d:432b:e4db:5a15',
          ipAddresses: ['fe80::f40d:432b:e4db:5a15'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:1d',
          name: 'nic-lavender-kite-80',
          podInterfaceName: 'pod6f4c511ed27',
          queueCount: 1,
        },
      ],
    },
  },
};

const addTypeBridgeWaitingForAutomigration: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  model: 'virtio',
                  name: 'default',
                  state: 'up',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:1e',
                  model: 'virtio',
                  name: 'nic-maroon-frog-98',
                  state: 'up',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-aesthetic-orangutan',
              },
              name: 'nic-maroon-frog-98',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          reason: 'AutoMigrationDueToLiveUpdate',
          status: 'True',
          type: 'MigrationRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
              state: 'up',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:1e',
              model: 'virtio',
              name: 'nic-maroon-frog-98',
              state: 'up',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-maroon-frog-98',
        },
      ],
    },
    status: {
      conditions: [
        {
          reason: 'AutoMigrationDueToLiveUpdate',
          status: 'True',
          type: 'MigrationRequired',
        },
      ],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.131.1.58',
          ipAddresses: ['10.131.1.58', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
      ],
    },
  },
};

const removeTypeBridgeAutomigrationBlocked: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  model: 'virtio',
                  name: 'default',
                  state: 'up',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:1e',
                  model: 'virtio',
                  name: 'nic-maroon-frog-98',
                  state: 'absent',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-aesthetic-orangutan',
              },
              name: 'nic-maroon-frog-98',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          message:
            "server error. command SyncVMI failed: \"LibvirtError(Code=99, Domain=20, Message='device not found: no device found at address '0000:02:00.0' matching MAC address '02:62:1a:d8:e4:1e' and alias 'ua-nic-maroon-frog-98'')\"",
          reason: 'Synchronizing with the Domain failed.',
          status: 'False',
          type: 'Synchronized',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
              state: 'up',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:1e',
              model: 'virtio',
              name: 'nic-maroon-frog-98',
              state: 'absent',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-maroon-frog-98',
        },
      ],
    },
    status: {
      conditions: [
        {
          message:
            "server error. command SyncVMI failed: \"LibvirtError(Code=99, Domain=20, Message='device not found: no device found at address '0000:02:00.0' matching MAC address '02:62:1a:d8:e4:1e' and alias 'ua-nic-maroon-frog-98'')\"",
          reason: 'Synchronizing with the Domain failed.',
          status: 'False',
          type: 'Synchronized',
        },
      ],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.131.1.60',
          ipAddresses: ['10.131.1.60', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
        {
          infoSource: 'domain, guest-agent, multus-status',
          interfaceName: 'eth1',
          ipAddress: 'fe80::6d56:27be:1a79:cbe6',
          ipAddresses: ['fe80::6d56:27be:1a79:cbe6'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:1e',
          name: 'nic-maroon-frog-98',
          podInterfaceName: 'pod21189a65b9f',
          queueCount: 1,
        },
      ],
    },
  },
};

const removeNewlyAdded: TestData = {
  vm: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              interfaces: [
                {
                  macAddress: '02:62:1a:d8:e4:08',
                  masquerade: {},
                  model: 'virtio',
                  name: 'default',
                  state: 'up',
                },
                {
                  bridge: {},
                  macAddress: '02:62:1a:d8:e4:23',
                  model: 'virtio',
                  name: 'nic-yellow-grouse-94',
                  state: 'absent',
                },
              ],
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
            {
              multus: {
                networkName: 'default/nad-aesthetic-orangutan',
              },
              name: 'nic-yellow-grouse-94',
            },
          ],
        },
      },
    },
    status: {
      conditions: [
        {
          reason: 'AutoMigrationDueToLiveUpdate',
          status: 'True',
          type: 'MigrationRequired',
        },
      ],
      printableStatus: 'Running',
    },
  },
  vmi: {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: {
      name: 'test-name',
      namespace: 'test-namespace',
    },
    spec: {
      domain: {
        devices: {
          autoattachPodInterface: false,
          interfaces: [
            {
              macAddress: '02:62:1a:d8:e4:08',
              masquerade: {},
              model: 'virtio',
              name: 'default',
              state: 'up',
            },
            {
              bridge: {},
              macAddress: '02:62:1a:d8:e4:23',
              model: 'virtio',
              name: 'nic-yellow-grouse-94',
              state: 'up',
            },
          ],
        },
      },
      networks: [
        {
          name: 'default',
          pod: {},
        },
        {
          multus: {
            networkName: 'default/nad-aesthetic-orangutan',
          },
          name: 'nic-yellow-grouse-94',
        },
      ],
    },
    status: {
      conditions: [
        {
          reason: 'AutoMigrationDueToLiveUpdate',
          status: 'True',
          type: 'MigrationRequired',
        },
      ],
      interfaces: [
        {
          infoSource: 'domain, guest-agent',
          interfaceName: 'eth0',
          ipAddress: '10.128.2.237',
          ipAddresses: ['10.128.2.237', 'fe80::62:1aff:fed8:e408'],
          linkState: 'up',
          mac: '02:62:1a:d8:e4:08',
          name: 'default',
          podInterfaceName: 'eth0',
          queueCount: 1,
        },
      ],
    },
  },
};

const getChanges = ({ vm, vmi }: TestData) => getChangedNICs(vm, vmi);

describe('NIC updates on a running VM', () => {
  test('update binding from l2bridge to passt', () => {
    expect(getChanges(enablePasst)).toEqual(['default']);
  });
  test('update model from virtio to e1000e', () => {
    expect(getChanges(updateModel)).toEqual(['nic-coffee-xerinae-51']);
  });
  test('update NAD for e1000e', () => {
    expect(getChanges(updateNetwork_e1000e)).toEqual(['nic-coffee-xerinae-51']);
  });
  test('update NAD for virtio', () => {
    expect(getChanges(updateNetwork_virtio)).toEqual(['nic-lavender-kite-80']);
  });
});

describe('NIC removal on a running VM', () => {
  test('removing NIC by deleting from VM spec(type bridge)', () => {
    expect(getChanges(removeByDeleteTypeBridge)).toEqual(['nic-lavender-kite-80']);
  });
  test('removing NIC (type bridge) but blocked', () => {
    expect(getChanges(removeTypeBridgeAutomigrationBlocked)).toEqual(['nic-maroon-frog-98']);
  });
  test('removing newly added NIC', () => {
    expect(getChanges(removeNewlyAdded)).toEqual(['nic-yellow-grouse-94']);
  });
});

describe('NIC add on a running VM', () => {
  test('adding NIC type bridge but waiting for automigration', () => {
    expect(getChanges(addTypeBridgeWaitingForAutomigration)).toEqual(['nic-maroon-frog-98']);
  });
});
