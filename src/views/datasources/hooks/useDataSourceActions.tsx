import React from 'react';

import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

import { DataImportCronManageModal } from '../dataimportcron/details/DataImportCronManageModal/DataImportCronManageModal';
import { getDataSourceCronJob, isDataResourceOwnedBySSP } from '../utils';

type UseDataSourceActionsProvider = (
  dataSource: V1beta1DataSource,
) => [actions: Action[], onOpen: () => void];

export const useDataSourceActionsProvider: UseDataSourceActionsProvider = (dataSource) => {
  const dataImportCronName = getDataSourceCronJob(dataSource);
  const [dataImportCron, setDataImportCron] = React.useState<V1beta1DataImportCron>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataSource);

  const lazyLoadDataImportCron = React.useCallback(() => {
    if (dataImportCronName && !dataImportCron && !isOwnedBySSP) {
      setIsLoading(true);
      k8sGet<V1beta1DataImportCron>({
        model: DataImportCronModel,
        name: dataImportCronName,
        ns: dataSource?.metadata?.namespace,
      })
        .then((dic) => setDataImportCron(dic))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [dataImportCron, dataImportCronName, dataSource?.metadata?.namespace, isOwnedBySSP]);

  const actions = React.useMemo(
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
                })
              }
            />
          )),
        accessReview: asAccessReview(DataSourceModel, dataSource, 'delete'),
      },
      {
        id: 'datasource-action-manage-source',
        label: (
          <Split hasGutter>
            <SplitItem>{t('Manage source')}</SplitItem>
            {isLoading && (
              <SplitItem>
                <Loading />
              </SplitItem>
            )}
          </Split>
        ),
        description: isOwnedBySSP && t('Red Hat DataSources cannot be edited'),
        disabled: !dataImportCron || isOwnedBySSP || isLoading,
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DataImportCronManageModal
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isOpen={isOpen}
              onClose={() => {
                onClose();
                setDataImportCron(undefined);
              }}
            />
          )),
      },
    ],
    [t, dataSource, isLoading, dataImportCron, isOwnedBySSP, createModal],
  );

  return [actions, lazyLoadDataImportCron];
};
