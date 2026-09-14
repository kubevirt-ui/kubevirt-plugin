import { type TFunction } from 'i18next';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildCSVContent } from '@kubevirt-utils/hooks/useTableExport/exportToCSV';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { SortByDirection } from '@patternfly/react-table';

import { getClusterInstancetypeColumns } from '../clusterInstancetypeDefinition';
import { getUserInstancetypeColumns } from '../userInstancetypeDefinition';

import {
  getInstancetypeMemoryDisplayValue,
  getInstancetypeMemorySortValue,
  sortByInstancetypeMemory,
} from './utils';

const t = ((key: string) => key) as TFunction;

const createInstancetype = (
  name: string,
  memory?: string,
): V1beta1VirtualMachineClusterInstancetype =>
  ({
    metadata: { name },
    spec: memory ? { cpu: { guest: 1 }, memory: { guest: memory } } : { cpu: { guest: 1 } },
  }) as V1beta1VirtualMachineClusterInstancetype;

describe('getInstancetypeMemoryDisplayValue', () => {
  it('returns the same humanized string the table shows', () => {
    expect(getInstancetypeMemoryDisplayValue(createInstancetype('u1.2xlarge', '16Gi'))).toBe(
      '16 GiB',
    );
  });

  it('returns a dash when memory is missing', () => {
    expect(getInstancetypeMemoryDisplayValue(createInstancetype('no-memory'))).toBe(NO_DATA_DASH);
  });
});

describe('getInstancetypeMemorySortValue', () => {
  it('returns bytes for numeric sorting', () => {
    expect(getInstancetypeMemorySortValue(createInstancetype('u1.2xlarge', '16Gi'))).toBe(
      17179869184,
    );
  });

  it('returns 0 when memory is missing', () => {
    expect(getInstancetypeMemorySortValue(createInstancetype('no-memory'))).toBe(0);
  });
});

describe('sortByInstancetypeMemory', () => {
  it('sorts by byte size, not by the display string', () => {
    const rows = [
      createInstancetype('large', '16Gi'),
      createInstancetype('small', '1Gi'),
      createInstancetype('medium', '4Gi'),
    ];

    expect(
      sortByInstancetypeMemory(rows, SortByDirection.asc).map((row) => row.metadata?.name),
    ).toEqual(['small', 'medium', 'large']);
  });
});

describe('instance type CSV memory column', () => {
  it('exports humanized memory instead of raw bytes for cluster instance types', () => {
    const columns = getClusterInstancetypeColumns(t, false);
    const csv = buildCSVContent([createInstancetype('u1.2xlarge', '16Gi')], columns);

    expect(csv).toContain('16 GiB');
    expect(csv).not.toContain('17179869184');
  });

  it('exports humanized memory instead of raw bytes for user instance types', () => {
    const columns = getUserInstancetypeColumns(t, false, false);
    const csv = buildCSVContent([createInstancetype('u1.2xlarge', '16Gi')], columns);

    expect(csv).toContain('16 GiB');
    expect(csv).not.toContain('17179869184');
  });
});
