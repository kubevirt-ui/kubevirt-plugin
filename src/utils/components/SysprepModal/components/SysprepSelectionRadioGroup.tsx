import { type Dispatch, type FC, type SetStateAction, useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { SysprepSelectionOption } from '../types';

type SysprepSelectionRadioGroupProps = {
  canCreateConfigMap: boolean;
  selectedOption: SysprepSelectionOption;
  setAutoUnattend: Dispatch<SetStateAction<string>>;
  setSelectedOption: Dispatch<SetStateAction<SysprepSelectionOption>>;
  setSelectedSysprepName: Dispatch<SetStateAction<string>>;
  setUnattend: Dispatch<SetStateAction<string>>;
};

const SysprepSelectionRadioGroup: FC<SysprepSelectionRadioGroupProps> = ({
  canCreateConfigMap,
  selectedOption,
  setAutoUnattend,
  setSelectedOption,
  setSelectedSysprepName,
  setUnattend,
}) => {
  const { t } = useKubevirtTranslation();

  const onSelectOption = useCallback(
    (option: SysprepSelectionOption) => {
      setSelectedOption((previousOption) => {
        if (previousOption !== option) {
          setAutoUnattend('');
          setUnattend('');
          setSelectedSysprepName('');
        }

        return option;
      });
    },
    [setAutoUnattend, setSelectedOption, setSelectedSysprepName, setUnattend],
  );

  return (
    <Split className="sysprep-modal-section__radio-group" hasGutter>
      <SplitItem>
        <Radio
          data-test-id="sysprep-selection-none"
          id={SysprepSelectionOption.None}
          isChecked={selectedOption === SysprepSelectionOption.None}
          label={t('None')}
          name="sysprep-selection"
          onClick={() => onSelectOption(SysprepSelectionOption.None)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          data-test-id="sysprep-selection-use-existing"
          id={SysprepSelectionOption.UseExisting}
          isChecked={selectedOption === SysprepSelectionOption.UseExisting}
          label={t('Use existing')}
          name="sysprep-selection"
          onClick={() => onSelectOption(SysprepSelectionOption.UseExisting)}
        />
      </SplitItem>
      {canCreateConfigMap && (
        <SplitItem>
          <Radio
            data-test-id="sysprep-selection-create-new"
            id={SysprepSelectionOption.CreateNew}
            isChecked={selectedOption === SysprepSelectionOption.CreateNew}
            label={t('Create new')}
            name="sysprep-selection"
            onClick={() => onSelectOption(SysprepSelectionOption.CreateNew)}
          />
        </SplitItem>
      )}
    </Split>
  );
};

export default SysprepSelectionRadioGroup;
