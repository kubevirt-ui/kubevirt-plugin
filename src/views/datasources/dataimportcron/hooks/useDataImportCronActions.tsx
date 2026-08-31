import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { DataImportCronModel, DataImportCronModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type Action, k8sDelete, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
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
  const [dataSource, setDataSource] = useState<V1beta1DataSource>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataImportCron);

  const lazyLoadDataSource = useCallback(() => {
    if (dataSourceName && !dataSource && !isOwnedBySSP) {
      setIsLoading(true);
      k8sGet<V1beta1DataSource>({
        model: DataSourceModel,
        name: dataSourceName,
        ns: dataImportCron?.metadata?.namespace,
      })
        .then((dsc) => setDataSource(dsc))
        .catch(kubevirtConsole.error)
        .finally(() => setIsLoading(false));
    }
  }, [dataSource, dataSourceName, dataImportCron?.metadata?.namespace, isOwnedBySSP]);

  const actions = useMemo(() => {
    const handleLabelsSubmit = (labels: { [key: string]: string }): Promise<unknown> =>
      k8sPatch({
        data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
        model: DataImportCronModel,
        resource: dataImportCron,
      });
    const handleAnnotationsSubmit = (annotations: { [key: string]: string }): Promise<unknown> =>
      k8sPatch({
        data: [{ op: 'replace', path: '/metadata/annotations', value: annotations }],
        model: DataImportCronModel,
        resource: dataImportCron,
      });
    const handleDeleteSubmit = (): Promise<unknown> =>
      k8sDelete({ model: DataImportCronModel, resource: dataImportCron });
    const handleManageClose = (modalClose: () => void): void => {
      modalClose();
      setDataSource(undefined);
    };

    return [
      {
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <DataImportCronManageModal
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isOpen={isOpen}
              onClose={handleManageClose.bind(null, onClose)}
            />
          )),
        disabled: !dataImportCron || isOwnedBySSP || isLoading,
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
      },
      {
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              isOpen={isOpen}
              obj={dataImportCron}
              onClose={onClose}
              onLabelsSubmit={handleLabelsSubmit}
            />
          )),
        disabled: false,
        id: 'dataimportcron-action-edit-labels',
        label: t('Edit labels'),
      },
      {
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              isOpen={isOpen}
              obj={dataImportCron}
              onClose={onClose}
              onSubmit={handleAnnotationsSubmit}
            />
          )),
        disabled: false,
        id: 'dataimportcron-action-edit-annotations',
        label: t('Edit annotations'),
      },
      {
        cta: (): void => {
          navigate(
            `/k8s/ns/${dataImportCron.metadata.namespace}/${DataImportCronModelRef}/${dataImportCron.metadata.name}/yaml`,
          );
        },
        disabled: false,
        id: 'dataimportcron-action-edit-DataImportCron',
        label: t('Edit'),
      },
      {
        accessReview: asAccessReview(DataImportCronModel, dataImportCron, 'delete'),
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              headerText={t('Delete DataImportCron?')}
              isOpen={isOpen}
              obj={dataImportCron}
              onClose={onClose}
              onDeleteSubmit={handleDeleteSubmit}
            />
          )),
        id: 'dataimportcron-action-delete',
        label: t('Delete'),
      },
    ];
  }, [t, isLoading, dataImportCron, isOwnedBySSP, createModal, dataSource, navigate]);

  return [actions, lazyLoadDataSource];
};
