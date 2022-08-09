import * as React from 'react';

import { V1VirtualMachineInstanceGuestAgentInfo } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type TimezoneProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
};

const Timezone: React.FC<TimezoneProps> = ({ guestAgentData }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {guestAgentData?.timezone?.split(',')?.[0] ?? (
        <div className="text-muted">{t('Guest agent is required')} </div>
      )}
    </>
  );
};

export default Timezone;
