import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const Tolerations: React.FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const tolerations = vmi?.spec?.tolerations;

  return <>{t('{{rules}} Tolerations rules', { rules: tolerations?.length ?? 0 })}</>;
};

export default Tolerations;
