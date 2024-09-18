import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { formatVCPUsAsSockets } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import './CPUHelperText.scss';

type CPUHelperTextProps = {
  cpu: V1CPU;
  hide: boolean;
};

const CPUHelperText: FC<CPUHelperTextProps> = ({ cpu, hide }) => {
  const { t } = useKubevirtTranslation();

  if (hide) return null;

  return (
    <div id="cpu-helper-text">
      {t('Topology will be set to {{sockets}} socket, 1 core, 1 thread', {
        sockets: formatVCPUsAsSockets(cpu)?.sockets,
      })}
    </div>
  );
};

export default CPUHelperText;
