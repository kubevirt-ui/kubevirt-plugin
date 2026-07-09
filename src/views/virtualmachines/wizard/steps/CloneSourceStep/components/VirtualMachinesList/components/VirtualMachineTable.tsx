import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';

import VirtualMachineRow from './VirtualMachineRow';

type VirtualMachineTableProps = {
  callbacks: VMCallbacks;
  cluster: string;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  loaded: boolean;
  loadError: Error;
  vmsData: V1VirtualMachine[];
};

const VirtualMachineTable: FC<VirtualMachineTableProps> = ({
  callbacks,
  cluster,
  columns,
  loaded,
  loadError,
  vmsData,
}) => {
  const { t } = useKubevirtTranslation();

  if (loadError) {
    return (
      <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">
        {t('Error loading virtual machines: {{error}}', { error: loadError.message })}
      </div>
    );
  }

  if (!loaded) {
    return <ListSkeleton />;
  }

  if (isEmpty(vmsData)) {
    return (
      <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">{t('No VirtualMachines found')}</div>
    );
  }

  return (
    <Table variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th aria-label={t('Select')} />
          {columns.map((col) => (
            <Th id={col?.key} key={col?.key}>
              {col?.label}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {vmsData.map((vm) => (
          <VirtualMachineRow
            callbacks={callbacks}
            columns={columns}
            key={`${cluster}-${getNamespace(vm)}-${getName(vm)}`}
            vm={vm}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default VirtualMachineTable;
