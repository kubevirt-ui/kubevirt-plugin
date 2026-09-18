import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import type { UploadEntry } from '../types';

import { getUploadLinkedResource } from '../completion/uploadLinkedResource';
import {
  collectWatchableUploadResources,
  getUploadLinkedResourceWatchKey,
} from './collectWatchableUploadResources';

const NAMESPACE = 'default';
const VM_NAME = 'test-vm';
const DV_NAME = 'dv-disk-0';

const vmResource = getUploadLinkedResource(VirtualMachineModel, VM_NAME, NAMESPACE);
const otherVmResource = getUploadLinkedResource(VirtualMachineModel, 'other-vm', NAMESPACE);
const dvResource = getUploadLinkedResource(DataVolumeModel, DV_NAME, NAMESPACE, 'spoke-1');

const createUpload = (overrides: Partial<UploadEntry> = {}): UploadEntry => ({
  fileName: 'image.iso',
  progress: 40,
  status: UPLOAD_PROGRESS_STATUS.UPLOADING,
  ...overrides,
});

describe('collectWatchableUploadResources', () => {
  it('should ignore URL-only links', () => {
    const uploads = {
      'export-disk/local/default/pvc': createUpload({
        contextLinks: [{ label: 'View pod logs', url: '/k8s/ns/default/pods/exporter/logs' }],
      }),
    };

    expect(collectWatchableUploadResources(uploads)).toEqual([]);
  });

  it('should dedupe the same VM resource across uploads', () => {
    const vmLink = { label: 'View storage', resource: vmResource, url: '/vm/storage' };
    const uploads = {
      'vm-disk/default/test-vm/disk-0': createUpload({ contextLinks: [vmLink] }),
      'vm-disk/default/test-vm/disk-1': createUpload({
        successLinks: [vmLink, { label: 'View DataVolume', resource: dvResource, url: '/dv' }],
      }),
    };

    const resources = collectWatchableUploadResources(uploads);

    expect(resources).toEqual([vmResource, dvResource]);
    expect(getUploadLinkedResourceWatchKey(resources[0])).toBe(
      getUploadLinkedResourceWatchKey(vmResource),
    );
  });

  it('should keep distinct resources with the same name in different identities', () => {
    const uploads = {
      'vm-disk/default/other-vm/disk-0': createUpload({
        contextLinks: [{ label: 'View storage', resource: otherVmResource, url: '/other/storage' }],
      }),
      'vm-disk/default/test-vm/disk-0': createUpload({
        contextLinks: [{ label: 'View storage', resource: vmResource, url: '/vm/storage' }],
      }),
    };

    const resources = collectWatchableUploadResources(uploads);

    expect(resources).toHaveLength(2);
    expect(resources).toEqual(expect.arrayContaining([vmResource, otherVmResource]));
  });
});
