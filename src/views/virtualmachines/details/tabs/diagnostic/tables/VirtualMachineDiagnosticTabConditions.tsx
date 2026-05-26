import React, { FC, useMemo } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { columnSorting, isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import useDiagnosticConditionsTableColumns from '../hooks/useDiagnosticConditionsTableColumns';
import { VirtualizationStatusCondition } from '../utils/types';
import { getConditionLabel } from '../utils/utils';

import VirtualMachineDiagnosticTabTableTitle from './components/VirtualMachineDiagnosticTabTableTitle';

type VirtualMachineDiagnosticTabConditionsProps = {
  conditions: VirtualizationStatusCondition[];
};

const VirtualMachineDiagnosticTabConditions: FC<VirtualMachineDiagnosticTabConditionsProps> = ({
  conditions,
}) => {
  const { t } = useKubevirtTranslation();
  const { activeColumns, loaded, sorting } = useDiagnosticConditionsTableColumns();

  const sortedData = useMemo(
    () => columnSorting(conditions, sorting?.direction, undefined, sorting?.column),
    [conditions, sorting],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  if (isEmpty(sortedData)) return null;

  return (
    <>
      <ListPageBody>
        <VirtualMachineDiagnosticTabTableTitle
          helpContent={t(
            'Conditions provide a standard mechanism for status reporting. Conditions are reported for all aspects of a VM.',
          )}
          olsPromptType={OLSPromptType.STATUS_CONDITIONS}
          title={t('Status conditions')}
        />
      </ListPageBody>

      <Table aria-label={t('Status conditions')}>
        <Thead>
          <Tr>
            {activeColumns?.map(({ cell: { sort }, title }, index) => (
              <Th key={title} modifier="nowrap" sort={sort(index)}>
                {title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row) => (
            <Tr key={row.id}>
              {activeColumns.map(({ id: colId }) => {
                if (colId === 'status') {
                  const { color, text } = getConditionLabel(row.status, row.type, t);
                  return (
                    <Td key={colId}>
                      <Label color={color}>{text}</Label>
                    </Td>
                  );
                }

                if (colId === 'lastTransitionTime') {
                  return (
                    <Td key={colId}>
                      {row.lastTransitionTime ? (
                        <Timestamp timestamp={row.lastTransitionTime} />
                      ) : (
                        NO_DATA_DASH
                      )}
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

export default VirtualMachineDiagnosticTabConditions;
