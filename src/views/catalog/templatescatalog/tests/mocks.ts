export const containerTemplateMock = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    uid: '1',
    labels: {
      'flavor.template.kubevirt.io/small': 'true',
      'os.template.kubevirt.io/fedora29': 'true',
      'template.kubevirt.io/type': 'vm',
      'vm.kubevirt.io/template': 'fedora-generic',
      'vm.kubevirt.io/template.namespace': 'default',
      'workload.template.kubevirt.io/generic': 'true',
      'template.kubevirt.io/default-os-variant': 'true',
    },
    annotations: {
      description:
        'Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk image must be available. Red Hat Enterprise Linux Beta releases are made available only for testing purposes. Red Hat provides these Beta releases and revisions as a courtesy to facilitate early testing by users prior to a Generally Availability (GA) release, and to solicit feedback from users on the Beta functionality. Red Hat does not support the usage of RHEL Beta releases in production use cases. NOTE: Beta cases are handled as Severity 4. Upgrading to or from any RHEL Beta release is not an upgrade path that is supported by Red Hat. Red Hat Enterprise Linux Beta deployments cannot be directly updated to a non-beta Red Hat Enterprise Linux release, or vice-versa.',
      'name.os.template.kubevirt.io/fedora29': 'Fedora 29',
    },
    name: 'container-template',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              devices: {
                disks: [
                  {
                    bootOrder: 1,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                  },
                ],
                interfaces: [
                  {
                    bridge: {},
                    name: 'eth0',
                  },
                ],
                rng: {},
              },
              resources: {
                requests: {
                  memory: '2G',
                },
              },
            },
            networks: [
              {
                name: 'eth0',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                name: 'rootdisk',
                containerDisk: {
                  image: 'fooContainer',
                },
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
      name: 'NAME',
    },
  ],
};

export const urlTemplateMock = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    uid: '2',
    annotations: {
      description: 'foo description',
      'name.os.template.kubevirt.io/fedora29': 'Fedora 29',
    },
    labels: {
      'flavor.template.kubevirt.io/small': 'true',
      'os.template.kubevirt.io/fedora29': 'true',
      'template.kubevirt.io/type': 'vm',
      'vm.kubevirt.io/template': 'fedora-generic',
      'vm.kubevirt.io/template.namespace': 'default',
      'workload.template.kubevirt.io/generic': 'true',
    },
    name: 'url-template',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              devices: {
                disks: [
                  {
                    bootOrder: 1,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                  },
                ],
                interfaces: [
                  {
                    bridge: {},
                    name: 'eth0',
                  },
                ],
                rng: {},
              },
              resources: {
                requests: {
                  memory: '2G',
                },
              },
            },
            networks: [
              {
                name: 'eth0',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                dataVolume: {
                  // eslint-disable-next-line no-template-curly-in-string
                  name: 'url-template-rootdisk',
                },
                name: 'rootdisk',
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
      name: 'NAME',
    },
  ],
};
