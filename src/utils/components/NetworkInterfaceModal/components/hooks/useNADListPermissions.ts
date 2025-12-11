import { NetworkAttachmentDefinitionModel } from '@kubevirt-ui/kubevirt-api/console';
import { NADListPermissionsMap } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseNADListPermissions = (cluster?: string) => NADListPermissionsMap;

const useNADListPermissions: UseNADListPermissions = (cluster) => {
  const [canListDefaultNSNads] = useFleetAccessReview({
    cluster,
    group: NetworkAttachmentDefinitionModel.apiGroup,
    namespace: DEFAULT_NAMESPACE,
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [canListOpenShiftSRIOVNetworkOperatorNamespaceNADs] = useFleetAccessReview({
    cluster,
    group: NetworkAttachmentDefinitionModel.apiGroup,
    namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [canListOpenShiftMultusNamespaceNADs] = useFleetAccessReview({
    cluster,
    group: NetworkAttachmentDefinitionModel.apiGroup,
    namespace: OPENSHIFT_MULTUS_NS,
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'list' as K8sVerb,
  });

  return {
    default: canListDefaultNSNads,
    OPENSHIFT_MULTUS_NS: canListOpenShiftMultusNamespaceNADs,
    OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS: canListOpenShiftSRIOVNetworkOperatorNamespaceNADs,
  };
};

export default useNADListPermissions;
