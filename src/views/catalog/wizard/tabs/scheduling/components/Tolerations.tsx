import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type TolerationsProps = {
  vm: V1VirtualMachine;
};

const Tolerations: React.FC<TolerationsProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const tolerations = vm?.spec?.template?.spec?.tolerations;

  return <>{t('{{rules}} Tolerations rules', { rules: tolerations?.length ?? 0 })}</>;
};

export default Tolerations;
