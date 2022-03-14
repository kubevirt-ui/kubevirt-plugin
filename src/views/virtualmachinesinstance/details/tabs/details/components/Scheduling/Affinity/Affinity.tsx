import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';

type AffinityProps = {
  vmi: V1VirtualMachineInstance;
};

const Affinity: React.FC<AffinityProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const affinity = vmi?.spec?.affinity;

  return <>{t('{{count}} Affinity rules', { count: getAffinityRules(affinity)?.length ?? 0 })}</>;
};

export default Affinity;
