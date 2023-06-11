import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { NADListPermissionsMap } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const resources = {
  default: {
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace: DEFAULT_NAMESPACE,
  },
  OPENSHIFT_MULTUS_NS: {
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace: OPENSHIFT_MULTUS_NS,
  },
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS: {
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
  },
};

export const getExtraNADResources = (
  namespace: string,
  nadListPermissionsMap: NADListPermissionsMap,
) => {
  if (isEmpty(nadListPermissionsMap)) return {};

  return Object.entries(nadListPermissionsMap).reduce((newMap, [ns, isAllowed]) => {
    if (isAllowed) {
      //global namespace to get usable NADs
      if (ns === DEFAULT_NAMESPACE && namespace !== DEFAULT_NAMESPACE)
        return { ...newMap, default: resources[ns] };
      else return { ...newMap, [ns]: resources[ns] };
    }
    return newMap;
  }, {});
};
