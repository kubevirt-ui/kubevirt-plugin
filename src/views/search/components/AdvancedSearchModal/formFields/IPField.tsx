import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type IPFieldProps = {
  ip: string;
  setIP: (ip: string) => void;
};

const IPField: FC<IPFieldProps> = ({ ip, setIP }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('IP address')}>
      <TextInput
        data-test="adv-search-vm-ip"
        onChange={(_, value) => setIP(value)}
        type="text"
        value={ip}
      />
    </FormGroup>
  );
};

export default IPField;
