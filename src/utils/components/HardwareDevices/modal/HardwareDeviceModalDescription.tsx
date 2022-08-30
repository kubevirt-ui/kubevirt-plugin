import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

import { HARDWARE_DEVICE_TYPE } from '../utils/constants';

type HardwareDevicesModalProps = {
  type: HARDWARE_DEVICE_TYPE.GPUS | HARDWARE_DEVICE_TYPE.HOST_DEVICES;
};
const HardwareDeviceModalDescription: React.FC<HardwareDevicesModalProps> = ({ type }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t} ns="plugin__kubevirt-plugin">
      <Text className="text-muted" component={TextVariants.p}>
        Enter a name for the device to be assigned and select it from the dropdown menu. Click{' '}
        <b> Save</b>.<br /> Click{' '}
        <b> + Add {type === HARDWARE_DEVICE_TYPE.GPUS ? 'GPU' : 'Host'} device </b> to add another
        devices.
      </Text>
    </Trans>
  );
};
export default HardwareDeviceModalDescription;
