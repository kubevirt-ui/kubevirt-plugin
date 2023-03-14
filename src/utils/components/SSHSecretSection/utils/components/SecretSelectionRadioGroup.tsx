import React, { Dispatch, FC, SetStateAction } from 'react';

import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

type SecretSelectionRadioGroupProps = {
  selectedOption: SecretSelectionOption;
  setSelectedOption: Dispatch<SetStateAction<SecretSelectionOption>>;
};

const SecretSelectionRadioGroup: FC<SecretSelectionRadioGroupProps> = ({
  selectedOption,
  setSelectedOption,
}) => {
  return (
    <Split hasGutter>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.none}
          id={SecretSelectionOption.none}
          name="ssh-secret-selection"
          label={t('None')}
          onClick={() => setSelectedOption(SecretSelectionOption.none)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.useExisting}
          id={SecretSelectionOption.useExisting}
          name="ssh-secret-selection"
          label={t('Use existing')}
          onClick={() => setSelectedOption(SecretSelectionOption.useExisting)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.addNew}
          id={SecretSelectionOption.addNew}
          name="ssh-secret-selection"
          label={t('Add new')}
          onClick={() => setSelectedOption(SecretSelectionOption.addNew)}
        />
      </SplitItem>
    </Split>
  );
};

export default SecretSelectionRadioGroup;
