import { type TableExportColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { exportToCSV } from '@kubevirt-utils/hooks/useTableExport';
import { fireEvent, render, screen } from '@testing-library/react';

import ExportTableButton from './ExportTableButton';

jest.mock('@kubevirt-utils/hooks/useTableExport', () => ({
  exportToCSV: jest.fn(),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: (): {
    t: (str: string, options?: Record<string, unknown>) => string;
  } => ({
    t: (str: string, options?: Record<string, unknown>): string =>
      str.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) =>
        options?.[key] == null ? `{{${key}}}` : String(options[key]),
      ),
  }),
}));

type Row = { name: string };

const columns: TableExportColumnConfig<Row>[] = [
  {
    getValue: (row) => row.name,
    key: 'name',
    label: 'Name',
    renderCell: () => null,
  },
];

const vm1: Row = { name: 'vm-1' };
const vm2: Row = { name: 'vm-2' };
const rows: Row[] = [vm1, vm2];

describe('ExportTableButton', () => {
  beforeEach(() => {
    jest.mocked(exportToCSV).mockClear();
  });

  it('sets aria-disabled when there is no data', () => {
    render(<ExportTableButton columns={columns} data={[]} filename="vms" loaded />);

    expect(screen.getByRole('button', { name: 'Export table data to CSV' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('does not call exportToCSV when clicked while disabled', () => {
    render(<ExportTableButton columns={columns} data={[]} filename="vms" loaded />);

    fireEvent.click(screen.getByRole('button', { name: 'Export table data to CSV' }));

    expect(exportToCSV).not.toHaveBeenCalled();
  });

  it('exports all data when clicked with no selection', () => {
    render(<ExportTableButton columns={columns} data={rows} filename="vms" loaded />);

    fireEvent.click(screen.getByRole('button', { name: 'Export table data to CSV' }));

    expect(exportToCSV).toHaveBeenCalledWith(rows, columns, 'vms', undefined, undefined);
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('opens a dropdown with selected and all options when rows are selected', () => {
    render(
      <ExportTableButton
        columns={columns}
        data={rows}
        filename="vms"
        loaded
        selectedData={[vm1]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export table data to CSV' }));

    expect(exportToCSV).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'Export selected (1)' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Export all (2)' })).toBeInTheDocument();
  });

  it('exports selected rows from the dropdown', () => {
    render(
      <ExportTableButton
        columns={columns}
        data={rows}
        filename="vms"
        loaded
        selectedData={[vm1]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export table data to CSV' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export selected (1)' }));

    expect(exportToCSV).toHaveBeenCalledWith([vm1], columns, 'vms', undefined, undefined);
  });

  it('exports all rows from the dropdown', () => {
    render(
      <ExportTableButton
        columns={columns}
        data={rows}
        filename="vms"
        loaded
        selectedData={[vm1]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export table data to CSV' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export all (2)' }));

    expect(exportToCSV).toHaveBeenCalledWith(rows, columns, 'vms', undefined, undefined);
  });
});
