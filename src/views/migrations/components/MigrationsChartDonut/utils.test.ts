import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/esm/chart_color_blue_100';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/esm/chart_color_blue_500';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/esm/chart_color_orange_100';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_orange_400 from '@patternfly/react-tokens/dist/esm/chart_color_orange_400';
import chart_color_red_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_red_orange_300';

import { defaultMigrationStatusColor } from './constants';
import { getMigrationChartData, getMigrationChartTotal, getMigrationStatusColor } from './utils';

const vmimWithPhase = (phase: string): V1VirtualMachineInstanceMigration =>
  ({
    status: { phase },
  }) as V1VirtualMachineInstanceMigration;

const findItem = (
  chartData: ReturnType<typeof getMigrationChartData>,
  status: string,
): ReturnType<typeof getMigrationChartData>[number] | undefined =>
  chartData.find((item) => item.x === status);

describe('getMigrationChartData', () => {
  it('colors Succeeded green and Failed red regardless of insertion order', () => {
    const chartData = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Scheduling),
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Pending),
    ]);

    expect(findItem(chartData, vmimStatuses.Succeeded)).toEqual(
      expect.objectContaining({ fill: chart_color_green_400.value, y: 1 }),
    );
    expect(findItem(chartData, vmimStatuses.Failed)).toEqual(
      expect.objectContaining({ fill: chart_color_red_orange_300.value, y: 1 }),
    );
    expect(findItem(chartData, vmimStatuses.Scheduling)).toEqual(
      expect.objectContaining({ fill: chart_color_blue_300.value }),
    );
    expect(findItem(chartData, vmimStatuses.Pending)).toEqual(
      expect.objectContaining({ fill: chart_color_blue_100.value }),
    );
  });

  it('keeps the same colors when the same statuses appear in a different order', () => {
    const inOriginalOrder = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Scheduling),
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Succeeded),
    ]);
    const inReverseOrder = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Scheduling),
    ]);

    expect(findItem(inReverseOrder, vmimStatuses.Succeeded)?.fill).toBe(
      findItem(inOriginalOrder, vmimStatuses.Succeeded)?.fill,
    );
    expect(findItem(inReverseOrder, vmimStatuses.Failed)?.fill).toBe(
      findItem(inOriginalOrder, vmimStatuses.Failed)?.fill,
    );
    expect(findItem(inReverseOrder, vmimStatuses.Scheduling)?.fill).toBe(
      findItem(inOriginalOrder, vmimStatuses.Scheduling)?.fill,
    );
  });

  it('uses distinct colors for related phases', () => {
    const chartData = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Scheduling),
      vmimWithPhase(vmimStatuses.Scheduled),
      vmimWithPhase(vmimStatuses.PreparingTarget),
      vmimWithPhase(vmimStatuses.WaitingForSync),
      vmimWithPhase(vmimStatuses.Synchronizing),
    ]);

    expect(findItem(chartData, vmimStatuses.Scheduling)?.fill).toBe(chart_color_blue_300.value);
    expect(findItem(chartData, vmimStatuses.Scheduled)?.fill).toBe(chart_color_blue_500.value);
    expect(findItem(chartData, vmimStatuses.PreparingTarget)?.fill).toBe(
      chart_color_orange_300.value,
    );
    expect(findItem(chartData, vmimStatuses.WaitingForSync)?.fill).toBe(
      chart_color_orange_100.value,
    );
    expect(findItem(chartData, vmimStatuses.Synchronizing)?.fill).toBe(
      chart_color_orange_400.value,
    );
    expect(findItem(chartData, vmimStatuses.Scheduling)?.fill).not.toBe(
      findItem(chartData, vmimStatuses.Scheduled)?.fill,
    );
  });

  it('orders slices by lifecycle, not insertion order', () => {
    const chartData = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Pending),
    ]);

    expect(chartData.map((item) => item.x)).toEqual([
      vmimStatuses.Pending,
      vmimStatuses.Succeeded,
      vmimStatuses.Failed,
    ]);
  });

  it('counts migrations per status', () => {
    const chartData = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Failed),
    ]);

    expect(findItem(chartData, vmimStatuses.Succeeded)?.y).toBe(2);
    expect(findItem(chartData, vmimStatuses.Failed)?.y).toBe(1);
    expect(getMigrationChartTotal(chartData)).toBe(3);
  });

  it('returns an empty array for an empty list', () => {
    expect(getMigrationChartData([])).toEqual([]);
  });

  it('skips migrations that have no status phase', () => {
    const chartData = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Succeeded),
      {} as V1VirtualMachineInstanceMigration,
      { status: {} } as V1VirtualMachineInstanceMigration,
      vmimWithPhase(vmimStatuses.Unset),
    ]);

    expect(chartData).toHaveLength(1);
    expect(findItem(chartData, vmimStatuses.Succeeded)?.y).toBe(1);
    expect(getMigrationChartTotal(chartData)).toBe(1);
  });
});

describe('getMigrationStatusColor', () => {
  it('returns the mapped color for a known status', () => {
    expect(getMigrationStatusColor(vmimStatuses.Succeeded)).toBe(chart_color_green_400.value);
  });

  it('falls back to the default color for an unknown status', () => {
    expect(getMigrationStatusColor('SomeUnmappedPhase')).toBe(defaultMigrationStatusColor);
  });
});
