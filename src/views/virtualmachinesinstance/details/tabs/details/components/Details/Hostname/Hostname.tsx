import type { FC } from 'react';

import type { V1VirtualMachineInstanceGuestAgentInfo } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type HostnameProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
};

const Hostname: FC<HostnameProps> = ({ guestAgentData }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {guestAgentData?.hostname ?? (
        <div className="pf-v6-u-text-color-subtle">{t('Guest agent is required')} </div>
      )}
    </>
  );
};

export default Hostname;
