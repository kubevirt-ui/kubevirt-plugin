import * as React from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getOSNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
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
    <DescriptionItem
      descriptionData={
        (loadedGuestAgent &&
          !isEmpty(guestAgentData) &&
          getOSNameFromGuestAgent(guestAgentData)) || <GuestAgentIsRequiredText vmi={vmi} />
      }
      descriptionHeader={t('Operating system')}
    />
  );
};

export default OperatingSystem;
