import React from 'react';
import { useHistory } from 'react-router-dom';

import DataImportCronModel, {
  DataImportCronModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Loading } from '@patternfly/quickstarts';
import { Split, SplitItem } from '@patternfly/react-core';

import { isDataResourceOwnedBySSP } from '../../utils';
import { DataImportCronManageModal } from '../details/DataImportCronManageModal/DataImportCronManageModal';

type UseDataImportCronActionsProvider = (
  DataImportCron: V1beta1DataImportCron,
) => [actions: Action[], onOpen: () => void];

export const useDataImportCronActionsProvider: UseDataImportCronActionsProvider = (
  dataImportCron,
) => {
  const dataSourceName = dataImportCron?.spec?.managedDataSource;
  const [dataSource, setDataSource] = React.useState<V1beta1DataSource>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const history = useHistory();
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataImportCron);

  const lazyLoadDataSource = React.useCallback(() => {
    if (dataSourceName && !dataSource && !isOwnedBySSP) {
      setIsLoading(true);
      k8sGet<V1beta1DataSource>({
        model: DataSourceModel,
        name: dataSourceName,
        ns: dataImportCron?.metadata?.namespace,
      })
        .then((ds) => setDataSource(ds))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [dataSource, dataSourceName, dataImportCron?.metadata?.namespace, isOwnedBySSP]);

  const actions = React.useMemo(
    () => [
      {
        id: 'dataimportcron-action-manage-source',
        label: (
          <Split hasGutter>
            <SplitItem>{t('Manage source')}</SplitItem>{' '}
            {isLoading && (
              <SplitItem>
                <Loading />
              </SplitItem>
            )}
          </Split>
        ),
        disabled: !dataImportCron || isOwnedBySSP || isLoading,
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DataImportCronManageModal
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isOpen={isOpen}
              onClose={() => {
                onClose();
                setDataSource(undefined);
              }}
            />
          )),
      },
      {
        id: 'dataimportcron-action-edit-labels',
        disabled: false,
        label: t('Edit labels'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              obj={dataImportCron}
              isOpen={isOpen}
              onClose={onClose}
              onLabelsSubmit={(labels) =>
                k8sPatch({
                  model: DataImportCronModel,
                  resource: dataImportCron,
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
        id: 'dataimportcron-action-edit-annotations',
        disabled: false,
        label: t('Edit annotations'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              obj={dataImportCron}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={(updatedAnnotations) =>
                k8sPatch({
                  model: DataImportCronModel,
                  resource: dataImportCron,
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
        id: 'dataimportcron-action-edit-DataImportCron',
        disabled: false,
        label: t('Edit DataImportCron'),
        cta: () =>
          history.push(
            `/k8s/ns/${dataImportCron.metadata.namespace}/${DataImportCronModelRef}/${dataImportCron.metadata.name}/yaml`,
          ),
      },
      {
        id: 'dataimportcron-action-delete',
        label: t('Delete DataImportCron'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              obj={dataImportCron}
              isOpen={isOpen}
              onClose={onClose}
              headerText={t('Delete DataImportCron?')}
              onDeleteSubmit={() =>
                k8sDelete({
                  model: DataImportCronModel,
                  resource: dataImportCron,
                })
              }
            />
          )),
        accessReview: asAccessReview(DataImportCronModel, dataImportCron, 'delete'),
      },
    ],
    [t, isLoading, dataImportCron, isOwnedBySSP, createModal, dataSource, history],
  );

  return [actions, lazyLoadDataSource];
};
