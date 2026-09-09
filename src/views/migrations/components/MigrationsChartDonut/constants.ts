import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import chart_color_black_400 from '@patternfly/react-tokens/dist/esm/chart_color_black_400';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/esm/chart_color_blue_100';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/esm/chart_color_blue_500';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/esm/chart_color_orange_100';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_orange_400 from '@patternfly/react-tokens/dist/esm/chart_color_orange_400';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/esm/chart_color_orange_500';
import chart_color_red_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_red_orange_300';
import chart_color_teal_300 from '@patternfly/react-tokens/dist/esm/chart_color_teal_300';

export const defaultMigrationStatusColor = chart_color_black_400.value;

export const migrationChartStatusOrder: string[] = [
  vmimStatuses.Pending,
  vmimStatuses.WaitingForSync,
  vmimStatuses.Synchronizing,
  vmimStatuses.Scheduling,
  vmimStatuses.Scheduled,
  vmimStatuses.PreparingTarget,
  vmimStatuses.TargetReady,
  vmimStatuses.Running,
  vmimStatuses.Succeeded,
  vmimStatuses.Failed,
];

export const migrationStatusColorMap: { [status: string]: string } = {
  [vmimStatuses.Failed]: chart_color_red_orange_300.value,
  [vmimStatuses.Pending]: chart_color_blue_100.value,
  [vmimStatuses.PreparingTarget]: chart_color_orange_300.value,
  [vmimStatuses.Running]: chart_color_teal_300.value,
  [vmimStatuses.Scheduled]: chart_color_blue_500.value,
  [vmimStatuses.Scheduling]: chart_color_blue_300.value,
  [vmimStatuses.Succeeded]: chart_color_green_400.value,
  [vmimStatuses.Synchronizing]: chart_color_orange_400.value,
  [vmimStatuses.TargetReady]: chart_color_orange_500.value,
  [vmimStatuses.WaitingForSync]: chart_color_orange_100.value,
};
