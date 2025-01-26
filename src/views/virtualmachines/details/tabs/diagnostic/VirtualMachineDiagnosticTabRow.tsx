import React from 'react';
import cn from 'classnames';

import { DataVolumeModelGroupVersionKind } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  RedExclamationCircleIcon,
  ResourceLink,
  useActiveNamespace,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';

import { NAME_COLUMN_ID } from './hooks/constants';

const VirtualMachineDiagnosticTabRow = ({
  activeColumns,
  dataVolumeResourceLink = false,
  expend,
  index,
  obj,
  setExpend,
}) => {
  const [namespace] = useActiveNamespace();

  const isExpanded = expend?.expended.has(obj?.id) && obj?.message;
  const activeColumnsObj = new Set<string>(activeColumns.map(({ id }) => id));

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr className={cn({ 'VirtualMachineDiagnosticTabRow--row': isExpanded })}>
        <Td
          expand={
            obj?.message && {
              expandId: `message-${index}`,
              isExpanded,
              onToggle: () =>
                setExpend((expendObj) => {
                  isExpanded ? expendObj.expended.delete(obj?.id) : expendObj.expended.add(obj?.id);
                  return { expended: new Set(expendObj.expended), ids: new Set(expendObj.ids) };
                }),
              rowIndex: index,
            }
          }
        />
        {[...activeColumnsObj]?.map((column) => (
          <Td id={column} key={column}>
            {column === NAME_COLUMN_ID && dataVolumeResourceLink ? (
              <ResourceLink
                groupVersionKind={DataVolumeModelGroupVersionKind}
                name={obj?.[column]?.toString()}
                namespace={namespace}
              />
            ) : (
              obj?.[column]?.toString() || NO_DATA_DASH
            )}
          </Td>
        ))}
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
