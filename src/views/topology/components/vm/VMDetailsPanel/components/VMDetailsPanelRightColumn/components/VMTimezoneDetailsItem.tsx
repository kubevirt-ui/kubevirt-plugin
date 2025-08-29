import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';

import '../../../TopologyVMDetailsPanel.scss';

type VMTimezoneDetailsItemProps = {
  vmi: V1VirtualMachineInstance;
};

const VMTimezoneDetailsItem: FC<VMTimezoneDetailsItemProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [guestAgentData] = useGuestOS(vmi);

  return (
    <VirtualMachineDescriptionItem
      className="topology-vm-details-panel__item"
      data-test-id="virtual-machine-overview-details-timezone"
      descriptionData={guestAgentData?.timezone?.split(',')[0] || NO_DATA_DASH}
      descriptionHeader={t('Time zone')}
    />
  );
};

export default VMTimezoneDetailsItem;
