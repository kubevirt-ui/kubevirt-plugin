import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from './constants';
import {
  getPreferredDefaultStorageClass,
  isDefaultStorageClass,
  isVirtDefaultStorageClass,
} from './utils';

const createStorageClass = (
  name: string,
  annotations: Record<string, string> = {},
): IoK8sApiStorageV1StorageClass => ({
  metadata: {
    annotations,
    name,
  },
  provisioner: 'kubernetes.io/storage-provisioner',
});

describe('isDefaultStorageClass', () => {
  it('returns true when cluster default annotation is set', () => {
    const storageClass = createStorageClass('cluster-default', {
      [DEFAULT_STORAGE_CLASS_ANNOTATION]: 'true',
    });

    expect(isDefaultStorageClass(storageClass)).toBe(true);
  });

  it('returns false when cluster default annotation is missing', () => {
    expect(isDefaultStorageClass(createStorageClass('regular'))).toBe(false);
  });
});

describe('isVirtDefaultStorageClass', () => {
  it('returns true when virtualization default annotation is set', () => {
    const storageClass = createStorageClass('virt-default', {
      [DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION]: 'true',
    });

    expect(isVirtDefaultStorageClass(storageClass)).toBe(true);
  });

  it('returns false when virtualization default annotation is missing', () => {
    expect(isVirtDefaultStorageClass(createStorageClass('regular'))).toBe(false);
  });
});

describe('getPreferredDefaultStorageClass', () => {
  it('prefers virtualization default storage class over cluster default', () => {
    const clusterDefault = createStorageClass('cluster-default');
    const virtDefault = createStorageClass('virt-default');

    expect(
      getPreferredDefaultStorageClass({
        clusterDefaultStorageClass: clusterDefault,
        virtDefaultStorageClass: virtDefault,
      }),
    ).toBe(virtDefault);
  });

  it('falls back to cluster default when virtualization default is missing', () => {
    const clusterDefault = createStorageClass('cluster-default');

    expect(
      getPreferredDefaultStorageClass({
        clusterDefaultStorageClass: clusterDefault,
        virtDefaultStorageClass: null,
      }),
    ).toBe(clusterDefault);
  });
});
