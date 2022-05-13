import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  ValidatedOptions,
} from '@patternfly/react-core';

import { filter } from './utils';

type PersistentVolumeSelectNameProps = {
  isDisabled: boolean;
  pvcNameSelected: string;
  pvcNames: string[];
  onChange: (newPVCName: string) => void;
  'data-test-id': string;
};

export const PersistentVolumeSelectName: React.FC<PersistentVolumeSelectNameProps> = ({
  isDisabled,
  pvcNameSelected,
  pvcNames,
  onChange,
  'data-test-id': testId,
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

  return (
    <FormGroup
      label={t('Persistent Volume Claim name')}
      fieldId={testId}
      id={testId}
      isRequired
      className="pvc-selection-formgroup"
    >
      <Select
        aria-labelledby={testId}
        isOpen={isOpen}
        onToggle={() => setSelectOpen(!isOpen)}
        onSelect={onSelect}
        variant={SelectVariant.typeahead}
        selections={pvcNameSelected}
        onFilter={filter(pvcNames)}
        placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} name ---`)}
        isDisabled={isDisabled}
        validated={!pvcNameSelected ? ValidatedOptions.error : ValidatedOptions.default}
        aria-invalid={!pvcNameSelected ? true : false}
        maxHeight={400}
        data-test-id={`${testId}-dropdown`}
        toggleId={`${testId}-toggle`}
      >
        {pvcNames.map((name) => (
          <SelectOption key={name} value={name} />
        ))}
      </Select>
    </FormGroup>
  );
};
