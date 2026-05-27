import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { NAMESPACE_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import { NamespaceMappingOption } from '../../form/constants';

export const getDefaultNamespaceMappingOption = (
  namespaceSelector: Selector,
): NamespaceMappingOption => {
  if (!isEmpty(namespaceSelector?.matchExpressions)) {
    return NamespaceMappingOption.SelectFromList;
  }
  if (namespaceSelector?.matchLabels?.[NAMESPACE_NAME_LABEL_KEY] === DEFAULT_NAMESPACE) {
    return NamespaceMappingOption.AllNamespaces;
  }
  return NamespaceMappingOption.SelectByLabels;
};
