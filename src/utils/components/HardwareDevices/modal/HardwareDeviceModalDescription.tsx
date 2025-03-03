import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

import { HARDWARE_DEVICE_TYPE } from '../utils/constants';

type HardwareDevicesModalProps = {
  type: HARDWARE_DEVICE_TYPE.GPUS | HARDWARE_DEVICE_TYPE.HOST_DEVICES;
};
const HardwareDeviceModalDescription: React.FC<HardwareDevicesModalProps> = ({ type }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Content className="text-muted" component={ContentVariants.p}>
      <Trans ns="plugin__kubevirt-plugin" t={t}>
        Enter a name for the device to be assigned and select it from the dropdown menu. Click{' '}
        <b> Save</b>.<br /> Click{' '}
        <b>+ Add {{ hardwareType: type === HARDWARE_DEVICE_TYPE.GPUS ? 'GPU' : 'Host' }} device</b>{' '}
        to add another devices.
      </Trans>
    </Content>
  );
};
export default HardwareDeviceModalDescription;
