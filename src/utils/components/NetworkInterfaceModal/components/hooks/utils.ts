import partition from 'lodash/partition';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { UDN_LABEL } from '@kubevirt-utils/resources/udn/constants';
import { UserDefinedNetworkRole } from '@kubevirt-utils/resources/udn/types';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { getNADRole } from '../../utils/helpers';

export const resources = {
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

export const filterUDNNads = (nads: NetworkAttachmentDefinition[]) => {
  const [regular, primary] = partition(
    nads ?? [],
    (nad) =>
      getLabel(nad, UDN_LABEL) === undefined ||
      getNADRole(nad) === UserDefinedNetworkRole.secondary,
  );
  return { primary, regular };
};
export const watchResourceIfAllowed = (
  resourceWatch: WatchK8sResource,
  isAllowed: boolean,
  cluster: string,
) =>
  isAllowed
    ? {
        ...(resourceWatch || {}),
        cluster,
      }
    : null;
