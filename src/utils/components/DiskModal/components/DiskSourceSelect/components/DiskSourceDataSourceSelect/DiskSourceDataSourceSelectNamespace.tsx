import React, { FC, useMemo } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  DATAVOLUME_DATASOURCE_NAME,
  DATAVOLUME_DATASOURCE_NAMESPACE,
} from '../../../utils/constants';
import { getDataSourceNamespaceError } from '../../../utils/selectors';
import { diskSourceDataSourceNamespaceFieldID } from '../../utils/constants';

const DiskSourceDataSourceSelectNamespace: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<V1DiskFormState>();
  const [projectNames, projectsLoaded] = useProjects();

  const projectOptions = useMemo(
    () =>
      projectNames?.map((name) => ({
        children: name,
        groupVersionKind: modelToGroupVersionKind(ProjectModel),
        value: name,
      })),
    [projectNames],
  );

  if (!projectsLoaded) return <Loading />;

  const error = getDataSourceNamespaceError(errors);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourceDataSourceNamespaceFieldID}
          id={diskSourceDataSourceNamespaceFieldID}
          isRequired
          label={t('DataSource project')}
        >
          <InlineFilterSelect
            setSelected={(val) => {
              onChange(val);
              setValue<FieldPath<V1DiskFormState>>(DATAVOLUME_DATASOURCE_NAME, null, {
                shouldValidate: true,
              });
            }}
            toggleProps={{
              isFullWidth: true,
              placeholder: t('Select DataSource'),
            }}
            options={projectOptions}
            selected={value}
          />
          <FormGroupHelperText
            validated={error ? ValidatedOptions.error : ValidatedOptions.default}
          >
            {error ? error?.message : t('Location of the existing DataSource')}
          </FormGroupHelperText>
        </FormGroup>
      )}
      control={control}
      name={DATAVOLUME_DATASOURCE_NAMESPACE}
      rules={{ required: t('Project is required.') }}
    />
  );
};

export default DiskSourceDataSourceSelectNamespace;
