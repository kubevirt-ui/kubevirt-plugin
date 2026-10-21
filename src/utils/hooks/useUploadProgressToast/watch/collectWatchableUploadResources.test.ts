import { describe, expect, it } from '@jest/globals';
import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';

import { UPLOAD_PROGRESS_STATUS } from '../constants';

import { getUploadLinkedResource } from '../completion/uploadLinkedResource';
import { type UploadEntry, type UploadsStoreStateData } from '../uploads/types/types';
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

const createProgressToastState = (overrides: Partial<UploadEntry> = {}): UploadEntry => ({
  fileName: 'image.iso',
  progress: 40,
  status: UPLOAD_PROGRESS_STATUS.UPLOADING,
  ...overrides,
});

const createUploadsData = (
  uploadKey: string,
  overrides: Partial<UploadEntry> = {},
): UploadsStoreStateData => {
  return { [uploadKey]: { progressToastState: createProgressToastState(overrides) } };
};

describe('collectWatchableUploadResources', () => {
  it('should ignore URL-only links', () => {
    const uploadsData: UploadsStoreStateData = createUploadsData('export-disk/local/default/pvc', {
      contextLinks: [{ label: 'View pod logs', url: '/k8s/ns/default/pods/exporter/logs' }],
    });

    expect(collectWatchableUploadResources(uploadsData)).toEqual([]);
  });

  it('should dedupe the same VM resource across uploads', () => {
    const vmLink = { label: 'View storage', resource: vmResource, url: '/vm/storage' };
    const uploadsData: UploadsStoreStateData = {
      ...createUploadsData('vm-disk/default/test-vm/disk-0', {
        contextLinks: [vmLink],
      }),
      ...createUploadsData('vm-disk/default/test-vm/disk-1', {
        successLinks: [vmLink, { label: 'View DataVolume', resource: dvResource, url: '/dv' }],
      }),
    };

    const resources = collectWatchableUploadResources(uploadsData);

    expect(resources).toEqual([vmResource, dvResource]);
    expect(getUploadLinkedResourceWatchKey(resources[0])).toBe(
      getUploadLinkedResourceWatchKey(vmResource),
    );
  });

  it('should keep distinct resources with the same name in different identities', () => {
    const uploadsData: UploadsStoreStateData = {
      ...createUploadsData('vm-disk/default/other-vm/disk-0', {
        contextLinks: [{ label: 'View storage', resource: otherVmResource, url: '/other/storage' }],
      }),
      ...createUploadsData('vm-disk/default/test-vm/disk-0', {
        contextLinks: [{ label: 'View storage', resource: vmResource, url: '/vm/storage' }],
      }),
    };

    const resources = collectWatchableUploadResources(uploadsData);

    expect(resources).toHaveLength(2);
    expect(resources).toEqual(expect.arrayContaining([vmResource, otherVmResource]));
  });
});
