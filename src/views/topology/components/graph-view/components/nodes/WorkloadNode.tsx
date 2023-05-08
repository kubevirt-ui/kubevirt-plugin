import React, { FC, ReactNode, Ref } from 'react';

import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFiringAlerts } from '@kubevirt-utils/utils/alert-utils';
import { AlertSeverity } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';
import {
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  useHover,
  useVisualizationController,
  WithContextMenuProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { WithCreateConnectorProps } from '../../../../behavior';
import { getFilterById, SHOW_POD_COUNT_FILTER_ID, useDisplayFilters } from '../../../../filters';
import { getResource, getTopologyResourceObject } from '../../../../utils';
import { getSeverityAlertType } from '../../../../utils/alert-utils';
import { useBuildConfigsWatcher } from '../../../../utils/hooks/useBuildsConfigWatcher/useBuildsConfigWatcher';
import usePodsWatcher from '../../../../utils/hooks/usePodsWatcher/usePodsWatcher';
import { calculateRadius, getPodStatus } from '../../../../utils/pod-utils';
import { AllPodStatus, PodRCData } from '../../../../utils/types/podTypes';
import { useResourceQuotaAlert } from '../../../workload';

import { getNodeDecorators } from './decorators/getNodeDecorators';
import PodSet from './PodSet/PodSet';
import { podSetInnerRadius } from './PodSet/utils/utils';
import BaseNode from './BaseNode';

import './WorkloadNode.scss';

const POD_STATUS_NORMAL = 1;
const POD_STATUS_WARNING = 2;
const POD_STATUS_DANGER = 3;

const StatusSeverities = {
  danger: [
    'ContainerCannotRun',
    'CrashLoopBackOff',
    'Critical',
    'ErrImagePull',
    'Error',
    'Failed',
    'Failure',
    'ImagePullBackOff',
    'InstallCheckFailed',
    'Lost',
    'Rejected',
    'UpgradeFailed',
  ],
  warning: [
    'Cancelled',
    'Deleting',
    'Expired',
    'Not Ready',
    'Terminating',
    'Warning',
    'RequiresApproval',
  ],
  normal: [
    'New',
    'Pending',
    'Planning',
    'ContainerCreating',
    'UpgradePending',
    'In Progress',
    'Installing',
    'InstallReady',
    'Replacing',
    'Running',
    'Updating',
    'Upgrading',
    'Accepted',
    'Active',
    'Bound',
    'Complete',
    'Completed',
    'Created',
    'Enabled',
    'Succeeded',
    'Ready',
    'Up to date',
    'Provisioned as node',
    'Preferred',
    'Connected',
    'Info',
    'Unknown',
    'PipelineNotStarted',
  ],
};

export const getNodePodStatus = (podStatus: AllPodStatus): number => {
  switch (podStatus) {
    case AllPodStatus.Failed:
    case AllPodStatus.CrashLoopBackOff:
      return POD_STATUS_DANGER;
    case AllPodStatus.Warning:
      return POD_STATUS_WARNING;
    default:
      return POD_STATUS_NORMAL;
  }
};

export const getAggregateStatus = (
  donutStatus: PodRCData,
  alertSeverity: AlertSeverity,
  buildStatus: string,
  pipelineStatus: string,
  workloadRqAlertVariant: NodeStatus,
): NodeStatus => {
  const worstPodStatus =
    donutStatus?.pods?.reduce((acc, pod) => {
      return Math.max(acc, getNodePodStatus(getPodStatus(pod)));
    }, POD_STATUS_NORMAL) ?? NodeStatus.default;

  if (
    worstPodStatus === POD_STATUS_DANGER ||
    alertSeverity === AlertSeverity.Critical ||
    StatusSeverities.danger.includes(buildStatus) ||
    StatusSeverities.danger.includes(pipelineStatus)
  ) {
    return NodeStatus.danger;
  }
  if (
    worstPodStatus === POD_STATUS_WARNING ||
    alertSeverity === AlertSeverity.Warning ||
    StatusSeverities.warning.includes(buildStatus) ||
    StatusSeverities.warning.includes(pipelineStatus) ||
    workloadRqAlertVariant === NodeStatus.warning
  ) {
    return NodeStatus.warning;
  }
  return NodeStatus.default;
};

type WorkloadNodeProps = {
  element: Node;
  dragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  urlAnchorRef?: Ref<SVGCircleElement>;
  dropTooltip?: ReactNode;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

type WorkloadPodsNodeProps = WorkloadNodeProps & {
  donutStatus: PodRCData;
};

const WorkloadPodsNode: FC<WorkloadPodsNodeProps> = observer(function WorkloadPodsNode({
  donutStatus,
  element,
  children,
  urlAnchorRef,
  canDrop,
  dropTarget,
  dropTooltip,
  contextMenuOpen,
  ...rest
}) {
  const { t } = useKubevirtTranslation();
  const { width, height } = element.getDimensions();
  const workloadData = element.getData().data;
  const filters = useDisplayFilters();
  const [hover, hoverRef] = useHover();
  const size = Math.min(width, height);
  const { radius, decoratorRadius } = calculateRadius(size);
  const cx = width / 2;
  const cy = height / 2;
  const tipContent = dropTooltip || t('Create a visual connector');
  const showPodCountFilter = getFilterById(SHOW_POD_COUNT_FILTER_ID, filters);
  const showPodCount = showPodCountFilter?.value ?? false;
  const { decorators } = element.getGraph().getData();
  const controller = useVisualizationController();
  const detailsLevel = controller.getGraph().getDetailsLevel();
  const iconImageUrl = getImageForIconClass(workloadData.builderImage) ?? workloadData.builderImage;
  const showDetails = hover || contextMenuOpen || detailsLevel !== ScaleDetailsLevel.low;
  const nodeDecorators = showDetails
    ? getNodeDecorators(element, decorators, cx, cy, radius, decoratorRadius)
    : null;
  const { monitoringAlerts } = workloadData;
  const firingAlerts = getFiringAlerts(monitoringAlerts);
  const severityAlertType = getSeverityAlertType(firingAlerts);
  const resource = getResource(element);
  const { buildConfigs } = useBuildConfigsWatcher(resource);
  const buildStatus = buildConfigs?.[0]?.builds?.[0]?.status?.phase;
  const pipelineStatus = element.getData()?.resources?.pipelineRunStatus ?? 'Unknown';
  const workloadRqAlert = useResourceQuotaAlert(element);
  const workloadRqAlertVariant = (workloadRqAlert?.variant as NodeStatus) || NodeStatus.default;

  return (
    <g className="odc-workload-node">
      <Tooltip
        content={tipContent}
        trigger="manual"
        isVisible={dropTarget && canDrop}
        animationDuration={0}
      >
        <BaseNode
          className="odc-workload-node"
          hoverRef={hoverRef}
          innerRadius={podSetInnerRadius(size, donutStatus)}
          icon={showDetails && !showPodCount ? iconImageUrl : undefined}
          kind={workloadData.kind}
          element={element}
          dropTarget={dropTarget}
          canDrop={canDrop}
          nodeStatus={
            !showDetails &&
            getAggregateStatus(
              donutStatus,
              severityAlertType,
              buildStatus,
              pipelineStatus,
              workloadRqAlertVariant,
            )
          }
          attachments={nodeDecorators}
          contextMenuOpen={contextMenuOpen}
          alertVariant={workloadRqAlertVariant}
          {...rest}
        >
          {donutStatus && showDetails ? (
            <PodSet size={size} x={cx} y={cy} data={donutStatus} showPodCount={showPodCount} />
          ) : null}
          {children}
        </BaseNode>
      </Tooltip>
    </g>
  );
});

const WorkloadNode: FC<WorkloadNodeProps> = observer(function WorkloadNode({ element, ...rest }) {
  const resource = getTopologyResourceObject(element.getData());
  const { podData, loadError, loaded } = usePodsWatcher(
    resource,
    resource.kind,
    resource.metadata.namespace,
  );
  return (
    <WorkloadPodsNode
      element={element}
      donutStatus={loaded && !loadError ? podData : null}
      {...rest}
    />
  );
});

export { WorkloadNode, WorkloadPodsNode };
