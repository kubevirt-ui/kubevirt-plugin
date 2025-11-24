import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getOSNameFromGuestAgent, useGuestOS } from '@kubevirt-utils/resources/vmi';

type VMOperatingSystemDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMOperatingSystemDetailsItem: FC<VMOperatingSystemDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const os = getOperatingSystemName(vm) || getOperatingSystem(vm);
  const [guestAgentInfo] = useGuestOS(vmi);
  const operatingSystem = getOSNameFromGuestAgent(guestAgentInfo);

  return (
    <DescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={operatingSystem || os}
      descriptionHeader={<span id="operating-system">{t('Operating system')}</span>}
    />
  );
};

export default VMOperatingSystemDetailsItem;
