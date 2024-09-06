import React, { FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespacedResources from '@kubevirt-utils/hooks/useNamespacedResources';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  DATAVOLUME_DATASOURCE_NAME,
  DATAVOLUME_DATASOURCE_NAMESPACE,
} from '../../../utils/constants';
import { getDataSourceNameError } from '../../../utils/selectors';
import { diskSourceDataSourceNameFieldID } from '../../utils/constants';

const DiskSourceDataSourceSelectName: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<V1DiskFormState>();

  const namespace = watch(DATAVOLUME_DATASOURCE_NAMESPACE);

  const [dataSources, dataSourcesLoaded] = useNamespacedResources<V1beta1DataSource>(
    namespace,
    DataSourceModelGroupVersionKind,
  );

  const dataSourceNames = useMemo(() => dataSources?.map(getName), [dataSources]);

  if (!dataSourcesLoaded) return <Loading />;

  const error = getDataSourceNameError(errors);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourceDataSourceNameFieldID}
          id={diskSourceDataSourceNameFieldID}
          isRequired
          label={t('DataSource name')}
        >
          <InlineFilterSelect
            options={dataSourceNames?.map((name) => ({
              children: name,
              groupVersionKind: DataSourceModelGroupVersionKind,
              value: name,
            }))}
            setSelected={(dataSourceName) => {
              onChange(dataSourceName);
            }}
            toggleProps={{
              isDisabled: isEmpty(namespace),
              isFullWidth: true,
              placeholder: t('Select DataSource'),
            }}
            selected={value}
          />
          {error && (
            <FormGroupHelperText validated={ValidatedOptions.error}>
              {error?.message}
            </FormGroupHelperText>
          )}
        </FormGroup>
      )}
      rules={{
        required: t('DataSource is required.'),
      }}
      control={control}
      name={DATAVOLUME_DATASOURCE_NAME}
    />
  );
};

export default DiskSourceDataSourceSelectName;
