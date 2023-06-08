import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { CpuMemHelperTextResources } from './utils/utils';

type CPUDescriptionProps = {
  cpu: V1CPU;
  helperTextResource?: string;
};

const CPUDescription: FC<CPUDescriptionProps> = ({
  cpu,
  helperTextResource = CpuMemHelperTextResources.ActualVM,
}) => {
  const { t } = useKubevirtTranslation();
  const { cores, sockets, threads } = cpu || {};

  return (
    <>
      <div>{t('CPUs = sockets x threads x cores.')} </div>
      <div>
        {helperTextResource}
        {t(' {{sockets}} sockets, {{threads}} threads, and {{cores}} cores.', {
          sockets,
          threads,
          cores,
        })}
      </div>
    </>
  );
};

export default CPUDescription;
