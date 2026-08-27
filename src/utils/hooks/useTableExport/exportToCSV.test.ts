import { saveAs } from 'file-saver';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';

import { buildCSVContent, exportToCSV, getExportableColumns } from './exportToCSV';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

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

  it('excludes additional columns when activeColumnKeys is omitted', () => {
    const result = getExportableColumns([
      ...columns,
      {
        additional: true,
        getValue: () => 'hidden',
        key: 'created',
        label: 'Created',
        renderCell: () => null,
      },
    ]);
    expect(result.map((col) => col.key)).toEqual(['name', 'status']);
  });

  it('includes additional columns when they are listed in activeColumnKeys', () => {
    const result = getExportableColumns(
      [
        ...columns,
        {
          additional: true,
          getValue: () => 'shown',
          key: 'created',
          label: 'Created',
          renderCell: () => null,
        },
      ],
      ['name', 'created'],
    );
    expect(result.map((col) => col.key)).toEqual(['name', 'created']);
  });

  it('excludes ACTIONS and selection even when listed in activeColumnKeys', () => {
    const result = getExportableColumns(
      [
        {
          getValue: () => 'menu',
          key: ACTIONS,
          label: 'Actions',
          renderCell: () => null,
        },
        {
          getValue: () => 'checked',
          key: 'selection',
          label: 'Select',
          renderCell: () => null,
        },
        columns[0],
      ],
      [ACTIONS, 'selection', 'name'],
    );
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

  it('passes callbacks to getValue', () => {
    type Callbacks = { suffix: string };
    const cols: ColumnConfig<Row, Callbacks>[] = [
      {
        getValue: (row, callbacks) => `${row.name}${callbacks?.suffix ?? ''}`,
        key: 'name',
        label: 'Name',
        renderCell: () => null,
      },
    ];

    const csv = buildCSVContent([{ name: 'vm-1', status: 'Running' }], cols, undefined, {
      suffix: '-ns',
    });
    expect(csv).toBe('Name\nvm-1-ns');
  });
});

describe('exportToCSV', () => {
  beforeEach(() => {
    jest.mocked(saveAs).mockClear();
  });

  it('calls saveAs with a Blob and a single .csv suffix', () => {
    exportToCSV([{ name: 'vm-1', status: 'Running' }], columns, 'my-export.csv');

    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'my-export.csv');
  });

  it('does not call saveAs when there is no CSV content', () => {
    exportToCSV([], [{ key: 'x', label: '', renderCell: () => null }], 'empty.csv');

    expect(saveAs).not.toHaveBeenCalled();
  });
});
