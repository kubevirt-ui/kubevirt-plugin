import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { deleteDVAndPVC } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
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
      await k8sDelete({
        model: DataImportCronModel,
        resource: dataImportCron,
      });
    } catch (e) {
      kubevirtConsole.log(e?.message);
    } finally {
      await k8sDelete({
        model: DataSourceModel,
        resource: dataSource,
      });
    }

    if (deletePVC && sourceExists) {
      await deleteDVAndPVC(dv, pvc);
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
                  Delete {pvc?.kind} source <b>{getName(pvc)}</b> in namespace{' '}
                  <b>{getNamespace(pvc)}</b>
                </Trans>
              }
              id="delete-pvc-checkbox"
              isChecked={deletePVC}
              onChange={setDeletePVC}
            />
          </StackItem>
        )}
      </Stack>
    </TabModal>
  );
};

export default DeleteDataSourceModal;
