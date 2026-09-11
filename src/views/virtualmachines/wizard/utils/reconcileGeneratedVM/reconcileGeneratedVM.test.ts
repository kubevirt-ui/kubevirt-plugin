import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { reconcileGeneratedVM } from './reconcileGeneratedVM';

const createVM = (instanceTypeName: string): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    labels: { folder: 'original-folder' },
    name: 'test-vm',
    namespace: 'test-project',
  },
  spec: {
    instancetype: { name: instanceTypeName },
    template: {
      spec: {
        domain: {
          devices: {
            disks: [{ name: 'root-disk' }],
          },
        },
        networks: [{ name: 'default' }],
      },
    },
  },
});

describe('reconcileGeneratedVM', () => {
  it('updates generated fields and preserves unrelated customization', () => {
    const previousGeneratedVM = createVM('u1.medium');
    const customizedVM: V1VirtualMachine = {
      ...previousGeneratedVM,
      metadata: {
        ...previousGeneratedVM.metadata,
        labels: {
          ...previousGeneratedVM.metadata.labels,
          'kubevirt.io/deletion-protection': 'true',
        },
      },
      spec: {
        ...previousGeneratedVM.spec,
        template: {
          ...previousGeneratedVM.spec.template,
          spec: {
            ...previousGeneratedVM.spec.template.spec,
            hostname: 'custom-hostname',
          },
        },
      },
    };
    const nextGeneratedVM = createVM('u1.large');
    nextGeneratedVM.metadata.labels.folder = 'new-folder';

    const reconciledVM = reconcileGeneratedVM(previousGeneratedVM, customizedVM, nextGeneratedVM);

    expect(reconciledVM.spec.instancetype.name).toBe('u1.large');
    expect(reconciledVM.spec.template.spec.hostname).toBe('custom-hostname');
    expect(reconciledVM.metadata.labels).toEqual({
      folder: 'new-folder',
      'kubevirt.io/deletion-protection': 'true',
    });
  });

  it('preserves a customized array when generation did not change it', () => {
    const previousGeneratedVM = createVM('u1.medium');
    const customizedVM: V1VirtualMachine = {
      ...previousGeneratedVM,
      spec: {
        ...previousGeneratedVM.spec,
        template: {
          ...previousGeneratedVM.spec.template,
          spec: {
            ...previousGeneratedVM.spec.template.spec,
            networks: [{ name: 'custom-network' }],
          },
        },
      },
    };
    const nextGeneratedVM = createVM('u1.large');

    const reconciledVM = reconcileGeneratedVM(previousGeneratedVM, customizedVM, nextGeneratedVM);

    expect(reconciledVM.spec.template.spec.networks).toEqual([{ name: 'custom-network' }]);
  });

  it('preserves custom properties when generation removes their containing object', () => {
    const previousGeneratedVM = createVM('u1.medium');
    const customizedVM: V1VirtualMachine = {
      ...previousGeneratedVM,
      metadata: {
        ...previousGeneratedVM.metadata,
        labels: {
          ...previousGeneratedVM.metadata.labels,
          'kubevirt.io/deletion-protection': 'true',
        },
      },
    };
    const nextGeneratedVM = createVM('u1.large');
    delete nextGeneratedVM.metadata.labels;

    const reconciledVM = reconcileGeneratedVM(previousGeneratedVM, customizedVM, nextGeneratedVM);

    expect(reconciledVM.metadata.labels).toEqual({
      'kubevirt.io/deletion-protection': 'true',
    });
  });

  it('uses a generated array when both generation and customization changed it', () => {
    const previousGeneratedVM = createVM('u1.medium');
    const customizedVM: V1VirtualMachine = {
      ...previousGeneratedVM,
      spec: {
        ...previousGeneratedVM.spec,
        template: {
          ...previousGeneratedVM.spec.template,
          spec: {
            ...previousGeneratedVM.spec.template.spec,
            domain: {
              devices: {
                disks: [{ name: 'root-disk' }, { name: 'custom-disk' }],
              },
            },
          },
        },
      },
    };
    const nextGeneratedVM = createVM('u1.large');
    nextGeneratedVM.spec.template.spec.domain.devices.disks = [{ name: 'replacement-root-disk' }];

    const reconciledVM = reconcileGeneratedVM(previousGeneratedVM, customizedVM, nextGeneratedVM);

    expect(reconciledVM.spec.template.spec.domain.devices.disks).toEqual([
      { name: 'replacement-root-disk' },
    ]);
  });

  it('replaces correlated storage arrays together when generated storage changes', () => {
    const previousGeneratedVM = createVM('u1.medium');
    previousGeneratedVM.spec.dataVolumeTemplates = [
      {
        metadata: { name: 'root-dv' },
        spec: { storage: { resources: { requests: { storage: '30Gi' } } } },
      },
    ];
    previousGeneratedVM.spec.template.spec.volumes = [
      { dataVolume: { name: 'root-dv' }, name: 'root-disk' },
    ];
    const customizedVM: V1VirtualMachine = {
      ...previousGeneratedVM,
      spec: {
        ...previousGeneratedVM.spec,
        dataVolumeTemplates: [
          ...previousGeneratedVM.spec.dataVolumeTemplates,
          {
            metadata: { name: 'custom-dv' },
            spec: { storage: { resources: { requests: { storage: '10Gi' } } } },
          },
        ],
        template: {
          ...previousGeneratedVM.spec.template,
          spec: {
            ...previousGeneratedVM.spec.template.spec,
            domain: {
              devices: {
                disks: [{ name: 'root-disk' }, { name: 'custom-disk' }],
              },
            },
            volumes: [
              ...previousGeneratedVM.spec.template.spec.volumes,
              { dataVolume: { name: 'custom-dv' }, name: 'custom-disk' },
            ],
          },
        },
      },
    };
    const nextGeneratedVM = createVM('u1.large');
    nextGeneratedVM.spec.dataVolumeTemplates = [
      {
        metadata: { name: 'replacement-root-dv' },
        spec: { storage: { resources: { requests: { storage: '60Gi' } } } },
      },
    ];
    nextGeneratedVM.spec.template.spec.volumes = [
      { dataVolume: { name: 'replacement-root-dv' }, name: 'root-disk' },
    ];

    const reconciledVM = reconcileGeneratedVM(previousGeneratedVM, customizedVM, nextGeneratedVM);

    expect(reconciledVM.spec.dataVolumeTemplates).toEqual(nextGeneratedVM.spec.dataVolumeTemplates);
    expect(reconciledVM.spec.template.spec.domain.devices.disks).toEqual(
      nextGeneratedVM.spec.template.spec.domain.devices.disks,
    );
    expect(reconciledVM.spec.template.spec.volumes).toEqual(
      nextGeneratedVM.spec.template.spec.volumes,
    );
  });
});
