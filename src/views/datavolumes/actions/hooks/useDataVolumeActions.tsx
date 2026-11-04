import { useMemo } from 'react';

import { DataVolumeModel, DataVolumeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseDataVolumeActions = (dataVolume: V1beta1DataVolume) => [Action[], boolean];

const useDataVolumeActions: UseDataVolumeActions = (dataVolume) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [, inFlight] = useK8sModel(DataVolumeModelRef);

  const actions: Action[] = useMemo(() => {
    const handleLabelsSubmit = (labels: { [key: string]: string }): Promise<unknown> =>
      kubevirtK8sPatch({
        data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
        model: DataVolumeModel,
        resource: dataVolume,
      });

    const handleAnnotationsSubmit = (annotations: {
      [key: string]: string;
    }): Promise<unknown> =>
      kubevirtK8sPatch({
        data: [{ op: 'replace', path: '/metadata/annotations', value: annotations }],
        model: DataVolumeModel,
        resource: dataVolume,
      });

    const onDeleteSubmit = (): Promise<unknown> =>
      kubevirtK8sDelete({ model: DataVolumeModel, resource: dataVolume });

    return [
      {
        accessReview: asAccessReview(DataVolumeModel, dataVolume, 'patch'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              isOpen={isOpen}
              obj={dataVolume}
              onClose={onClose}
              onLabelsSubmit={handleLabelsSubmit}
            />
          )),
        id: 'datavolume-action-edit-labels',
        label: t('Edit labels'),
      },
      {
        accessReview: asAccessReview(DataVolumeModel, dataVolume, 'patch'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              isOpen={isOpen}
              obj={dataVolume}
              onClose={onClose}
              onSubmit={handleAnnotationsSubmit}
            />
          )),
        id: 'datavolume-action-edit-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(DataVolumeModel, dataVolume, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              headerText={t('Delete DataVolume?')}
              isOpen={isOpen}
              obj={dataVolume}
              onClose={onClose}
              onDeleteSubmit={onDeleteSubmit}
            />
          )),
        id: 'datavolume-action-delete',
        label: t('Delete'),
      },
    ];
  }, [createModal, dataVolume, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useDataVolumeActions;
