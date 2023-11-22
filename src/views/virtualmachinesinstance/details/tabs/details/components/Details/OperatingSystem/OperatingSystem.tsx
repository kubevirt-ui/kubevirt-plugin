import * as React from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getOsNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

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
    <>
      <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
      <DescriptionListDescription>
        {(loadedGuestAgent &&
          !isEmpty(guestAgentData) &&
          getOsNameFromGuestAgent(guestAgentData)) || <GuestAgentIsRequiredText vmi={vmi} />}
      </DescriptionListDescription>
    </>
  );
};

export default OperatingSystem;
