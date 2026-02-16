import React, { FC, useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, CardBody, Divider } from '@patternfly/react-core';
import { DataView, DataViewState, DataViewTable } from '@patternfly/react-data-view';
import { isRunning } from '@virtualmachines/utils';

import {
  getFileSystemColumns,
  getFileSystemRowId,
} from '../../../../../../virtualmachinesinstance/details/tabs/disks/table/file-system/fileSystemTableDefinition';

import FilesystemListTitle from './VirtualMachinesOverviewTabFilesystemTitle';

type VirtualMachinesOverviewTabFilesystemProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  guestAgentDataLoadError?: Error;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabFilesystem: FC<VirtualMachinesOverviewTabFilesystemProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  guestAgentDataLoadError,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);
  const isConnected = vmi && isGuestAgentConnected(vmi);
  const fileSystems = guestAgentData?.fsInfo?.disks || [];

  const columns = useMemo(() => getFileSystemColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(fileSystems, columns, 'diskName');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getFileSystemRowId),
    [sortedData, columns],
  );

  const getActiveState = (): DataViewState | undefined => {
    if (!isVMRunning) return DataViewState.empty;
    if (guestAgentDataLoadError) return DataViewState.empty;
    if (!guestAgentDataLoaded) return DataViewState.loading;
    if (isEmpty(fileSystems)) return DataViewState.empty;
    return undefined;
  };

  const activeState = getActiveState();

  const getEmptyMessage = (): string => {
    if (!isVMRunning) return t('VirtualMachine is not running');
    if (guestAgentDataLoadError) return t('Error loading file systems');
    if (!isConnected) return t('Guest agent is required');
    return t('No file systems found');
  };

  const emptyMessage = getEmptyMessage();

  return (
    <Card>
      <FilesystemListTitle />
      <Divider />
      <CardBody isFilled>
        <DataView activeState={activeState}>
          <DataViewTable
            bodyStates={{
              [DataViewState.empty]: (
                <tr>
                  <td className="pf-v6-u-text-align-center" colSpan={columns.length}>
                    {emptyMessage}
                  </td>
                </tr>
              ),
            }}
            aria-label={t('File systems table')}
            columns={tableColumns}
            rows={rows}
          />
        </DataView>
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabFilesystem;
