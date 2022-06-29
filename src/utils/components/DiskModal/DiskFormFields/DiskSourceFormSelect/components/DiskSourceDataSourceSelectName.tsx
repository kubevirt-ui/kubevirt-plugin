import * as React from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect as FilterDataSourcesSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNameProps = {
  dataSourceNameSelected: string;
  dataSourceNames: string[];
  onChange: React.Dispatch<React.SetStateAction<string>>;
  dataSourcesLoaded: boolean;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  dataSourceNameSelected,
  dataSourceNames,
  onChange,
  dataSourcesLoaded,
  isDisabled,
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
    <FormGroup label={t('{{dsLabel}} name', { dsLabel })} fieldId={fieldId} id={fieldId} isRequired>
      {dataSourcesLoaded || isDisabled ? (
        <Select
          menuAppendTo="parent"
          aria-labelledby={fieldId}
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          hasInlineFilter
          selections={dataSourceNameSelected}
          onFilter={FilterDataSourcesSelect(dataSourceNames)}
          placeholderText={t('--- Select {{ dsLabel }} name ---', { dsLabel })}
          isDisabled={isDisabled}
          maxHeight={400}
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
