import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { DataVolumeModelGroupVersionKind } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { columnSorting, isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import useDiagnosticDataVolumeStatusTableColumns from '../hooks/useDiagnosticDataVolumeStatusTableColumns';
import { VirtualizationDataVolumeStatus } from '../utils/types';
import { getPhaseLabel } from '../utils/utils';

import VirtualMachineDiagnosticTabTableTitle from './components/VirtualMachineDiagnosticTabTableTitle';

type VirtualMachineDiagnosticTabDataVolumeStatusProps = {
  dataVolumesStatuses: VirtualizationDataVolumeStatus[];
};

const VirtualMachineDiagnosticTabDataVolumeStatus: FC<
  VirtualMachineDiagnosticTabDataVolumeStatusProps
> = ({ dataVolumesStatuses }) => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();
  const { activeColumns, sorting } = useDiagnosticDataVolumeStatusTableColumns();

  const sortedData = useMemo(
    () => columnSorting(dataVolumesStatuses, sorting?.direction, undefined, sorting?.column),
    [dataVolumesStatuses, sorting],
  );

  if (isEmpty(sortedData)) return null;

  return (
    <>
      <ListPageBody>
        <VirtualMachineDiagnosticTabTableTitle
          helpContent={t('DataVolume Status is a mechanism for reporting if a volume succeeds.')}
          olsPromptType={OLSPromptType.DATAVOLUME_STATUS}
          title={t('DataVolume status')}
        />
      </ListPageBody>

      <Table aria-label={t('DataVolume status')}>
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
                if (colId === 'name') {
                  return (
                    <Td key={colId}>
                      <MulticlusterResourceLink
                        groupVersionKind={DataVolumeModelGroupVersionKind}
                        name={row.name}
                        namespace={namespace}
                      />
                    </Td>
                  );
                }

                if (colId === 'phase') {
                  const { color, text } = getPhaseLabel(row.phase, t);
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

export default VirtualMachineDiagnosticTabDataVolumeStatus;
