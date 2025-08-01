import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { HWDevicesValue } from '@search/utils/types';

type HardwareDevicesFieldProps = {
  hwDevices: HWDevicesValue;
  setHWDevices: Dispatch<SetStateAction<HWDevicesValue>>;
};

const HardwareDevicesField: FC<HardwareDevicesFieldProps> = ({ hwDevices, setHWDevices }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup isInline label={t('Hardware devices')} role="group">
      <Checkbox
        id="adv-search-vm-hardware-gpu-devices"
        isChecked={hwDevices.gpu}
        label={t('GPU devices')}
        onChange={(_, checked) => setHWDevices((previous) => ({ ...previous, gpu: checked }))}
      />
      <Checkbox
        id="adv-search-vm-hardware-host-devices"
        isChecked={hwDevices.host}
        label={t('Host devices')}
        onChange={(_, checked) => setHWDevices((previous) => ({ ...previous, host: checked }))}
      />
    </FormGroup>
  );
};

export default HardwareDevicesField;
