import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';

export const getOtherNADResources = (namespace: string, canListGlobalNSNADs: boolean) => {
  if (!canListGlobalNSNADs) return {};
  return {
    //global namespace to get usable NADs
    ...(namespace !== DEFAULT_NAMESPACE && {
      default: {
        groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
        isList: true,
        namespace: DEFAULT_NAMESPACE,
      },
    }),
    OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
    },
    OPENSHIFT_MULTUS_NS: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: OPENSHIFT_MULTUS_NS,
    },
  };
};
