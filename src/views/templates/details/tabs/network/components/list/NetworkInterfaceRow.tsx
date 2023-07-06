import * as React from 'react';
import { FC } from 'react';

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

const NetworkInterfaceRow: FC<RowProps<NetworkPresentation, { template: V1Template }>> = ({
  activeColumnIDs,
  obj: { iface, network },
  rowData: { template },
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <TemplateValue value={network.name} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {network.pod ? (
          t('Pod networking')
        ) : (
          <TemplateValue value={network.multus?.networkName || NO_DATA_DASH} />
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        <TemplateValue value={iface.macAddress || NO_DATA_DASH} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
        id=""
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
