import { type FC, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { initialSSHCredentials } from '../utils/constants';
import { SecretSelectionOption, type SSHSecretDetails } from '../utils/types';

const SecretSelectionRadioGroup: FC = () => {
  const { t } = useKubevirtTranslation();
  const { getValues, reset, setValue, watch } = useFormContext<SSHSecretDetails>();
  const selectedOption = watch('secretOption');

  const onSelectSecretOption = useCallback(
    (secretOption: SecretSelectionOption) => {
      const prevSecretOption = getValues('secretOption');
      if (prevSecretOption === secretOption) {
        return;
      }

      setValue('secretOption', secretOption, { shouldDirty: true, shouldValidate: false });
      setValue('sshPubKey', '', { shouldDirty: true, shouldValidate: false });
      setValue('sshSecretName', '', { shouldDirty: true, shouldValidate: false });
    },
    [getValues, setValue],
  );

  const onSelectNone = useCallback(() => {
    reset(initialSSHCredentials);
  }, [reset]);

  return (
    <Split className="ssh-secret-section__radio-group" hasGutter>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.None}
          isChecked={selectedOption === SecretSelectionOption.None}
          label={t('None')}
          name="ssh-secret-selection"
          onChange={onSelectNone}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.UseExisting}
          isChecked={selectedOption === SecretSelectionOption.UseExisting}
          label={t('Use existing')}
          name="ssh-secret-selection"
          onChange={() => onSelectSecretOption(SecretSelectionOption.UseExisting)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={SecretSelectionOption.AddNew}
          isChecked={selectedOption === SecretSelectionOption.AddNew}
          label={t('Add new')}
          name="ssh-secret-selection"
          onChange={() => onSelectSecretOption(SecretSelectionOption.AddNew)}
        />
      </SplitItem>
    </Split>
  );
};

export default SecretSelectionRadioGroup;
