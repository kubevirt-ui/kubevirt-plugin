import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getTemplateWorkload } from '../../utils/selectors';

// t('plugin__kubevirt-plugin~Desktop')
// t('plugin__kubevirt-plugin~Server')
// t('plugin__kubevirt-plugin~High performance')
// t('plugin__kubevirt-plugin~Other')

const workloadLabels = {
  desktop: 'Desktop',
  server: 'Server',
  highperformance: 'High performance',
};

const useWorkloadProfile = (template: V1Template): string => {
  const { t } = useKubevirtTranslation();

  return t(workloadLabels[getTemplateWorkload(template)] || 'Other');
};

export default useWorkloadProfile;
