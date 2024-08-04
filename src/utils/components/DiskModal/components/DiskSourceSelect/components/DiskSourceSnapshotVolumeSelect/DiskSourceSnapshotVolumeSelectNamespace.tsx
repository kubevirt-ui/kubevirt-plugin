import React, { FC } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { DATAVOLUME_SNAPSHOT_NAME, DATAVOLUME_SNAPSHOT_NAMESPACE } from '../../../utils/constants';
import { getErrorSnapshotNamespace } from '../../../utils/selectors';
import { diskSourceSnapshotVolumeNamespaceFieldID } from '../../utils/constants';

const DiskSourceSnapshotVolumeSelectNamespace: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<V1DiskFormState>();
  const [projectNames, projectsLoaded] = useProjects();

  if (!projectsLoaded) return <Loading />;

  const error = getErrorSnapshotNamespace(errors);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourceSnapshotVolumeNamespaceFieldID}
          id={diskSourceSnapshotVolumeNamespaceFieldID}
          isRequired
          label={t('VolumeSnapshot project')}
        >
          <InlineFilterSelect
            options={projectNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
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
              placeholder: t('Select Project'),
            }}
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
      rules={{ required: t('Project is required.') }}
    />
  );
};

export default DiskSourceSnapshotVolumeSelectNamespace;
