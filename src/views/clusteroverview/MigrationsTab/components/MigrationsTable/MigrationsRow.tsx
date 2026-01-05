import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import NodeLink from '@kubevirt-utils/components/NodeLink/NodeLink';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getMigrationPhase,
  getMigrationSourceNode,
  getMigrationTargetNode,
} from '@kubevirt-utils/resources/vmim/selectors';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { GenericStatus, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Progress, ProgressMeasureLocation, Tooltip } from '@patternfly/react-core';

import MigrationPolicyTooltip from './components/MigrationPolicyTooltip/MigrationPolicyTooltip';
import useMigrationProgress from './hooks/useMigrationProgress';
import { iconMapper } from './utils/statuses';
import { MigrationTableDataLayout } from './utils/utils';
import MigrationActionsDropdown from './MigrationActionsDropdown';

const MigrationsRow: FC<RowProps<MigrationTableDataLayout>> = ({ activeColumnIDs, obj }) => {
  const { vmim, vmiObj } = obj;
  const cluster = getCluster(vmiObj);
  const sourceNode = getMigrationSourceNode(vmim);
  const targetNode = getMigrationTargetNode(vmim);
  const migrationPhase = getMigrationPhase(vmim);

  const { percentage, progressVariant } = useMigrationProgress(vmiObj, migrationPhase);

  const StatusIcon = iconMapper?.[migrationPhase];

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="vm-name">
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={getName(vmiObj)}
          namespace={getNamespace(vmiObj)}
        />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
        id="namespace"
      >
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={getNamespace(vmiObj)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <Tooltip
          hidden={
            migrationPhase !== vmimStatuses.Failed && migrationPhase !== vmimStatuses.Succeeded
          }
          content={`${migrationPhase} ${vmiObj?.status?.migrationState?.endTimestamp || ''}`}
        >
          <GenericStatus Icon={StatusIcon} title={migrationPhase} />
        </Tooltip>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="progress-indicator">
        <Progress
          measureLocation={ProgressMeasureLocation.top}
          value={percentage}
          variant={progressVariant}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source">
        <NodeLink cluster={cluster} nodeName={sourceNode} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="target">
        <NodeLink cluster={cluster} nodeName={targetNode} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="migration-policy">
        <MigrationPolicyTooltip obj={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="vmim-name">
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={VirtualMachineInstanceMigrationModelGroupVersionKind}
          name={getName(vmim)}
          namespace={getNamespace(vmim)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="created">
        <Timestamp timestamp={vmim?.metadata?.creationTimestamp} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <MigrationActionsDropdown isKebabToggle vmim={vmim} />
      </TableData>
    </>
  );
};

export default MigrationsRow;
