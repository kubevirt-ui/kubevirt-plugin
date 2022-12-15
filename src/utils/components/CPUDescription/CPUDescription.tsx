import * as React from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type CPUDescriptionProps = {
  cpu: V1CPU;
};

const CPUDescription: React.FC<CPUDescriptionProps> = ({ cpu }) => {
  const { t } = useKubevirtTranslation();
  const { cores, sockets, threads } = cpu || {};
  return (
    <>
      <div>{t('CPUs = sockets X threads X cores.')} </div>
      <div>
        {t(
          'This VirtualMachine has {{sockets}} sockets, {{threads}} threads, and {{cores}} cores.',
          { sockets, threads, cores },
        )}
      </div>
    </>
  );
};

export default CPUDescription;
