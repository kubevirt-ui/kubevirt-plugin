import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';

import { buildCSVContent, getExportableColumns } from './exportToCSV';

type Row = { name: string; status: string };

const columns: ColumnConfig<Row>[] = [
  {
    getValue: (row) => row.name,
    key: 'name',
    label: 'Name',
    renderCell: () => null,
  },
  {
    getValue: (row) => row.status,
    key: 'status',
    label: 'Status',
    renderCell: () => null,
  },
  {
    key: ACTIONS,
    label: '',
    renderCell: () => null,
  },
  {
    key: 'selection',
    label: '',
    renderCell: () => null,
  },
  {
    key: 'metrics',
    label: 'Metrics',
    renderCell: () => null,
  },
];

describe('getExportableColumns', () => {
  it('returns only columns with label and getValue', () => {
    const result = getExportableColumns(columns);
    expect(result.map((col) => col.key)).toEqual(['name', 'status']);
  });

  it('respects activeColumnKeys', () => {
    const result = getExportableColumns(columns, ['name']);
    expect(result.map((col) => col.key)).toEqual(['name']);
  });
});

describe('buildCSVContent', () => {
  it('builds CSV with header and escaped values', () => {
    const data: Row[] = [
      { name: 'vm-1', status: 'Running' },
      { name: 'vm,2', status: 'Stopped' },
    ];

    const csv = buildCSVContent(data, columns);
    expect(csv).toBe('Name,Status\nvm-1,Running\n"vm,2",Stopped');
  });

  it('returns empty string when no exportable columns', () => {
    const csv = buildCSVContent([], [{ key: 'x', label: '', renderCell: () => null }]);
    expect(csv).toBe('');
  });

  it('escapes double quotes and newlines in cell values', () => {
    const data: Row[] = [{ name: 'say "hello"', status: 'line1\nline2' }];

    const csv = buildCSVContent(data, columns);
    expect(csv).toBe('Name,Status\n"say ""hello""","line1\nline2"');
  });
});
