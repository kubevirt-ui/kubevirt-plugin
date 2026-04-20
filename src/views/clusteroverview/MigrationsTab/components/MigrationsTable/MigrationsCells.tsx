import React, { FCC } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import NodeLink from '@kubevirt-utils/components/NodeLink/NodeLink';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getMigrationPhase,
  getMigrationSourceNode,
  getMigrationTargetNode,
} from '@kubevirt-utils/resources/vmim/selectors';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { GenericStatus } from '@openshift-console/dynamic-plugin-sdk';
import { Progress, ProgressMeasureLocation, Tooltip } from '@patternfly/react-core';

import MigrationPolicyTooltip from './components/MigrationPolicyTooltip/MigrationPolicyTooltip';
import useMigrationProgress from './hooks/useMigrationProgress';
import { getStatusIcon } from './utils/statuses';
import { MigrationTableDataLayout } from './utils/utils';
import MigrationActionsDropdown from './MigrationActionsDropdown';

type CellProps = {
  row: MigrationTableDataLayout;
};

export const VMNameCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const vmName = getName(vmiObj) ?? vmim?.spec?.vmiName;
  const vmNamespace = getNamespace(vmiObj) ?? getNamespace(vmim);
  const cluster = getCluster(vmiObj) ?? getCluster(vmim);

  if (!vmName) {
    return <span data-test="migration-vm-name-unknown">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`migration-vm-name-${vmName}`}>
      <MulticlusterResourceLink
        cluster={cluster}
        groupVersionKind={VirtualMachineModelGroupVersionKind}
        name={vmName}
        namespace={vmNamespace}
      />
    </span>
  );
};

export const NamespaceCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const isACMPage = useIsACMPage();
  const namespace = getNamespace(vmiObj) ?? getNamespace(vmim);
  const cluster = getCluster(vmiObj) ?? getCluster(vmim);

  if (!namespace) {
    return <span data-test="migration-namespace-unknown">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`migration-namespace-${namespace}`}>
      <MulticlusterResourceLink
        cluster={isACMPage ? cluster : undefined}
        groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
        name={namespace}
      />
    </span>
  );
};

export const StatusCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const migrationPhase = getMigrationPhase(vmim);
  const StatusIcon = getStatusIcon(migrationPhase);
  const showTooltip =
    migrationPhase === vmimStatuses.Failed || migrationPhase === vmimStatuses.Succeeded;
  const endTimestamp = vmiObj?.status?.migrationState?.endTimestamp;

  return (
    <span data-test={`migration-status-${getName(vmim)}`}>
      <Tooltip
        content={`${migrationPhase}${endTimestamp ? ` ${endTimestamp}` : ''}`}
        hidden={!showTooltip}
      >
        <span tabIndex={showTooltip ? 0 : undefined}>
          <GenericStatus Icon={StatusIcon} title={migrationPhase} />
        </span>
      </Tooltip>
    </span>
  );
};

export const ProgressCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const migrationPhase = getMigrationPhase(vmim);
  const { percentage, progressVariant } = useMigrationProgress(vmiObj, migrationPhase);

  if (!vmiObj) {
    return <span data-test={`migration-progress-${getName(vmim)}`}>{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`migration-progress-${getName(vmim)}`}>
      <Progress
        aria-label={`Migration progress: ${percentage}%`}
        measureLocation={ProgressMeasureLocation.top}
        value={percentage}
        variant={progressVariant}
      />
    </span>
  );
};

export const SourceNodeCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const cluster = getCluster(vmiObj) ?? getCluster(vmim) ?? '';
  const sourceNode = getMigrationSourceNode(vmim);

  return (
    <span data-test={`migration-source-${getName(vmim)}`}>
      <NodeLink cluster={cluster} nodeName={sourceNode} />
    </span>
  );
};

export const TargetNodeCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const cluster = getCluster(vmiObj) ?? getCluster(vmim) ?? '';
  const targetNode = getMigrationTargetNode(vmim);

  return (
    <span data-test={`migration-target-${getName(vmim)}`}>
      <NodeLink cluster={cluster} nodeName={targetNode} />
    </span>
  );
};

export const MigrationPolicyCell: FCC<CellProps> = ({ row }) => (
  <span data-test={`migration-policy-${getName(row.vmim)}`}>
    <MigrationPolicyTooltip obj={row} />
  </span>
);

export const VMIMNameCell: FCC<CellProps> = ({ row }) => {
  const { vmim, vmiObj } = row;
  const cluster = getCluster(vmiObj) ?? getCluster(vmim);

  return (
    <span data-test={`migration-vmim-name-${getName(vmim)}`}>
      <MulticlusterResourceLink
        cluster={cluster}
        groupVersionKind={VirtualMachineInstanceMigrationModelGroupVersionKind}
        name={getName(vmim)}
        namespace={getNamespace(vmim)}
      />
    </span>
  );
};

export const CreatedCell: FCC<CellProps> = ({ row }) => (
  <span data-test={`migration-created-${getName(row.vmim)}`}>
    <Timestamp timestamp={row.vmim?.metadata?.creationTimestamp} />
  </span>
);

export const ActionsCell: FCC<CellProps> = ({ row }) => (
  <MigrationActionsDropdown isKebabToggle vmim={row.vmim} />
);
