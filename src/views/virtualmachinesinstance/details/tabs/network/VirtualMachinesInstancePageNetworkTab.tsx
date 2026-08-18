import React, { type FC, useMemo } from 'react';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import getVirtualMachineInstanceNetworkTab from './getVirtualMachineInstanceNetworkTab';
import { getVMINetworkColumns, getVMINetworkRowId } from './vmiNetworkTableDefinition';

import './virtual-machines-insance-page-network-tab.scss';

type VirtualMachinesInstancePageNetworkTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageNetworkTab: FC<VirtualMachinesInstancePageNetworkTabProps> = ({
  obj: vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const data = getVirtualMachineInstanceNetworkTab(vmi);

  const columns = useMemo(() => getVMINetworkColumns(t), [t]);

  return (
    <div className="VirtualMachinesInstancePageNetworkTab">
      <ListPageBody>
        <KubevirtTable
          ariaLabel={t('Network interfaces table')}
          columns={columns}
          data={data ?? []}
          dataTest="vmi-network-interfaces-table"
          getRowId={getVMINetworkRowId}
          initialSortKey="name"
          loaded={!!vmi}
          noDataMsg={t('No network interfaces found')}
        />
      </ListPageBody>
    </div>
  );
};

export default VirtualMachinesInstancePageNetworkTab;
