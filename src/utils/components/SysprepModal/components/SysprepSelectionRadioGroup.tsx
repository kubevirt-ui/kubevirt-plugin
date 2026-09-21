import { type Dispatch, type FC, type SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { SysprepSelectionOption } from '../types';

type SysprepSelectionRadioGroupProps = {
  canCreateConfigMap: boolean;
  selectedOption: SysprepSelectionOption;
  setSelectedOption: Dispatch<SetStateAction<SysprepSelectionOption>>;
};

const SysprepSelectionRadioGroup: FC<SysprepSelectionRadioGroupProps> = ({
  canCreateConfigMap,
  selectedOption,
  setSelectedOption,
}) => {
  const { t } = useKubevirtTranslation();

  const sysprepOptions = [
    { id: SysprepSelectionOption.None, label: t('None'), testId: 'none' },
    {
      id: SysprepSelectionOption.UseExisting,
      label: t('Use existing'),
      testId: 'use-existing',
    },
    ...(canCreateConfigMap
      ? [
          {
            id: SysprepSelectionOption.CreateNew,
            label: t('Create new'),
            testId: 'create-new',
          },
        ]
      : []),
  ];

  return (
    <Split className="sysprep-modal-section__radio-group" hasGutter>
      {sysprepOptions.map(({ id, label, testId }) => (
        <SplitItem key={id}>
          <Radio
            data-test-id={`sysprep-selection-${testId}`}
            id={id}
            isChecked={selectedOption === id}
            label={label}
            name="sysprep-selection"
            onClick={() => setSelectedOption(id)}
          />
        </SplitItem>
      ))}
    </Split>
  );
};

export default SysprepSelectionRadioGroup;
