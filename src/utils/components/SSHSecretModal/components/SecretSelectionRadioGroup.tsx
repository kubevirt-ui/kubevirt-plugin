import React, { type Dispatch, type FC, type SetStateAction, useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { initialSSHCredentials } from '../utils/constants';
import { SecretSelectionOption, type SSHSecretDetails } from '../utils/types';

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
          id={SecretSelectionOption.None}
          isChecked={selectedOption === SecretSelectionOption.None}
          label={t('None')}
          name="ssh-secret-selection"
          onClick={() => {
            onSelectSecretOption(SecretSelectionOption.None);
            setSSHDetails(initialSSHCredentials);
          }}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.UseExisting}
          isChecked={selectedOption === SecretSelectionOption.UseExisting}
          label={t('Use existing')}
          name="ssh-secret-selection"
          onClick={() => onSelectSecretOption(SecretSelectionOption.UseExisting)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.AddNew}
          isChecked={selectedOption === SecretSelectionOption.AddNew}
          label={t('Add new')}
          name="ssh-secret-selection"
          onClick={() => onSelectSecretOption(SecretSelectionOption.AddNew)}
        />
      </SplitItem>
    </Split>
  );
};

export default SecretSelectionRadioGroup;
