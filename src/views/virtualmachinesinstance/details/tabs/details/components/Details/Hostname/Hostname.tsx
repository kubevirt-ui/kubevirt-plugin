import * as React from 'react';

import { V1VirtualMachineInstanceGuestAgentInfo } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type HostnameProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
};

const Hostname: React.FC<HostnameProps> = ({ guestAgentData }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {guestAgentData?.hostname ?? (
        <div className="text-muted">{t('Guest Agent is required')} </div>
      )}
    </>
  );
};

export default Hostname;
