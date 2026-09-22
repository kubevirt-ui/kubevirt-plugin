import {
  DataSourceModel,
  DataVolumeModel,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  notifyBootableVolumeDeleted,
  notifyDataVolumeDeleted,
} from '@kubevirt-utils/hooks/useUploadProgressToast/cancel/notifyDeletedUploadResources';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { deleteDVAndRelatedResources } from './helpers';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sDelete: jest.fn(),
}));

jest.mock(
  '@kubevirt-utils/hooks/useUploadProgressToast/cancel/notifyDeletedUploadResources',
  () => ({
    notifyBootableVolumeDeleted: jest.fn(),
    notifyDataVolumeDeleted: jest.fn(),
  }),
);

const mockDelete = kubevirtK8sDelete as jest.Mock;
const mockNotifyDataVolumeDeleted = notifyDataVolumeDeleted as jest.Mock;
const mockNotifyBootableVolumeDeleted = notifyBootableVolumeDeleted as jest.Mock;

const DV_NAME = 'fedora-dv';
const DS_NAME = 'fedora-ds';
const PVC_NAME = 'fedora-pvc';
const NAMESPACE = 'default';

const dataVolume = { metadata: { name: DV_NAME, namespace: NAMESPACE } };
const dataSource = { metadata: { name: DS_NAME, namespace: NAMESPACE } };
const pvc = { metadata: { name: PVC_NAME, namespace: NAMESPACE } };

describe('deleteDVAndRelatedResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue({});
  });

  it('should notify DataVolume deletion when the DataVolume delete succeeds', async () => {
    await deleteDVAndRelatedResources(dataVolume, dataSource, pvc);

    expect(mockNotifyDataVolumeDeleted).toHaveBeenCalledWith(DV_NAME, NAMESPACE, undefined);
    expect(mockNotifyBootableVolumeDeleted).toHaveBeenCalledWith(DS_NAME, NAMESPACE, undefined);
  });

  it('should pass the DataVolume cluster to notifyDataVolumeDeleted', async () => {
    const clusteredDataVolume = { ...dataVolume, cluster: 'remote-cluster' };

    await deleteDVAndRelatedResources(clusteredDataVolume, dataSource, pvc);

    expect(mockNotifyDataVolumeDeleted).toHaveBeenCalledWith(DV_NAME, NAMESPACE, 'remote-cluster');
  });

  it('should notify DataVolume deletion when the DataVolume is already gone', async () => {
    mockDelete.mockImplementation(async ({ model }) => {
      if (model === DataVolumeModel) {
        throw { code: 404 };
      }

      return {};
    });

    await deleteDVAndRelatedResources(dataVolume, dataSource, pvc);

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ model: PersistentVolumeClaimModel }),
    );
    expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ model: DataSourceModel }));
    expect(mockNotifyDataVolumeDeleted).toHaveBeenCalledWith(DV_NAME, NAMESPACE, undefined);
  });

  it('should not notify DataVolume deletion when the DataVolume delete fails for a reason other than not found', async () => {
    mockDelete.mockImplementation(async ({ model }) => {
      if (model === DataVolumeModel) {
        throw { code: 403 };
      }

      return {};
    });

    await deleteDVAndRelatedResources(dataVolume, dataSource, pvc);

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ model: PersistentVolumeClaimModel }),
    );
    expect(mockNotifyDataVolumeDeleted).not.toHaveBeenCalled();
    expect(mockNotifyBootableVolumeDeleted).toHaveBeenCalledWith(DS_NAME, NAMESPACE, undefined);
  });

  it('should notify bootable volume deletion when the DataSource is already gone', async () => {
    mockDelete.mockImplementation(async ({ model }) => {
      if (model === DataSourceModel) {
        throw { code: 404 };
      }

      return {};
    });

    await deleteDVAndRelatedResources(dataVolume, dataSource, pvc);

    expect(mockNotifyDataVolumeDeleted).toHaveBeenCalledWith(DV_NAME, NAMESPACE, undefined);
    expect(mockNotifyBootableVolumeDeleted).toHaveBeenCalledWith(DS_NAME, NAMESPACE, undefined);
  });

  it('should not notify bootable volume deletion when the DataSource delete fails for a reason other than not found', async () => {
    mockDelete.mockImplementation(async ({ model }) => {
      if (model === DataSourceModel) {
        throw { code: 403 };
      }

      return {};
    });

    await deleteDVAndRelatedResources(dataVolume, dataSource, pvc);

    expect(mockNotifyDataVolumeDeleted).toHaveBeenCalledWith(DV_NAME, NAMESPACE, undefined);
    expect(mockNotifyBootableVolumeDeleted).not.toHaveBeenCalled();
  });
});
