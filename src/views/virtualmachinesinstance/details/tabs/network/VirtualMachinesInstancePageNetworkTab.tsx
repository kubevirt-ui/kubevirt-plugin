import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';

import useVirtualMachineInstanceNetworkTab from './hooks/useVirtualMachineInstanceNetworkTab';
import { getVMINetworkColumns, getVMINetworkRowId } from './vmiNetworkTableDefinition';

import './virtual-machines-insance-page-network-tab.scss';

type VirtualMachinesInstancePageNetworkTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageNetworkTab: FC<VirtualMachinesInstancePageNetworkTabProps> = ({
  obj: vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [data] = useVirtualMachineInstanceNetworkTab(vmi);

  const columns = useMemo(() => getVMINetworkColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(data, columns, 'name');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getVMINetworkRowId),
    [sortedData, columns],
  );

  if (!vmi) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <div className="VirtualMachinesInstancePageNetworkTab">
      <ListPageBody>
        {isEmpty(data) ? (
          <div className="pf-v6-u-text-align-center">{t('No network interfaces found')}</div>
        ) : (
          <DataViewTable
            aria-label={t('Network interfaces table')}
            columns={tableColumns}
            rows={rows}
          />
        )}
      </ListPageBody>
    </div>
  );
};

export default VirtualMachinesInstancePageNetworkTab;
