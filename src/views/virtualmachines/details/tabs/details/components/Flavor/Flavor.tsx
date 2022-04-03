import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPUCount, getFlavor } from '@kubevirt-utils/resources/vmi';

type FlavorProps = {
  vm: V1VirtualMachine;
};

const Flavor: React.FC<FlavorProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const flavor = getFlavor(vm?.spec?.template?.metadata?.labels);
  const cpu = getCPUCount(vm?.spec?.template?.spec?.domain?.cpu);

  const memory = (
    vm?.spec?.template?.spec?.domain?.resources?.requests as { [key: string]: string }
  )?.memory;

  return <>{t('{{flavor}}: {{cpu}} CPU | {{memory}} Memory', { flavor, cpu, memory })}</>;
};

export default Flavor;
