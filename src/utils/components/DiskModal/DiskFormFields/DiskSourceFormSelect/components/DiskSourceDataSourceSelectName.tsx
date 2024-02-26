import React, { Dispatch, FC, SetStateAction } from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourcePVCSelectNameProps = {
  dataSourceNames: string[];
  dataSourceNameSelected: string;
  dataSourcesLoaded: boolean;
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
};

const DiskSourcePVCSelectName: FC<DiskSourcePVCSelectNameProps> = ({
  dataSourceNames,
  dataSourceNameSelected,
  dataSourcesLoaded,
  isDisabled,
  onChange,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'ds-name-select';
  const dsLabel = DataSourceModel.label;

  return (
    <FormGroup fieldId={fieldId} id={fieldId} isRequired label={t('{{dsLabel}} name', { dsLabel })}>
      {dataSourcesLoaded || isDisabled ? (
        <FilterSelect
          toggleProps={{
            isDisabled,
            isFullWidth: true,
            placeholder: t('--- Select {{ dsLabel }} name ---', { dsLabel }),
          }}
          options={dataSourceNames.map((name) => ({ children: name, value: name }))}
          selected={dataSourceNameSelected}
          setSelected={onChange}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectName;
