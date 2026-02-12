import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { PROJECT_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectMappingOption } from '../../form/constants';

export const getDefaultProjectMappingOption = (
  namespaceSelector: Selector,
): ProjectMappingOption => {
  if (!isEmpty(namespaceSelector?.matchExpressions)) {
    return ProjectMappingOption.SelectFromList;
  }
  if (namespaceSelector?.matchLabels?.[PROJECT_NAME_LABEL_KEY] === DEFAULT_NAMESPACE) {
    return ProjectMappingOption.AllProjects;
  }
  return ProjectMappingOption.SelectByLabels;
};
