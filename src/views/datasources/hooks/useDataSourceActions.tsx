import React from 'react';
import { useHistory } from 'react-router-dom';

import DataSourceModel, {
  DataSourceModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type UseDataSourceActionsProvider = (dataSource: V1beta1DataSource) => Action[];

export const useDataSourceActionsProvider: UseDataSourceActionsProvider = (dataSource) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const history = useHistory();

  return React.useMemo(
    () => [
      {
        id: 'datasource-action-edit-labels',
        disabled: false,
        label: t('Edit labels'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              obj={dataSource}
              isOpen={isOpen}
              onClose={onClose}
              onLabelsSubmit={(labels) =>
                k8sPatch({
                  model: DataSourceModel,
                  resource: dataSource,
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                })
              }
            />
          )),
      },
      {
        id: 'datasource-action-edit-annotations',
        disabled: false,
        label: t('Edit annotations'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              obj={dataSource}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={(updatedAnnotations) =>
                k8sPatch({
                  model: DataSourceModel,
                  resource: dataSource,
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/annotations',
                      value: updatedAnnotations,
                    },
                  ],
                })
              }
            />
          )),
      },
      {
        id: 'datasource-action-edit-datasource',
        disabled: false,
        label: t('Edit DataSource'),
        cta: () =>
          history.push(
            `/k8s/ns/${dataSource.metadata.namespace || 'default'}/${DataSourceModelRef}/${
              dataSource.metadata.name
            }/yaml`,
          ),
      },
      {
        id: 'datasource-action-delete',
        label: t('Delete DataSource'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              obj={dataSource}
              isOpen={isOpen}
              onClose={onClose}
              headerText={t('Delete DataSource?')}
              onDeleteSubmit={() =>
                k8sDelete({
                  model: DataSourceModel,
                  resource: dataSource,
                  json: undefined,
                  requestInit: undefined,
                })
              }
            />
          )),
        accessReview: asAccessReview(DataSourceModel, dataSource, 'delete'),
      },
    ],
    [t, createModal, dataSource, history],
  );
};
