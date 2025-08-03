import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';

export const ARCHITECTURE_ID = 'architecture';
export const ARCHITECTURE_TITLE = t('Architecture');
// label on DS and Template resources
export const ARCHITECTURE_LABEL = 'template.kubevirt.io/architecture';
// label on Node resources
export const NODE_ARCHITECTURE_LABEL = 'kubernetes.io/arch';

export const getArchitecture = (resources: K8sResourceCommon): string =>
  getLabel(resources, ARCHITECTURE_LABEL);
