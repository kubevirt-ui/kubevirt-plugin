import {
  ALL_CLUSTERS,
  ALL_CLUSTERS_KEY,
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY,
  ALL_PROJECTS,
} from '@kubevirt-utils/hooks/constants';

import { buildExportFilename, EXPORT_TABLE_KEYS } from './constants';

describe('buildExportFilename', () => {
  it('normalizes all-clusters values', () => {
    expect(buildExportFilename(ALL_CLUSTERS, 'default', EXPORT_TABLE_KEYS.VIRTUAL_MACHINES)).toBe(
      `${ALL_CLUSTERS_KEY}-default-virtual-machines`,
    );
    expect(
      buildExportFilename(ALL_CLUSTERS_KEY, 'default', EXPORT_TABLE_KEYS.VIRTUAL_MACHINES),
    ).toBe(`${ALL_CLUSTERS_KEY}-default-virtual-machines`);
  });

  it('normalizes all-namespaces values', () => {
    expect(buildExportFilename('prod', ALL_NAMESPACES, EXPORT_TABLE_KEYS.VIRTUAL_MACHINES)).toBe(
      `prod-${ALL_NAMESPACES}-virtual-machines`,
    );
    expect(buildExportFilename('prod', ALL_PROJECTS, EXPORT_TABLE_KEYS.VIRTUAL_MACHINES)).toBe(
      `prod-${ALL_NAMESPACES}-virtual-machines`,
    );
    expect(
      buildExportFilename('prod', ALL_NAMESPACES_SESSION_KEY, EXPORT_TABLE_KEYS.VIRTUAL_MACHINES),
    ).toBe(`prod-${ALL_NAMESPACES}-virtual-machines`);
  });
});
