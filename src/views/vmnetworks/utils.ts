import {
  ClusterUserDefinedNetworkKind,
  ClusterUserDefinedNetworkSpec,
} from '@kubevirt-utils/resources/udn/types';
import { isEmpty, verifyMatchExpressions } from '@kubevirt-utils/utils/utils';
import { MatchExpression, Operator } from '@openshift-console/dynamic-plugin-sdk';

import { NamespaceMappingOption } from './form/constants';

export const isValidNamespaceMapping = (
  namespaceMappingOption: NamespaceMappingOption,
  namespaceSelector: ClusterUserDefinedNetworkSpec['namespaceSelector'],
): boolean => {
  if (namespaceMappingOption === NamespaceMappingOption.AllNamespaces) {
    return true;
  }
  if (namespaceMappingOption === NamespaceMappingOption.SelectByLabels) {
    return (
      !isEmpty(namespaceSelector?.matchLabels) &&
      !(
        Object.keys(namespaceSelector?.matchLabels).length === 1 &&
        '' in namespaceSelector?.matchLabels
      )
    );
  }
  return (
    !isEmpty(namespaceSelector?.matchExpressions) &&
    namespaceSelector?.matchExpressions?.some((expr) => !isEmpty(expr?.values))
  );
};

export const getVMNetworkNamespaces = (
  vmNetwork: ClusterUserDefinedNetworkKind,
  namespaces: K8sResourceCommon[],
): K8sResourceCommon[] => {
  const namespaceSelector = vmNetwork?.spec?.namespaceSelector || {};

  const matchLabelsToExpressions = Object.entries(namespaceSelector.matchLabels || {}).map(
    ([key, value]): MatchExpression => ({
      key,
      operator: Operator.Equals,
      values: [value],
    }),
  );

  const matchExpressions = namespaceSelector.matchExpressions || [];

  const combinedExpressions = [...matchLabelsToExpressions, ...matchExpressions];

  return namespaces?.filter((namespace) => verifyMatchExpressions(namespace, combinedExpressions)) ?? [];
};
