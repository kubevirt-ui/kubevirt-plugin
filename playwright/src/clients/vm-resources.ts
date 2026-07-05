export const buildContainerDiskVmResource = (vmName: string, namespace: string): object => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    labels: { app: vmName, 'test-framework': 'playwright' },
    name: vmName,
    namespace,
  },
  spec: {
    runStrategy: 'Always',
    template: {
      metadata: { labels: { 'kubevirt.io/domain': vmName } },
      spec: {
        domain: {
          cpu: { cores: 1, sockets: 1, threads: 1 },
          devices: {
            disks: [{ disk: { bus: 'virtio' }, name: 'containerdisk' }],
            rng: {},
          },
          memory: { guest: '128Mi' },
        },
        volumes: [
          {
            containerDisk: {
              image: 'quay.io/kubevirt/cirros-container-disk-demo:latest',
            },
            name: 'containerdisk',
          },
        ],
      },
    },
  },
});
