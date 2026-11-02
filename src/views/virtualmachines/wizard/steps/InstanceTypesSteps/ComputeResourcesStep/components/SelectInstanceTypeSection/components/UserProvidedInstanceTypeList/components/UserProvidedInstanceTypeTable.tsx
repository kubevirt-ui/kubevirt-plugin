import { type FC } from 'react';

import { INSTANCETYPE_ICON_PF } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import DynamicPfIcon from '@kubevirt-utils/components/DynamicPfIcon/DynamicPfIcon';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getGroupVersionKindForResource,
  ResourceLink,
  type TableColumn,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { type InstanceTypeSelection } from '@virtualmachines/wizard/form/types';
import { type InstanceTypes } from '@virtualmachines/wizard/utils/types';

import { getInstanceTypeDescriptionValue } from '../utils/utils';

type UserProvidedInstanceTypeTableProps = {
  columns: TableColumn<InstanceTypes[number]>[];
  getSortType: (columnIndex: number) => ThSortType;
  onRowClick: (instanceTypeName: string, instanceTypeNamespace: string) => void;
  selectedInstanceType: null | InstanceTypeSelection;
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
        const iconLabel = getLabel(instanceTypeItem, INSTANCETYPE_ICON_PF);

        return (
          <Tr
            isClickable
            isRowSelected={
              selectedInstanceType?.name === instanceTypeName &&
              selectedInstanceType?.type === 'user' &&
              selectedInstanceType.namespace === (instanceTypeNamespace ?? '')
            }
            isSelectable
            key={`${instanceTypeName}-${instanceTypeNamespace ?? ''}`}
            onRowClick={(): void => onRowClick(instanceTypeName ?? '', instanceTypeNamespace ?? '')}
          >
            <Td data-test={instanceTypeName}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <ResourceLink
                  groupVersionKind={getGroupVersionKindForResource(instanceTypeItem)}
                  linkTo={false}
                  name={instanceTypeName}
                  namespace={instanceTypeNamespace}
                />
                {iconLabel && <DynamicPfIcon pfIconLabel={iconLabel} />}
              </Flex>
            </Td>
            <Td>
              <Timestamp timestamp={instanceTypeItem?.metadata?.creationTimestamp} />
            </Td>
            <Td>{getInstanceTypeDescriptionValue(instanceTypeItem) || NO_DATA_DASH}</Td>
          </Tr>
        );
      })}
    </Tbody>
  </Table>
);

export default UserProvidedInstanceTypeTable;
