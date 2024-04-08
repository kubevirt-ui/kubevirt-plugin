import React, { FC } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  clonePVCNameField,
  clonePVCNamespaceField,
  diskSourcePVCNamespaceFieldID,
} from '../../utils/constants';

const DiskSourcePVCSelectNamespace: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<DiskFormState>();
  const [projectNames, projectsLoaded] = useProjects();

  if (!projectsLoaded) return <Loading />;

  const error = errors?.pvc?.pvcNamespace;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourcePVCNamespaceFieldID}
          id={diskSourcePVCNamespaceFieldID}
          isRequired
          label={t('PersistentVolumeClaim project')}
        >
          <InlineFilterSelect
            options={projectNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: name,
            }))}
            setSelected={(val) => {
              onChange(val);
              setValue<FieldPath<DiskFormState>>(clonePVCNameField, null, { shouldValidate: true });
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
            {error ? error?.message : t('Location of the existing PVC')}
          </FormGroupHelperText>
        </FormGroup>
      )}
      control={control}
      name={clonePVCNamespaceField}
      rules={{ required: t('Project is required.') }}
    />
  );
};

export default DiskSourcePVCSelectNamespace;
