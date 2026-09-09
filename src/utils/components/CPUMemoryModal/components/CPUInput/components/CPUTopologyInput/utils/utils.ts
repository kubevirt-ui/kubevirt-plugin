import { CPUComponent } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const cpuComponentToTitle: Record<string, string> = {
  [CPUComponent.Cores]: t('Cores'),
  [CPUComponent.Sockets]: t('Sockets'),
  [CPUComponent.Threads]: t('Threads'),
};

export const getCPUComponentTitle = (cpuComponent: CPUComponent): string =>
  cpuComponentToTitle[cpuComponent];
