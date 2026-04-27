import React, { FC } from 'react';

import { V1VirtualMachineInstanceGuestAgentInfo } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type TimezoneProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
};

const Timezone: FC<TimezoneProps> = ({ guestAgentData }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {guestAgentData?.timezone?.split(',')?.[0] ?? (
        <div className="pf-v6-u-text-color-subtle">{t('Guest agent is required')} </div>
      )}
    </>
  );
};

export default Timezone;
