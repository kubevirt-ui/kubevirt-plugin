import React, { FC } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  DATAVOLUME_SNAPSHOT_NAME,
  DATAVOLUME_SNAPSHOT_NAMESPACE,
  VM_CLUSTER_FIELD,
} from '../../../utils/constants';
import { getErrorSnapshotNamespace } from '../../../utils/selectors';
import { diskSourceSnapshotVolumeNamespaceFieldID } from '../../utils/constants';

const DiskSourceSnapshotVolumeSelectNamespace: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<V1DiskFormState>();

  const vmCluster = watch(VM_CLUSTER_FIELD);
  const [namespaceNames, namespacesLoaded] = useNamespaces(vmCluster);

  if (!namespacesLoaded) return <Loading />;

  const error = getErrorSnapshotNamespace(errors);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourceSnapshotVolumeNamespaceFieldID}
          id={diskSourceSnapshotVolumeNamespaceFieldID}
          isRequired
          label={t('VolumeSnapshot namespace')}
        >
          <InlineFilterSelect
            options={namespaceNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(NamespaceModel),
              value: name,
            }))}
            setSelected={(val) => {
              onChange(val);
              setValue<FieldPath<V1DiskFormState>>(DATAVOLUME_SNAPSHOT_NAME, null, {
                shouldValidate: true,
              });
            }}
            toggleProps={{
              isFullWidth: true,
            }}
            placeholder={t('Select Namespace')}
            selected={value}
          />
          <FormGroupHelperText
            validated={error ? ValidatedOptions.error : ValidatedOptions.default}
          >
            {error ? error?.message : t('Location of the existing VolumeSnapshot')}
          </FormGroupHelperText>
        </FormGroup>
      )}
      control={control}
      name={DATAVOLUME_SNAPSHOT_NAMESPACE}
      rules={{ required: t('Namespace is required.') }}
    />
  );
};

export default DiskSourceSnapshotVolumeSelectNamespace;
