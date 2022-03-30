import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Label } from '@patternfly/react-core';

type HotplugLabelProps = {
  vm: V1VirtualMachine;
  diskName: string;
  vmi?: V1VirtualMachineInstance;
};

export const HotplugLabel: React.FC<HotplugLabelProps> = ({ vm, diskName, vmi }) => {
  const { t } = useKubevirtTranslation();

  const hotplugText = React.useMemo(() => {
    const volumeStatus = vmi?.status?.volumeStatus?.find(
      (volStatus) => volStatus.name === diskName,
    );

    const vmVolume = getVolumes(vm)?.find((vol) => vol?.name === diskName);
    if (!vmVolume && vmi) {
      return t('AutoDetach Hotplug');
    }
    if (!!volumeStatus?.hotplugVolume) {
      return t('Persistent Hotplug');
    }
    return null;
  }, [diskName, t, vm, vmi]);

  if (!hotplugText) {
    return null;
  }

  return (
    <Label variant="filled" color="purple">
      {hotplugText}
    </Label>
  );
};
