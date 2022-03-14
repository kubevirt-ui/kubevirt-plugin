import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPUCount, getFlavor } from '@kubevirt-utils/resources/vmi';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const Flavor: React.FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const flavor = getFlavor(vmi?.metadata?.labels);
  const cpu = getCPUCount(vmi?.spec?.domain?.cpu);

  const memory = (vmi?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory;

  return <>{t('{{flavor}}: {{cpu}} CPU | {{memory}} Memory', { flavor, cpu, memory })}</>;
};

export default Flavor;
