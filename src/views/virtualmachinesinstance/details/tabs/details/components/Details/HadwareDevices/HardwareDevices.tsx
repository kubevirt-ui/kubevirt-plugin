import * as React from 'react';

import { V1Devices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type HardwareDevices = {
  devices: V1Devices;
};

const HardwareDevices: React.FC<HardwareDevices> = ({ devices }) => {
  const { t } = useKubevirtTranslation();
  const gpuDevices = devices?.gpus?.length || 0;
  const hostDevices = devices?.hostDevices?.length || 0;

  return (
    <div>
      <div className="text-muted">{t('{{gpuDevices}} GPU Devices', { gpuDevices })}</div>
      <div className="text-muted">{t('{{hostDevices}} Host Devices', { hostDevices })}</div>
    </div>
  );
};

export default HardwareDevices;
