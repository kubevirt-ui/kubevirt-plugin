import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';

type DeschedulerProps = {
  vmi: V1VirtualMachineInstance;
};

const Descheduler: React.FC<DeschedulerProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const deschedulerLabel = Boolean(vmi?.metadata?.annotations[DESCHEDULER_EVICT_LABEL]);

  return deschedulerLabel ? t('ON') : t('OFF');
};

export default Descheduler;
