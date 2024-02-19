import * as React from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getOsNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type OperatingSystemProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  loadedGuestAgent: boolean;
  vmi: V1VirtualMachineInstance;
};

const OperatingSystem: React.FC<OperatingSystemProps> = ({
  guestAgentData,
  loadedGuestAgent,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        (loadedGuestAgent &&
          !isEmpty(guestAgentData) &&
          getOsNameFromGuestAgent(guestAgentData)) || <GuestAgentIsRequiredText vmi={vmi} />
      }
      descriptionHeader={t('Operating system')}
    />
  );
};

export default OperatingSystem;
