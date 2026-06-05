import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { columnSorting, isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import useDiagnosticVolumeStatusTableColumns from '../hooks/useDiagnosticVolumeStatusTableColumns';
import { VirtualizationVolumeSnapshotStatus } from '../utils/types';
import { getEnabledLabel } from '../utils/utils';

import VirtualMachineDiagnosticTabTableTitle from './components/VirtualMachineDiagnosticTabTableTitle';

type VirtualMachineDiagnosticTabVolumeStatusProps = {
  volumeSnapshotStatuses: VirtualizationVolumeSnapshotStatus[];
};

const VirtualMachineDiagnosticTabVolumeStatus: FC<VirtualMachineDiagnosticTabVolumeStatusProps> = ({
  volumeSnapshotStatuses,
}) => {
  const { t } = useKubevirtTranslation();
  const { activeColumns, sorting } = useDiagnosticVolumeStatusTableColumns();

  const sortedData = useMemo(
    () => columnSorting(volumeSnapshotStatuses, sorting?.direction, undefined, sorting?.column),
    [volumeSnapshotStatuses, sorting],
  );

  if (isEmpty(sortedData)) return null;

  return (
    <>
      <ListPageBody>
        <VirtualMachineDiagnosticTabTableTitle
          helpContent={t(
            'Volume Snapshot Status is a mechanism for reporting if a volume can be snapshotted or not.',
          )}
          olsPromptType={OLSPromptType.VOLUME_SNAPSHOT_STATUS}
          title={t('Volume snapshot status')}
        />
      </ListPageBody>

      <Table aria-label={t('Volume snapshot status')}>
        <Thead>
          <Tr>
            {activeColumns?.map(({ cell: { sort }, title }, index) => (
              <Th key={title} sort={sort(index)}>
                {title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row) => (
            <Tr key={row.id}>
              {activeColumns.map(({ id: colId }) => {
                if (colId === 'enabled') {
                  const { color, text } = getEnabledLabel(row.status, t);
                  return (
                    <Td key={colId}>
                      <Label color={color}>{text}</Label>
                    </Td>
                  );
                }

                return <Td key={colId}>{row[colId]?.toString() || NO_DATA_DASH}</Td>;
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default VirtualMachineDiagnosticTabVolumeStatus;
