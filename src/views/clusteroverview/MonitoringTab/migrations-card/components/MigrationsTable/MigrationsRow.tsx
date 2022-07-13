import * as React from 'react';
import { VirtualMachineInstanceMigrationModel } from 'src/views/virtualmachines/actions/actions';

import {
  modelToGroupVersionKind,
  NodeModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  GenericStatus,
  ResourceLink,
  RowProps,
  TableData,
} from '@openshift-console/dynamic-plugin-sdk';

import { iconMapper } from './utils/statuses';
import { MigrationTableDataLayout } from './utils/utils';

const MigrationsRow: React.FC<RowProps<MigrationTableDataLayout>> = ({ obj, activeColumnIDs }) => {
  const StatusIcon = iconMapper[obj?.vmim?.status?.phase];
  return (
    <>
      <TableData id="vm-name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={obj?.vmiObj?.metadata?.name}
          namespace={obj?.vmiObj?.metadata?.namespace}
        />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <GenericStatus title={obj?.vmim?.status?.phase} Icon={StatusIcon} />
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {obj?.vmiObj?.status?.migrationState?.sourceNode ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NodeModel)}
            name={obj?.vmiObj?.status?.migrationState?.sourceNode}
          />
        ) : (
          NO_DATA_DASH
        )}
      </TableData>
      <TableData id="target" activeColumnIDs={activeColumnIDs}>
        {obj?.vmiObj?.status?.migrationState?.targetNode ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NodeModel)}
            name={obj?.vmiObj?.status?.migrationState?.targetNode}
          />
        ) : (
          NO_DATA_DASH
        )}
      </TableData>
      <TableData id="migration-policy" activeColumnIDs={activeColumnIDs}>
        {/* <ResourceLink
          groupVersionKind={modelToGroupVersionKind(MigrationPolicyModel)}
          name={obj?.vmiObj?.status?.migrationState?.sourceNode}
        /> */}
        {obj?.vmiObj?.status?.migrationState?.migrationPolicyName || NO_DATA_DASH}
      </TableData>
      <TableData id="vmim-name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(VirtualMachineInstanceMigrationModel)}
          name={obj?.vmim?.metadata?.name}
        />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj?.vmim?.metadata?.creationTimestamp} />
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      ></TableData>
    </>
  );
};

export default MigrationsRow;
