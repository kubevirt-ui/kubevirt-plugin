import React from 'react';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { exportToCSV } from '@kubevirt-utils/hooks/useTableExport';
import { fireEvent, render, screen } from '@testing-library/react';

import ExportTableButton from './ExportTableButton';

jest.mock('@kubevirt-utils/hooks/useTableExport', () => ({
  exportToCSV: jest.fn(),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: (): { t: (str: string) => string } => ({
    t: (str: string): string => str,
  }),
}));

type Row = { name: string };

const columns: ColumnConfig<Row>[] = [
  {
    getValue: (row) => row.name,
    key: 'name',
    label: 'Name',
    renderCell: () => null,
  },
];

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
});
