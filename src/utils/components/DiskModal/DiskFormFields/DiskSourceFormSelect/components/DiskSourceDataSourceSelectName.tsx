import * as React from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect as FilterDataSourcesSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNameProps = {
  dataSourceNames: string[];
  dataSourceNameSelected: string;
  dataSourcesLoaded: boolean;
  isDisabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<string>>;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  dataSourceNames,
  dataSourceNameSelected,
  dataSourcesLoaded,
  isDisabled,
  onChange,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setIsOpen(false);
    },
    [onChange],
  );

  const fieldId = 'ds-name-select';
  const dsLabel = DataSourceModel.label;

  return (
    <FormGroup fieldId={fieldId} id={fieldId} isRequired label={t('{{dsLabel}} name', { dsLabel })}>
      {dataSourcesLoaded || isDisabled ? (
        <Select
          aria-labelledby={fieldId}
          hasInlineFilter
          isDisabled={isDisabled}
          isOpen={isOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={FilterDataSourcesSelect(dataSourceNames)}
          onSelect={onSelect}
          onToggle={setIsOpen}
          placeholderText={t('--- Select {{ dsLabel }} name ---', { dsLabel })}
          selections={dataSourceNameSelected}
          variant={SelectVariant.single}
        >
          {dataSourceNames.map((name) => (
            <SelectOption key={name} value={name} />
          ))}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectName;
