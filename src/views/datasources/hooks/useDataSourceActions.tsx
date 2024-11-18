import React, { useCallback, useMemo, useState } from 'react';

import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import ExportModal from '@kubevirt-utils/components/ExportModal/ExportModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VolumeSnapshotModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Action, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

import DeleteDataSourceModal from '../actions/DeleteDataSourceModal/DeleteDataSourceModal';
import { DataImportCronManageModal } from '../dataimportcron/details/DataImportCronManageModal/DataImportCronManageModal';
import { getDataSourceCronJob, isDataResourceOwnedBySSP } from '../utils';

type UseDataSourceActionsProvider = (
  dataSource: V1beta1DataSource,
) => [actions: Action[], onOpen: () => void];

export const useDataSourceActionsProvider: UseDataSourceActionsProvider = (dataSource) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [dataImportCron, setDataImportCron] = useState<V1beta1DataImportCron>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isOwnedBySSP = isDataResourceOwnedBySSP(dataSource);
  const dataImportCronName = getDataSourceCronJob(dataSource);

  const lazyLoadDataImportCron = useCallback(() => {
    if (dataImportCronName && !dataImportCron && !isOwnedBySSP) {
      setIsLoading(true);
      k8sGet<V1beta1DataImportCron>({
        model: DataImportCronModel,
        name: dataImportCronName,
        ns: dataSource?.metadata?.namespace,
      })
        .then((dic) => setDataImportCron(dic))
        .catch(kubevirtConsole.error)
        .finally(() => setIsLoading(false));
    }
  }, [dataImportCron, dataImportCronName, dataSource?.metadata?.namespace, isOwnedBySSP]);

  const actions = useMemo(
    () => [
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              onLabelsSubmit={(labels) =>
                k8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                  model: DataSourceModel,
                  resource: dataSource,
                })
              }
              isOpen={isOpen}
              obj={dataSource}
              onClose={onClose}
            />
          )),
        disabled: false,
        id: 'datasource-action-edit-labels',
        label: t('Edit labels'),
      },
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              onSubmit={(updatedAnnotations) =>
                k8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/annotations',
                      value: updatedAnnotations,
                    },
                  ],
                  model: DataSourceModel,
                  resource: dataSource,
                })
              }
              isOpen={isOpen}
              obj={dataSource}
              onClose={onClose}
            />
          )),
        disabled: false,
        id: 'datasource-action-edit-annotations',
        label: t('Edit annotations'),
      },
      {
        cta: async () => {
          if (isEmpty(dataSource?.spec?.source?.snapshot?.name)) {
            createModal(({ isOpen, onClose }) => (
              <ExportModal
                isOpen={isOpen}
                namespace={dataSource?.spec?.source?.pvc?.namespace}
                onClose={onClose}
                pvcName={dataSource?.spec?.source?.pvc?.name}
              />
            ));

            return;
          }

          const volumeSnapshot = await k8sGet<VolumeSnapshotKind>({
            model: VolumeSnapshotModel,
            name: dataSource?.spec?.source?.snapshot?.name,
            ns: dataSource?.spec?.source?.snapshot?.namespace,
          });

          createModal(({ isOpen, onClose }) => (
            <ExportModal
              isOpen={isOpen}
              namespace={dataSource?.spec?.source?.snapshot?.namespace}
              onClose={onClose}
              pvcName={volumeSnapshot?.spec?.source?.persistentVolumeClaimName}
            />
          ));
        },
        id: 'datasource-action-upload-to-registry',
        label: t('Upload to registry'),
      },
      {
        accessReview: asAccessReview(DataSourceModel, dataSource, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteDataSourceModal
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isOpen={isOpen}
              onClose={onClose}
            />
          )),
        id: 'datasource-action-delete',
        label: t('Delete'),
      },
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DataImportCronManageModal
              onClose={() => {
                onClose();
                setDataImportCron(undefined);
              }}
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isOpen={isOpen}
            />
          )),
        description: isOwnedBySSP && t('Red Hat DataSources cannot be edited'),
        disabled: !dataImportCron || isOwnedBySSP || isLoading,
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
      },
    ],
    [t, dataSource, isOwnedBySSP, dataImportCron, isLoading, createModal],
  );

  return [actions, lazyLoadDataImportCron];
};
