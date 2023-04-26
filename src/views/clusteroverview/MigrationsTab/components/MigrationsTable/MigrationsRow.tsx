import * as React from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import {
  GenericStatus,
  ResourceLink,
  RowProps,
  TableData,
} from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';

import MigrationPolicyTooltip from './components/MigrationPolicyTooltip/MigrationPolicyTooltip';
import { iconMapper } from './utils/statuses';
import { MigrationTableDataLayout } from './utils/utils';
import MigrationActionsDropdown from './MigrationActionsDropdown';

const MigrationsRow: React.FC<RowProps<MigrationTableDataLayout>> = ({ obj, activeColumnIDs }) => {
  const StatusIcon = iconMapper?.[obj?.vmim?.status?.phase];

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
        <Tooltip
          content={`${obj?.vmim?.status?.phase} ${
            obj?.vmiObj?.status?.migrationState?.endTimestamp || ''
          }`}
          hidden={
            obj?.vmim?.status?.phase !== vmimStatuses.Failed &&
            obj?.vmim?.status?.phase !== vmimStatuses.Succeeded
          }
        >
          <GenericStatus title={obj?.vmim?.status?.phase} Icon={StatusIcon} />
        </Tooltip>
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
        <MigrationPolicyTooltip obj={obj} />
      </TableData>
      <TableData id="vmim-name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={VirtualMachineInstanceMigrationModelGroupVersionKind}
          name={obj?.vmim?.metadata?.name}
          namespace={obj?.vmim?.metadata?.namespace}
        />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj?.vmim?.metadata?.creationTimestamp} />
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <MigrationActionsDropdown vmim={obj?.vmim} isKebabToggle />
      </TableData>
    </>
  );
};

export default MigrationsRow;
