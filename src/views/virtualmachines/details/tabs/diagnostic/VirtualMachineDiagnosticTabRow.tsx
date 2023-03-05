import React from 'react';
import cn from 'classnames';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';

const VirtualMachineDiagnosticTabRow = ({ obj, index, expend, setExpend, activeColumns }) => {
  const isExpanded = expend?.expended.has(obj?.id) && obj?.message;
  const activeColumnsObj = new Set<string>(activeColumns.map(({ id }) => id));

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr className={cn({ 'VirtualMachineDiagnosticTabRow--row': isExpanded })}>
        <Td
          expand={
            obj?.message && {
              rowIndex: index,
              isExpanded,
              onToggle: () =>
                setExpend((expendObj) => {
                  isExpanded ? expendObj.expended.delete(obj?.id) : expendObj.expended.add(obj?.id);
                  return { ids: new Set(expendObj.ids), expended: new Set(expendObj.expended) };
                }),
              expandId: `message-${index}`,
            }
          }
        />
        {[...activeColumnsObj]?.map((column) => {
          return (
            <Td key={column} id={column}>
              {obj?.[column]?.toString() || NO_DATA_DASH}
            </Td>
          );
        })}
      </Tr>
      {obj?.message && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={12}>
            <div className="VirtualMachineDiagnosticTabRow--expanded">
              {obj?.status === 'False' && <RedExclamationCircleIcon />}
              {!obj?.status && <YellowExclamationTriangleIcon />}
              <ExpandableRowContent>{obj?.message}</ExpandableRowContent>
            </div>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

export default VirtualMachineDiagnosticTabRow;
