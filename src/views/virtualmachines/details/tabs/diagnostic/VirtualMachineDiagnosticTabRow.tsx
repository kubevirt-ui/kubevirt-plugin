import React, { type Dispatch, type SetStateAction } from 'react';
import classNames from 'classnames';

import { NAME_COLUMN_ID } from '@kubevirt-utils/components/ColumnManagementModal/constants';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { DataVolumeModelGroupVersionKind } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';

type DiagnosticTabRowProps = {
  activeColumns: { id: string }[];
  dataVolumeResourceLink?: boolean;
  expend: { expended: Set<string>; ids: Set<string> };
  index: number;
  obj: {
    [key: string]: unknown;
    cluster?: string;
    id?: string;
    message?: string;
    metadata?: { name?: string; namespace?: string };
    status?: string;
  };
  setExpend: Dispatch<SetStateAction<{ expended: Set<string>; ids: Set<string> }>>;
};

const VirtualMachineDiagnosticTabRow = ({
  activeColumns,
  dataVolumeResourceLink = false,
  expend,
  index,
  obj,
  setExpend,
}: DiagnosticTabRowProps): React.JSX.Element => {
  const namespace = useNamespaceParam();

  const isExpanded = expend?.expended.has(obj?.id) && !!obj?.message;
  const activeColumnsObj = new Set<string>(activeColumns.map(({ id }) => id));

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr className={classNames({ 'VirtualMachineDiagnosticTabRow--row': isExpanded })}>
        <Td
          expand={
            obj?.message && {
              expandId: `message-${index}`,
              isExpanded,
              onToggle: (): void =>
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
              <MulticlusterResourceLink
                cluster={getCluster(obj)}
                groupVersionKind={DataVolumeModelGroupVersionKind}
                name={obj?.[column]?.toString()}
                namespace={namespace}
              />
            ) : (
              (obj?.[column]?.toString() ?? NO_DATA_DASH)
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
