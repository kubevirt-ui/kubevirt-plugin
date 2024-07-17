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

import { DATAVOLUME_PVC_NAME, DATAVOLUME_PVC_NAMESPACE } from '../../../utils/constants';
import { diskSourcePVCNamespaceFieldID } from '../../utils/constants';

const DiskSourcePVCSelectNamespace: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<V1DiskFormState>();
  const [projectNames, projectsLoaded] = useProjects();

  if (!projectsLoaded) return <Loading />;

  const error = errors?.dataVolumeTemplate?.spec?.source?.pvc?.namespace;

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
              setValue<FieldPath<V1DiskFormState>>(DATAVOLUME_PVC_NAME, null, {
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
            {error ? error?.message : t('Location of the existing PVC')}
          </FormGroupHelperText>
        </FormGroup>
      )}
      control={control}
      name={DATAVOLUME_PVC_NAMESPACE}
      rules={{ required: t('Project is required.') }}
    />
  );
};

export default DiskSourcePVCSelectNamespace;
