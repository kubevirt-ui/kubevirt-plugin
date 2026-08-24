import React, { useCallback, useMemo, useState } from 'react';

import { DataImportCronModel, DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

import { getDataSourceCronJob, isDataResourceOwnedBySSP } from '../utils';

import DeleteDataSourceModal from '../actions/DeleteDataSourceModal/DeleteDataSourceModal';
import { DataImportCronManageModal } from '../dataimportcron/details/DataImportCronManageModal/DataImportCronManageModal';
import useUploadToRegistry from './useUploadToRegistry';

type UseDataSourceActionsProvider = (
  dataSource: V1beta1DataSource,
  isBootableVolume?: boolean,
) => [actions: Action[], onOpen: () => void];

export const useDataSourceActionsProvider: UseDataSourceActionsProvider = (
  dataSource,
  isBootableVolume,
) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [dataImportCron, setDataImportCron] = useState<V1beta1DataImportCron>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataSource);
  const dataImportCronName = getDataSourceCronJob(dataSource);
  const handleUploadToRegistry = useUploadToRegistry(createModal, dataSource);

  const lazyLoadDataImportCron = useCallback(() => {
    if (dataImportCronName && !dataImportCron && !isOwnedBySSP) {
      setIsLoading(true);
      kubevirtK8sGet<V1beta1DataImportCron>({
        model: DataImportCronModel,
        name: dataImportCronName,
        ns: dataSource?.metadata?.namespace,
      })
        .then((dic) => setDataImportCron(dic))
        .catch(kubevirtConsole.error)
        .finally(() => setIsLoading(false));
    }
  }, [dataImportCron, dataImportCronName, dataSource?.metadata?.namespace, isOwnedBySSP]);

  const actions = useMemo(() => {
    const handleLabelsSubmit = (labels: { [key: string]: string }): Promise<unknown> =>
      kubevirtK8sPatch({
        data: [{ op: 'replace', path: '/metadata/labels', value: labels }],
        model: DataSourceModel,
        resource: dataSource,
      });
    const handleAnnotationsSubmit = (annotations: { [key: string]: string }): Promise<unknown> =>
      kubevirtK8sPatch({
        data: [{ op: 'replace', path: '/metadata/annotations', value: annotations }],
        model: DataSourceModel,
        resource: dataSource,
      });
    const handleManageClose = (modalClose: () => void): void => {
      modalClose();
      setDataImportCron(undefined);
    };

    return [
      {
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              isOpen={isOpen}
              obj={dataSource}
              onClose={onClose}
              onLabelsSubmit={handleLabelsSubmit}
            />
          )),
        id: 'datasource-action-edit-labels',
        label: t('Edit labels'),
      },
      {
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              isOpen={isOpen}
              obj={dataSource}
              onClose={onClose}
              onSubmit={handleAnnotationsSubmit}
            />
          )),
        disabled: false,
        id: 'datasource-action-edit-annotations',
        label: t('Edit annotations'),
      },
      {
        cta: handleUploadToRegistry,
        id: 'datasource-action-upload-to-registry',
        label: t('Upload to registry'),
      },
      {
        accessReview: asAccessReview(DataSourceModel, dataSource, 'delete'),
        cta: (): void =>
          createModal(({ isOpen, onClose }) => (
            <DeleteDataSourceModal
              dataImportCron={dataImportCron}
              dataSource={dataSource}
              isBootableVolume={isBootableVolume}
              isOpen={isOpen}
              onClose={onClose}
            />
          )),
        id: 'datasource-action-delete',
        label: t('Delete'),
      },
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
    ];
  }, [
    t,
    dataSource,
    isOwnedBySSP,
    dataImportCron,
    isLoading,
    isBootableVolume,
    createModal,
    handleUploadToRegistry,
  ]);

  return [actions, lazyLoadDataImportCron];
};
