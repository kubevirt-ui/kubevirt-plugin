import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/state/initialState';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import { CreateDataSourceForm } from './CreateDataSourceForm';
import { createDataSourceWithImportCron, generateDataSourceName } from './utils';

export type CreateDataSourceModalFormType = {
  importsToKeep: number;
  name: string;
  schedule: string;
  size: string;
  url: string;
};

type CreateDataSourceModalProps = {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
};

export const CreateDataSourceModal: FC<CreateDataSourceModalProps> = ({
  isOpen,
  namespace,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<CreateDataSourceModalFormType>({
    defaultValues: {
      importsToKeep: 3,
      name: generateDataSourceName(),
      size: DEFAULT_DISK_SIZE,
    },
  });
  const importsToKeep = watch('importsToKeep');
  const size = watch('size');
  const name = watch('name');

  const onSubmit = handleSubmit(
    (data) =>
      createDataSourceWithImportCron({
        ...data,
        namespace: namespace || DEFAULT_NAMESPACE,
        url: data?.url?.includes('docker://') ? data?.url : 'docker://' + data?.url,
      }).then(() =>
        history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/${name}`),
      ),
    () => Promise.reject({ message: t('Missing required fields') }),
  );

  return (
    <TabModal
      headerText={t('Create DataSource')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit()}
    >
      <Stack hasGutter>
        <StackItem>
          <MutedTextSpan
            text={t(
              'Creates a DataImportCron, which defines a cron job to poll and import the disk image.',
            )}
          />
        </StackItem>
        <StackItem>
          <CreateDataSourceForm
            errors={errors}
            importsToKeep={importsToKeep}
            register={register}
            setValue={setValue}
            size={size}
          />
        </StackItem>
      </Stack>
    </TabModal>
  );
};
