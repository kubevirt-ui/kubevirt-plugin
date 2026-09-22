import type { TFunction } from 'i18next';

import {
  DataSourceModel,
  DataVolumeModel,
  modelToGroupVersionKind,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  getBootableVolumeSuccessLink,
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmCdromUploadContextLinks,
  getVmDiskUploadSuccessLinks,
  getVmStorageUrl,
} from './uploadLinks';

const t = ((key: string, options?: { name?: string }) =>
  options?.name ? `${key}:${options.name}` : key) as TFunction;

const DISK_NAME = 'disk-0';
const DV_NAME = 'dv-disk-0';
const VM_NAME = 'test-vm';
const NAMESPACE = 'default';

const createVm = (
  overrides: V1VirtualMachine['metadata'] = {},
  cluster?: string,
): V1VirtualMachine => ({
  ...(cluster ? { cluster } : {}),
  metadata: {
    name: VM_NAME,
    namespace: NAMESPACE,
    uid: 'vm-uid',
    ...overrides,
  },
  spec: { template: {} },
});

describe('getVmDiskUploadSuccessLinks', () => {
  it('should include the VM storage link when the VM is alive', () => {
    const vm = createVm();
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME);

    expect(links).toEqual([
      expect.objectContaining({ label: 'View disk {{name}}:disk-0', url: getVmStorageUrl(vm) }),
      expect.objectContaining({ label: 'View DataVolume {{name}}:dv-disk-0' }),
    ]);
  });

  it('should attach VM and DataVolume resource identity', () => {
    const vm = createVm();
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME);

    expect(links[0].resource).toEqual({
      groupVersionKind: modelToGroupVersionKind(VirtualMachineModel),
      name: VM_NAME,
      namespace: NAMESPACE,
    });
    expect(links[1].resource).toEqual({
      groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
      name: DV_NAME,
      namespace: NAMESPACE,
    });
  });

  it('should use fleet DataVolume URL when the VM has a cluster', () => {
    const vm = createVm({}, 'spoke-1');
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME);

    expect(links[1].url).toBe(getDataVolumeUrl(DV_NAME, NAMESPACE, 'spoke-1'));
    expect(links[1].resource).toEqual({
      cluster: 'spoke-1',
      groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
      name: DV_NAME,
      namespace: NAMESPACE,
    });
  });

  it('should omit the VM storage link when the VM has no uid', () => {
    const vm = createVm({ uid: undefined });
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME);

    expect(links).toHaveLength(1);
    expect(links[0].label).toBe('View DataVolume {{name}}:dv-disk-0');
  });

  it('should omit the VM storage link when the VM is deleted', () => {
    const vm = createVm({ deletionTimestamp: '2026-09-16T12:00:00Z' });
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME);

    expect(links).toHaveLength(1);
    expect(links[0].label).toBe('View DataVolume {{name}}:dv-disk-0');
  });

  it('should omit the DataVolume link when the DataVolume is deleted', () => {
    const vm = createVm();
    const links = getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME, false, false);

    expect(links).toEqual([
      expect.objectContaining({ label: 'View disk {{name}}:disk-0', url: getVmStorageUrl(vm) }),
    ]);
  });

  it('should return the CD-ROM storage link when the VM is alive', () => {
    const vm = createVm();

    expect(getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME, true)).toEqual(
      getVmCdromUploadContextLinks(t, vm),
    );
  });

  it('should return no CD-ROM links when the VM is deleted', () => {
    const vm = createVm({ deletionTimestamp: '2026-09-16T12:00:00Z' });

    expect(getVmDiskUploadSuccessLinks(t, vm, DISK_NAME, DV_NAME, true)).toEqual([]);
  });
});

describe('getBootableVolumeSuccessLink', () => {
  it('should attach DataSource resource identity', () => {
    const link = getBootableVolumeSuccessLink(t, 'fedora', NAMESPACE, 'spoke-1');

    expect(link).toEqual({
      label: 'View bootable volume {{name}}:fedora',
      resource: {
        cluster: 'spoke-1',
        groupVersionKind: modelToGroupVersionKind(DataSourceModel),
        name: 'fedora',
        namespace: NAMESPACE,
      },
      url: getBootableVolumeUrl('fedora', NAMESPACE, 'spoke-1'),
    });
  });
});

describe('getDataVolumeUrl', () => {
  it('should use a local DataVolume URL when no cluster is set', () => {
    expect(getDataVolumeUrl(DV_NAME, NAMESPACE)).toContain(
      `/k8s/ns/${NAMESPACE}/cdi.kubevirt.io~v1beta1~DataVolume/${DV_NAME}`,
    );
  });

  it('should use the multicloud search URL when a cluster is set', () => {
    const url = getDataVolumeUrl(DV_NAME, NAMESPACE, 'spoke-1');

    expect(url).toContain('/multicloud/search/resources');
    expect(url).toContain('cluster=spoke-1');
    expect(url).toContain(`name=${DV_NAME}`);
  });
});

describe('getBootableVolumeUrl', () => {
  it('should use a local DataSource URL when no cluster is set', () => {
    expect(getBootableVolumeUrl('fedora', 'default')).toContain(
      '/k8s/ns/default/cdi.kubevirt.io~v1beta1~DataSource/fedora',
    );
  });

  it('should use the multicloud search URL when a cluster is set', () => {
    const url = getBootableVolumeUrl('fedora', 'default', 'spoke-1');

    expect(url).toContain('/multicloud/search/resources');
    expect(url).toContain('cluster=spoke-1');
    expect(url).toContain('name=fedora');
    expect(url).toContain('from=bootablevolumes');
  });
});
