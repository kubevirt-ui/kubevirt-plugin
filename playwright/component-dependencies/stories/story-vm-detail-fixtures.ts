import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

/** Running VM used by VM detail gallery scenes (matches production nav + overview chrome). */
export const sceneRunningVirtualMachine: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    annotations: {
      'name.os.template.kubevirt.io/rhel9.5': 'Red Hat Enterprise Linux 9.8 (Plow)',
    },
    labels: {
      'kubevirt.io/arch': 'amd64',
    },
    name: 'story-vm',
    namespace: 'default',
  },
  spec: {
    template: {
      spec: {
        domain: {
          cpu: { cores: 1, sockets: 1, threads: 1 },
          devices: {
            disks: [
              { bootOrder: 1, disk: { bus: 'virtio' }, name: 'rootdisk' },
              { disk: { bus: 'virtio' }, name: 'cloudinitdisk' },
            ],
            interfaces: [{ masquerade: {}, model: 'virtio', name: 'default' }],
          },
          resources: {
            requests: { memory: '2Gi' },
          },
        },
        hostname: 'story-vm',
        networks: [{ name: 'default', pod: {} }],
        volumes: [
          {
            name: 'rootdisk',
            persistentVolumeClaim: { claimName: 'story-vm-rootdisk' },
          },
          {
            cloudInitNoCloud: { userData: '#cloud-config\n' },
            name: 'cloudinitdisk',
          },
        ],
      },
    },
  },
  status: {
    printableStatus: 'Running',
  },
};

export const sceneRunningVmi: V1VirtualMachineInstance = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachineInstance',
  metadata: {
    name: 'story-vm',
    namespace: 'default',
  },
  status: {
    guestOSInfo: {
      id: 'rhel9',
      name: 'Red Hat Enterprise Linux 9.8 (Plow)',
    },
    phase: 'Running',
  },
};

export const sceneGuestAgentInfo = {
  hostname: 'story-vm',
  os: {
    name: 'Red Hat Enterprise Linux 9.8 (Plow)',
    version: '9.8',
  },
  timezone: 'America/New_York',
};

export const vmDetailSceneBasePath = `/k8s/ns/default/kubevirt.io~v1~VirtualMachine/${sceneRunningVirtualMachine.metadata?.name}`;
