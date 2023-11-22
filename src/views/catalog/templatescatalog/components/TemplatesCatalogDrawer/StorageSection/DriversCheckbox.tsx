import React, { FC } from 'react';

import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

import { useDrawerContext } from '../hooks/useDrawerContext';

const DriversCheckbox: FC = () => {
  const { t } = useKubevirtTranslation();

  const { setVM, vm } = useDrawerContext();

  return (
    <FormGroup fieldId="customize-cdrom-drivers" label={t('Drivers')}>
      <WindowsDrivers updateVM={setVM} vm={vm} />
    </FormGroup>
  );
};

export default DriversCheckbox;
