import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';

type AffinityProps = {
  vm: V1VirtualMachine;
};

const Affinity: React.FC<AffinityProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const affinity = vm?.spec?.template?.spec?.affinity;

  return <>{t('{{count}} Affinity rules', { count: getAffinityRules(affinity)?.length ?? 0 })}</>;
};

export default Affinity;
