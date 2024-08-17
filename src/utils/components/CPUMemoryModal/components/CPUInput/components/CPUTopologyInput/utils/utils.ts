import { CPUComponent } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const cpuComponentToTitle = {
  [CPUComponent.cores]: t('Cores'),
  [CPUComponent.sockets]: t('Sockets'),
  [CPUComponent.threads]: t('Threads'),
};

export const getCPUComponentTitle = (cpuComponent: CPUComponent) =>
  cpuComponentToTitle[cpuComponent];
