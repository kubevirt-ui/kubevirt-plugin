import { type FC } from 'react';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getGroupVersionKindForResource,
  ResourceLink,
  type TableColumn,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { type SelectedInstanceType } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { type InstanceTypes } from '@virtualmachines/wizard/utils/types';

type UserProvidedInstanceTypeTableProps = {
  columns: TableColumn<InstanceTypes[number]>[];
  getSortType: (columnIndex: number) => ThSortType;
  onRowClick: (instanceTypeName: string, instanceTypeNamespace: string) => void;
  selectedInstanceType: null | SelectedInstanceType;
  sortedData: InstanceTypes;
};

const UserProvidedInstanceTypeTable: FC<UserProvidedInstanceTypeTableProps> = ({
  columns,
  getSortType,
  onRowClick,
  selectedInstanceType,
  sortedData,
}) => (
  <Table variant={TableVariant.compact}>
    <Thead>
      <Tr>
        {columns.map(({ id, title }, columnIndex) => (
          <Th key={id} sort={getSortType(columnIndex)}>
            {title}
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {sortedData.map((instanceTypeItem) => {
        const instanceTypeName = getName(instanceTypeItem);
        const instanceTypeNamespace = getNamespace(instanceTypeItem);
        return (
          <Tr
            isClickable
            isRowSelected={
              selectedInstanceType?.name === instanceTypeName &&
              selectedInstanceType?.namespace === instanceTypeNamespace
            }
            isSelectable
            key={`${instanceTypeName}-${instanceTypeNamespace}`}
            onRowClick={(): void => onRowClick(instanceTypeName ?? '', instanceTypeNamespace ?? '')}
          >
            <Td data-test={instanceTypeName}>
              <ResourceLink
                groupVersionKind={getGroupVersionKindForResource(instanceTypeItem)}
                linkTo={false}
                name={instanceTypeName}
                namespace={instanceTypeNamespace}
              />
            </Td>
            <Td>
              <Timestamp timestamp={instanceTypeItem?.metadata?.creationTimestamp} />
            </Td>
            <Td>{instanceTypeItem?.metadata?.annotations?.description ?? NO_DATA_DASH}</Td>
          </Tr>
        );
      })}
    </Tbody>
  </Table>
);

export default UserProvidedInstanceTypeTable;
