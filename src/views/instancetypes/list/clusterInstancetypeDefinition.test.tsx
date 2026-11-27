import React from 'react';
import { type TFunction } from 'i18next';

import { getClusterInstancetypeColumns } from './clusterInstancetypeDefinition';

jest.mock('./components/FamilyStatusCell/FamilyStatusCell', () => ({
  __esModule: true,
  default: () => <span>family-status-cell</span>,
}));
jest.mock('@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../actions/ClusterInstancetypeActions', () => ({
  __esModule: true,
  default: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;
const keysOf = (showFamilyStatusColumn: boolean, showClusterColumn = false): string[] =>
  getClusterInstancetypeColumns(t, showClusterColumn, showFamilyStatusColumn).map(
    (column) => column.key,
  );

describe('getClusterInstancetypeColumns', () => {
  it('includes the family status column when the user may see family availability', () => {
    expect(keysOf(true)).toEqual(['name', 'cpu', 'memory', 'vendor', 'familyStatus', 'actions']);
  });

  it('omits the family status column (header, management and export) otherwise', () => {
    expect(keysOf(false)).toEqual(['name', 'cpu', 'memory', 'vendor', 'actions']);
  });

  it('still adds the cluster column independently of the family status column', () => {
    expect(keysOf(false, true)).toEqual(['name', 'cluster', 'cpu', 'memory', 'vendor', 'actions']);
  });
});
