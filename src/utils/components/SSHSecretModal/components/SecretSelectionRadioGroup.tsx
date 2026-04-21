import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { initialSSHCredentials } from '../utils/constants';
import { SecretSelectionOption, SSHSecretDetails } from '../utils/types';

type SecretSelectionRadioGroupProps = {
  selectedOption: SecretSelectionOption;
  setSelectedOption: Dispatch<SetStateAction<SecretSelectionOption>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SecretSelectionRadioGroup: FC<SecretSelectionRadioGroupProps> = ({
  selectedOption,
  setSelectedOption,
  setSSHDetails,
}) => {
  const { t } = useKubevirtTranslation();

  // Inputs should not persist between changes of secretSelectionOption
  const onSelectSecretOption = useCallback(
    (secretOption: SecretSelectionOption) => {
      setSelectedOption((prevSecretOption) => {
        if (prevSecretOption !== secretOption) {
          setSSHDetails((prev) => ({ ...prev, secretOption, sshPubKey: '', sshSecretName: '' }));
        }

        return secretOption;
      });
    },
    [setSelectedOption, setSSHDetails],
  );

  return (
    <Split className="ssh-secret-section__radio-group" hasGutter>
      <SplitItem>
        <Radio
          onClick={() => {
            onSelectSecretOption(SecretSelectionOption.none);
            setSSHDetails(initialSSHCredentials);
          }}
          id={SecretSelectionOption.none}
          isChecked={selectedOption === SecretSelectionOption.none}
          label={t('None')}
          name="ssh-secret-selection"
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.useExisting}
          isChecked={selectedOption === SecretSelectionOption.useExisting}
          label={t('Use existing')}
          name="ssh-secret-selection"
          onClick={() => onSelectSecretOption(SecretSelectionOption.useExisting)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.addNew}
          isChecked={selectedOption === SecretSelectionOption.addNew}
          label={t('Add new')}
          name="ssh-secret-selection"
          onClick={() => onSelectSecretOption(SecretSelectionOption.addNew)}
        />
      </SplitItem>
    </Split>
  );
};

export default SecretSelectionRadioGroup;
