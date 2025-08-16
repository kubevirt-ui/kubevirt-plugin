import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const HardwareDevicesField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.HWDevices);

  return (
    <FormGroup isInline label={t('Hardware devices')} role="group">
      <Checkbox
        id="adv-search-vm-hardware-gpu-devices"
        isChecked={value.gpu}
        label={t('GPU devices')}
        onChange={(_, checked) => setValue({ ...value, gpu: checked })}
      />
      <Checkbox
        id="adv-search-vm-hardware-host-devices"
        isChecked={value.host}
        label={t('Host devices')}
        onChange={(_, checked) => setValue({ ...value, host: checked })}
      />
    </FormGroup>
  );
};

export default HardwareDevicesField;
