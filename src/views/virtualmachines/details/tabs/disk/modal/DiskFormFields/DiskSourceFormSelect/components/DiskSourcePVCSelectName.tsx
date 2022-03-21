import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNameProps = {
  pvcNameSelected: string;
  pvcNames: string[];
  onChange: React.Dispatch<React.SetStateAction<string>>;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  isDisabled,
  pvcNameSelected,
  pvcNames,
  onChange,
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
        placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} name ---`)}
        isDisabled={isDisabled}
        maxHeight={400}
      >
        {pvcNames.map((name) => (
          <SelectOption key={name} value={name} />
        ))}
      </Select>
    </FormGroup>
  );
};

export default DiskSourcePVCSelectName;
