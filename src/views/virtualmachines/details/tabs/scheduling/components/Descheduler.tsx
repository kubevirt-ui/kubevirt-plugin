import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';

type DeschedulerProps = {
  vm: V1VirtualMachine;
};

const Descheduler: React.FC<DeschedulerProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const deschedulerLabel =
    vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL] === 'true';

  return deschedulerLabel ? t('ON') : t('OFF');
};

export default Descheduler;
