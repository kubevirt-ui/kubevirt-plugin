import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import './CPUHelperText.scss';

type CPUHelperTextProps = {
  hide: boolean;
  sockets: number;
};

const CPUHelperText: FC<CPUHelperTextProps> = ({ hide, sockets }) => {
  const { t } = useKubevirtTranslation();

  if (hide) return null;

  return (
    <div id="cpu-helper-text">
      {t('Topology will be set to {{sockets}} socket, 1 core, 1 thread', { sockets: sockets })}
    </div>
  );
};

export default CPUHelperText;
