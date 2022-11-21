import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import { CreateDataSourceForm } from './CreateDataSourceForm';
import { createDataSourceWithImportCron, generateDataSourceName } from './utils';

export type CreateDataSourceModalFormType = {
  name: string;
  size: string;
  url: string;
  importsToKeep: number;
  schedule: string;
};

type CreateDataSourceModalProps = {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
};

export const CreateDataSourceModal: React.FC<CreateDataSourceModalProps> = ({
  isOpen,
  namespace,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
  } = useForm<CreateDataSourceModalFormType>({
    defaultValues: {
      name: generateDataSourceName(),
      size: '30Gi',
      importsToKeep: 3,
    },
  });
  const importsToKeep = watch('importsToKeep');
  const size = watch('size');
  const name = watch('name');

  const onSubmit = handleSubmit(
    (data) =>
      createDataSourceWithImportCron({
        ...data,
        url: data?.url?.includes('docker://') ? data?.url : 'docker://' + data?.url,
        namespace: namespace || DEFAULT_NAMESPACE,
      }).then(() =>
        history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/${name}`),
      ),
    () => Promise.reject({ message: t('Missing required fields') }),
  );

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit()}
      headerText={t('Create DataSource')}
    >
      <Stack hasGutter>
        <StackItem>
          <MutedTextSpan
            text={t(
              'A DataImportCron will also be created, which will define a cron job for recurring polling/importing of the disk image',
            )}
          />
        </StackItem>
        <StackItem>
          <CreateDataSourceForm
            size={size}
            importsToKeep={importsToKeep}
            setValue={setValue}
            register={register}
            errors={errors}
          />
        </StackItem>
      </Stack>
    </TabModal>
  );
};
