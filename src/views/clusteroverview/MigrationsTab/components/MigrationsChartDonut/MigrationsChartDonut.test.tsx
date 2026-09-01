import React from 'react';

import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { ChartDonut } from '@patternfly/react-charts/victory';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_red_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_red_orange_300';
import { fireEvent, render, screen } from '@testing-library/react';

import { MIGRATION_STATUS_FILTER_ID } from '../MigrationsTable/utils/constants';
import MigrationChartLegend from './MigrationChartLegend';
import MigrationsChartDonut from './MigrationsChartDonut';
import { getMigrationChartData } from './utils';

jest.mock('@patternfly/react-charts/victory', () => {
  const mockReact = require('react');

  return {
    ChartDonut: jest.fn(() =>
      mockReact.createElement('div', { 'data-test': 'migrations-chart-donut' }),
    ),
    ChartLabel: () => null,
  };
});

jest.mock('../LiveMigrationSettingsPopover/LiveMigrationSettingsPopover', () => ({
  __esModule: true,
  default: () => null,
}));

const mockChartDonut = ChartDonut as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

const vmimWithPhase = (phase: string): V1VirtualMachineInstanceMigration =>
  ({
    status: { phase },
  }) as V1VirtualMachineInstanceMigration;

describe('MigrationChartLegend', () => {
  it('filters the table by the clicked status', () => {
    const legendItems = getMigrationChartData([
      vmimWithPhase(vmimStatuses.Scheduling),
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Succeeded),
    ]);
    const onSetFilters = jest.fn();

    render(<MigrationChartLegend legendItems={legendItems} onSetFilters={onSetFilters} />);

    fireEvent.click(screen.getByRole('button', { name: `1 ${vmimStatuses.Failed}` }));
    expect(onSetFilters).toHaveBeenCalledWith({
      [MIGRATION_STATUS_FILTER_ID]: [vmimStatuses.Failed],
    });
  });
});

describe('MigrationsChartDonut', () => {
  it('passes per-status fill to ChartDonut and titles the slice total', () => {
    const vmims = [
      vmimWithPhase(vmimStatuses.Scheduling),
      vmimWithPhase(vmimStatuses.Failed),
      vmimWithPhase(vmimStatuses.Succeeded),
      {} as V1VirtualMachineInstanceMigration,
    ];

    render(<MigrationsChartDonut onSetFilters={jest.fn()} vmims={vmims} />);

    const donutProps = mockChartDonut.mock.calls[0][0];
    const data = donutProps.data as { fill: string; x: string; y: number }[];
    const fillFromStyle = donutProps.style.data.fill as (args: {
      datum: { fill: string };
    }) => string;

    expect(donutProps.colorScale).toBeUndefined();
    expect(donutProps.title).toBe('3');
    expect(data.find((item) => item.x === vmimStatuses.Succeeded)?.fill).toBe(
      chart_color_green_400.value,
    );
    expect(data.find((item) => item.x === vmimStatuses.Failed)?.fill).toBe(
      chart_color_red_orange_300.value,
    );
    expect(fillFromStyle({ datum: { fill: 'token-fill' } })).toBe('token-fill');
  });
});
