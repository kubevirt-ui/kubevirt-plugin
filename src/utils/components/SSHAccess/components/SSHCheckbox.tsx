import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox } from '@patternfly/react-core';

type SSHCheckboxProps = {
  sshServiceRunning: boolean;
  setSSHServiceRunning: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

const SSHCheckbox: FC<SSHCheckboxProps> = ({
  sshServiceRunning,
  setSSHServiceRunning,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Checkbox
      id="ssh-service-checkbox"
      className="kv-ssh-service-checkbox--main"
      label={t('Create a Service to expose your VirtualMachine for SSH access')}
      isChecked={sshServiceRunning}
      data-checked-state={sshServiceRunning}
      onChange={setSSHServiceRunning}
      isDisabled={isDisabled}
    />
  );
};

export default SSHCheckbox;
