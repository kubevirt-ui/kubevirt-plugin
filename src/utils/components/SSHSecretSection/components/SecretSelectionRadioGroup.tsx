import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';

import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { initialSSHCredentials } from '../utils/constants';

type SecretSelectionRadioGroupProps = {
  selectedOption: SecretSelectionOption;
  setSelectedOption: Dispatch<SetStateAction<SecretSelectionOption>>;
  setSSHCredentials: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SecretSelectionRadioGroup: FC<SecretSelectionRadioGroupProps> = ({
  selectedOption,
  setSelectedOption,
  setSSHCredentials,
}) => {
  // Inputs should not persist between changes of secretSelectionOption
  const onSelectSecretOption = useCallback(
    (secretOption: SecretSelectionOption) => {
      setSelectedOption((prevSecretOption) => {
        if (prevSecretOption !== secretOption) {
          setSSHCredentials(initialSSHCredentials);
        }

        return secretOption;
      });
    },
    [setSelectedOption, setSSHCredentials],
  );

  return (
    <Split className="ssh-secret-section__radio-group" hasGutter>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.none}
          id={SecretSelectionOption.none}
          name="ssh-secret-selection"
          label={t('None')}
          onClick={() => {
            onSelectSecretOption(SecretSelectionOption.none);
            setSSHCredentials(initialSSHCredentials);
          }}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.useExisting}
          id={SecretSelectionOption.useExisting}
          name="ssh-secret-selection"
          label={t('Use existing')}
          onClick={() => onSelectSecretOption(SecretSelectionOption.useExisting)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.addNew}
          id={SecretSelectionOption.addNew}
          name="ssh-secret-selection"
          label={t('Add new')}
          onClick={() => onSelectSecretOption(SecretSelectionOption.addNew)}
        />
      </SplitItem>
    </Split>
  );
};

export default SecretSelectionRadioGroup;
