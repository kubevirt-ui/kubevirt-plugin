import React, { useCallback } from 'react';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ExportModal from '@kubevirt-utils/components/ExportModal/ExportModal';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { VolumeSnapshotModel } from '@kubevirt-utils/models';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

type CreateModalFn = (
  renderer: (props: { isOpen: boolean; onClose: () => void }) => React.ReactNode,
) => void;

const useUploadToRegistry = (
  createModal: CreateModalFn,
  dataSource: V1beta1DataSource,
): (() => Promise<void>) => {
  return useCallback(async (): Promise<void> => {
    if (isEmpty(dataSource?.spec?.source?.snapshot?.name)) {
      createModal(({ isOpen, onClose }) => (
        <ExportModal
          cluster={getCluster(dataSource)}
          isOpen={isOpen}
          namespace={dataSource?.spec?.source?.pvc?.namespace}
          onClose={onClose}
          pvcName={dataSource?.spec?.source?.pvc?.name}
        />
      ));
      return;
    }
    const volumeSnapshot = await kubevirtK8sGet<VolumeSnapshotKind>({
      cluster: getCluster(dataSource),
      model: VolumeSnapshotModel,
      name: dataSource?.spec?.source?.snapshot?.name,
      ns: dataSource?.spec?.source?.snapshot?.namespace,
    }).catch((error) => {
      kubevirtConsole.error('Failed to fetch VolumeSnapshot:', error);
      return undefined;
    });

    if (!volumeSnapshot) return;

    createModal(({ isOpen, onClose }) => (
      <ExportModal
        cluster={getCluster(dataSource)}
        isOpen={isOpen}
        namespace={dataSource?.spec?.source?.snapshot?.namespace}
        onClose={onClose}
        pvcName={volumeSnapshot?.spec?.source?.persistentVolumeClaimName}
      />
    ));
  }, [createModal, dataSource]);
};

export default useUploadToRegistry;
