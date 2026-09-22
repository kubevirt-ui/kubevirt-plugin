import { type ColumnConfig } from './types';
import { generateRows, renderColumnCell } from './utils';

type Row = { count: number; name: string };

describe('renderColumnCell', () => {
  it('uses renderCell when provided', () => {
    const col: ColumnConfig<Row> = {
      getValue: (row) => row.name,
      key: 'name',
      label: 'Name',
      renderCell: (row) => `cell-${row.name}`,
    };

    expect(renderColumnCell(col, { count: 1, name: 'vm' })).toBe('cell-vm');
  });

  it('falls back to getValue when renderCell is omitted', () => {
    const col: ColumnConfig<Row> = {
      getValue: (row) => row.name,
      key: 'name',
      label: 'Name',
    };

    expect(renderColumnCell(col, { count: 1, name: 'vm' })).toBe('vm');
  });

  it('renders 0 from getValue instead of an empty string', () => {
    const col: ColumnConfig<Row> = {
      getValue: (row) => row.count,
      key: 'count',
      label: 'Count',
    };

    expect(renderColumnCell(col, { count: 0, name: 'vm' })).toBe('0');
  });

  it('renders an empty string when getValue is missing a value', () => {
    const col: ColumnConfig<Row> = {
      getValue: () => '',
      key: 'name',
      label: 'Name',
    };

    expect(renderColumnCell(col, { count: 1, name: 'vm' })).toBe('');
  });

  it('passes callbacks to getValue', () => {
    const col: ColumnConfig<Row, { suffix: string }> = {
      getValue: (row, callbacks) => `${row.name}-${callbacks?.suffix ?? ''}`,
      key: 'name',
      label: 'Name',
    };

    expect(renderColumnCell(col, { count: 1, name: 'vm' }, { suffix: 'x' })).toBe('vm-x');
  });
});

describe('generateRows', () => {
  it('renders getValue when renderCell is omitted', () => {
    const columns: ColumnConfig<Row>[] = [
      {
        getValue: (row) => row.name,
        key: 'name',
        label: 'Name',
      },
    ];

    const rows = generateRows({
      callbacks: undefined,
      columns,
      data: [{ count: 0, name: 'vm-a' }],
    });

    expect(rows[0]).toMatchObject({
      id: '0',
      row: [{ cell: 'vm-a' }],
    });
  });

  it('should use the list index when getRowId returns an empty string', () => {
    const columns: ColumnConfig<Row>[] = [
      {
        getValue: (row) => row.name,
        key: 'name',
        label: 'Name',
      },
    ];

    const rows = generateRows({
      callbacks: undefined,
      columns,
      data: [
        { count: 0, name: 'a' },
        { count: 1, name: 'b' },
      ],
      getRowId: () => '',
    });

    expect(rows).toMatchObject([{ id: '0' }, { id: '1' }]);
  });
});
