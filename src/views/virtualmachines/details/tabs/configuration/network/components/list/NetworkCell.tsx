import React, { type FC } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { parseVMMultusIntoNAD } from '@kubevirt-utils/resources/nad/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { type SimpleNICPresentation } from '../../utils/types';
import { type NetworkInterfaceListCallbacks } from './networkInterfaceListDefinition';

type NetworkCellProps = {
  callbacks: NetworkInterfaceListCallbacks;
  row: SimpleNICPresentation;
};

const NetworkCell: FC<NetworkCellProps> = ({ callbacks, row }) => {
  const { t } = useKubevirtTranslation();
  const networkName = row.network?.multus?.networkName;

  if (!networkName) {
    return (
      <span data-test={`nic-network-${row.network?.name}`}>
        {row.network?.pod ? t('Pod networking') : NO_DATA_DASH}
      </span>
    );
  }

  const vmNamespace = getNamespace(callbacks.vm) ?? '';
  const { name, namespace } = parseVMMultusIntoNAD(networkName, vmNamespace);

  if (!name || !namespace) {
    return <span data-test={`nic-network-${row.network?.name}`}>{networkName}</span>;
  }

  return (
    <span data-test={`nic-network-${row.network?.name}`}>
      <ResourceLink
        groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
        name={name}
        namespace={namespace}
      />
    </span>
  );
};

export default NetworkCell;
