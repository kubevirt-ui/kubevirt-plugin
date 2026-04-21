import { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isDeschedulerEnabled } from '@kubevirt-utils/hooks/useDeschedulerSetting/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';

type DeschedulerProps = {
  vmi: V1VirtualMachineInstance;
};

const Descheduler: FC<DeschedulerProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const deschedulerEnabled = isDeschedulerEnabled(getAnnotations(vmi));

  return deschedulerEnabled ? t('ON') : t('OFF');
};

export default Descheduler;
