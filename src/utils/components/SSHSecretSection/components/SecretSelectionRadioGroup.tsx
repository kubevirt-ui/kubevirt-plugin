import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
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
  const { setInstanceTypeVMState } = useInstanceTypeVMStore();

  // Inputs should not persist between changes of secretSelectionOption
  const onSelectSecretOption = useCallback(
    (secretOption: SecretSelectionOption) => {
      setSelectedOption((prevSecretOption) => {
        if (prevSecretOption !== secretOption) {
          setInstanceTypeVMState({
            type: instanceTypeActionType.setSSHCredentials,
            payload: { sshSecretName: '', sshSecretKey: '' },
          });
        }

        return secretOption;
      });
    },
    [setInstanceTypeVMState, setSelectedOption],
  );
  return (
    <Split hasGutter>
      <SplitItem>
        <Radio
          isChecked={selectedOption === SecretSelectionOption.none}
          id={SecretSelectionOption.none}
          name="ssh-secret-selection"
          label={t('None')}
          onClick={() => onSelectSecretOption(SecretSelectionOption.none)}
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
