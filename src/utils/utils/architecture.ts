import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const ARCHITECTURE_ID = 'architecture';
export const ARCHITECTURE_TITLE = t('Architecture');
// label on DS and Template resources
export const ARCHITECTURE_LABEL = 'template.kubevirt.io/architecture';

export const getArchitecture = (resource: K8sResourceCommon): string =>
  getLabel(resource, ARCHITECTURE_LABEL);

export const getUniqueArchitectures = (resources: K8sResourceCommon[]): string[] =>
  Array.from(new Set(resources.map((resource) => getArchitecture(resource))));
