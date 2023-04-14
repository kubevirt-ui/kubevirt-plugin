import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import { NADListPermissionsMap } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

type UseNADListPermissions = () => NADListPermissionsMap;

const useNADListPermissions: UseNADListPermissions = () => {
  const [canListDefaultNSNads] = useAccessReview({
    namespace: DEFAULT_NAMESPACE,
    verb: 'list' as K8sVerb,
    resource: NetworkAttachmentDefinitionModel.plural,
  });

  const [canListOpenShiftSRIOVNetworkOperatorNamespaceNADs] = useAccessReview({
    namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
    verb: 'list' as K8sVerb,
    resource: NetworkAttachmentDefinitionModel.plural,
  });

  const [canListOpenShiftMultusNamespaceNADs] = useAccessReview({
    namespace: OPENSHIFT_MULTUS_NS,
    verb: 'list' as K8sVerb,
    resource: NetworkAttachmentDefinitionModel.plural,
  });

  return {
    default: canListDefaultNSNads,
    OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS: canListOpenShiftSRIOVNetworkOperatorNamespaceNADs,
    OPENSHIFT_MULTUS_NS: canListOpenShiftMultusNamespaceNADs,
  };
};

export default useNADListPermissions;
