import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNameProps = {
  pvcNameSelected: string;
  pvcNames: string[];
  onChange: React.Dispatch<React.SetStateAction<string>>;
  pvcsLoaded: boolean;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  pvcNameSelected,
  pvcNames,
  onChange,
  pvcsLoaded,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setSelectOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setSelectOpen(false);
    },
    [onChange],
  );

  const fieldId = 'pvc-name-select';

  return (
    <FormGroup label={t('Persistent Volume Claim name')} fieldId={fieldId} id={fieldId} isRequired>
      {pvcsLoaded ? (
        <Select
          menuAppendTo="parent"
          aria-labelledby={fieldId}
          isOpen={isOpen}
          onToggle={() => setSelectOpen(!isOpen)}
          onSelect={onSelect}
          variant={SelectVariant.single}
          hasInlineFilter
          selections={pvcNameSelected}
          onFilter={FilterPVCSelect(pvcNames)}
          placeholderText={t('--- Select PersistentVolumeClaim name ---')}
          isDisabled={isDisabled}
          maxHeight={400}
        >
          {pvcNames.map((name) => (
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
