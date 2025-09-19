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

  const formattedCpu = formatVCPUsAsSockets(cpu);
  const cores = formattedCpu?.cores || 1;
  const threads = formattedCpu?.threads || 1;
  const sockets = formattedCpu?.sockets || 1;

  return (
    <div id="cpu-helper-text">
      {t('Topology will be set to {{sockets}} socket, {{cores}} core, {{threads}} thread', {
        cores,
        sockets,
        threads,
      })}
    </div>
  );
};

export default CPUHelperText;
