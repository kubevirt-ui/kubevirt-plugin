import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  obj: NetworkPresentation;
};

const NetworkInterfaceRow: React.FC<RowProps<NetworkPresentation, { template: V1Template }>> = ({
  obj: { iface, network },
  activeColumnIDs,
  rowData: { template },
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={network.name} />
      </TableData>
      <TableData id="model" activeColumnIDs={activeColumnIDs}>
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData id="network" activeColumnIDs={activeColumnIDs}>
        {network.pod ? (
          t('Pod networking')
        ) : (
          <TemplateValue value={network.multus?.networkName || NO_DATA_DASH} />
        )}
      </TableData>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData id="macAddress" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={iface.macAddress || NO_DATA_DASH} />
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <NetworkInterfaceActions
          nicName={network.name}
          nicPresentation={{ iface, network }}
          template={template}
        />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
