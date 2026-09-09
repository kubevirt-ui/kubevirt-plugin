import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { PRIMARY_UDN_KUBEVIRT_BINDING } from '@kubevirt-utils/resources/nad/constants';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { UDN_LABEL } from '@kubevirt-utils/resources/udn/constants';
import { type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

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

type FilteredNADs = {
  primary: NetworkAttachmentDefinitionKind[];
  regular: NetworkAttachmentDefinitionKind[];
};

const isRegularNad = (nad: NetworkAttachmentDefinitionKind): boolean => {
  const nadRole = getNADRole(nad);
  return (
    nadRole !== 'primary' && (getLabel(nad, UDN_LABEL) === undefined || nadRole === 'secondary')
  );
};

export const filterUDNNads = (nads: NetworkAttachmentDefinitionKind[]): FilteredNADs => {
  const vmAvailableNADs = (nads ?? []).filter(
    (nad) => getName(nad) !== PRIMARY_UDN_KUBEVIRT_BINDING,
  );

  const regular = vmAvailableNADs.filter(isRegularNad);
  const primary = vmAvailableNADs.filter((nad) => !isRegularNad(nad));
  return { primary, regular };
};

export const watchResourceIfAllowed = (
  resourceWatch: WatchK8sResource,
  isAllowed: boolean,
  cluster: string,
): FleetWatchK8sResource | null => {
  if (!isAllowed) {
    return null;
  }

  return {
    cluster,
    groupVersionKind: resourceWatch.groupVersionKind,
    isList: resourceWatch.isList,
    namespace: resourceWatch.namespace,
  };
};
