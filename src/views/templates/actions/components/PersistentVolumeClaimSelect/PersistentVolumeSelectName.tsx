import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Skeleton,
  ValidatedOptions,
} from '@patternfly/react-core';

import { filter } from './utils';

type PersistentVolumeSelectNameProps = {
  isDisabled: boolean;
  isLoading?: boolean;
  onChange: (newPVCName: string) => void;
  pvcNames: string[];
  pvcNameSelected: string;
};

export const PersistentVolumeSelectName: React.FC<PersistentVolumeSelectNameProps> = ({
  isDisabled,
  isLoading,
  onChange,
  pvcNames,
  pvcNameSelected,
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

  if (isLoading) {
    return (
      <>
        <br />
        <Skeleton className="pvc-selection-formgroup" fontSize="lg" />
        <br />
      </>
    );
  }

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('PVC name')}
    >
      <Select
        aria-invalid={!pvcNameSelected ? true : false}
        aria-labelledby={fieldId}
        isDisabled={isDisabled}
        isOpen={isOpen}
        maxHeight={400}
        menuAppendTo="parent"
        onFilter={filter(pvcNames)}
        onSelect={onSelect}
        onToggle={() => setSelectOpen(!isOpen)}
        placeholderText={t('--- Select PVC name ---')}
        selections={pvcNameSelected}
        validated={!pvcNameSelected ? ValidatedOptions.error : ValidatedOptions.default}
        variant={SelectVariant.typeahead}
      >
        {pvcNames.map((name) => (
          <SelectOption key={name} value={name} />
        ))}
      </Select>
    </FormGroup>
  );
};
