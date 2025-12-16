import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { DataImportCronModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { deleteDVAndRelatedResources } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import { ButtonVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';

import useUnderlyingPVC from './hooks/useUnderlyingPVC';

type DeleteDataSourceModalProps = {
  dataImportCron: V1beta1DataImportCron;
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteDataSourceModal: FC<DeleteDataSourceModalProps> = ({
  dataImportCron,
  dataSource,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();

  const [deletePVC, setDeletePVC] = useState<boolean>(false);
  const { dv, pvc, sourceExists } = useUnderlyingPVC(dataSource);

  const onDelete = async () => {
    try {
      await kubevirtK8sDelete({
        model: DataImportCronModel,
        resource: dataImportCron,
      });
    } catch (e) {
      kubevirtConsole.log(e?.message);
    } finally {
      await kubevirtK8sDelete({
        model: DataSourceModel,
        resource: dataSource,
      });
    }

    if (deletePVC && sourceExists) {
      await deleteDVAndRelatedResources(dv, dataSource, pvc);
    }
  };

  return (
    <TabModal<V1beta1DataSource>
      headerText={t('Delete DataSource?')}
      isOpen={isOpen}
      obj={dataSource}
      onClose={onClose}
      onSubmit={onDelete}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage obj={dataSource} />
        </StackItem>
        {sourceExists && (
          <StackItem>
            <Checkbox
              label={
                <Trans t={t}>
                  Delete {{ kind: pvc?.kind }} source <b>{{ name: getName(pvc) }}</b> in namespace{' '}
                  <b>{{ namespace: getNamespace(pvc) }}</b>
                </Trans>
              }
              id="delete-pvc-checkbox"
              isChecked={deletePVC}
              onChange={(_event, val) => setDeletePVC(val)}
            />
          </StackItem>
        )}
      </Stack>
    </TabModal>
  );
};

export default DeleteDataSourceModal;
