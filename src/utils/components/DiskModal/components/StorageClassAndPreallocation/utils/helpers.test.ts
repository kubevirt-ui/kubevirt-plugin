import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from '@kubevirt-utils/hooks/useDefaultStorage/constants';

import { getDefaultStorageClass } from './helpers';

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

describe('getDefaultStorageClass', () => {
  it('prefers virtualization default storage class over cluster default', () => {
    const clusterDefault = createStorageClass('cluster-default', {
      [DEFAULT_STORAGE_CLASS_ANNOTATION]: 'true',
    });
    const virtDefault = createStorageClass('virt-default', {
      [DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION]: 'true',
    });

    expect(getDefaultStorageClass([clusterDefault, virtDefault])).toBe(virtDefault);
  });

  it('falls back to cluster default when no virtualization default exists', () => {
    const clusterDefault = createStorageClass('cluster-default', {
      [DEFAULT_STORAGE_CLASS_ANNOTATION]: 'true',
    });

    expect(getDefaultStorageClass([clusterDefault])).toBe(clusterDefault);
  });
});
