import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Label } from '@patternfly/react-core';

type HotplugLabelProps = {
  diskName: string;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

export const HotplugLabel: React.FC<HotplugLabelProps> = ({ diskName, vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const hotplugText = React.useMemo(() => {
    const volumeStatus = vmi?.status?.volumeStatus?.find(
      (volStatus) => volStatus.name === diskName,
    );

    const vmVolume = getVolumes(vm)?.find((vol) => vol?.name === diskName);
    if (!vmVolume && vmi) {
      return t('AutoDetach Hotplug');
    }
    if (
      volumeStatus?.hotplugVolume ||
      vmVolume?.dataVolume?.hotpluggable ||
      vmVolume?.persistentVolumeClaim?.hotpluggable
    ) {
      return t('Persistent Hotplug');
    }
    return null;
  }, [diskName, t, vm, vmi]);

  if (!hotplugText) {
    return null;
  }

  return (
    <Label color="purple" variant="filled">
      {hotplugText}
    </Label>
  );
};
