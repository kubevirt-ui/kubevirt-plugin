import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { renderHook } from '@testing-library/react';

import { BootableVolumesFilterID } from './constants';
import useBootableVolumesFilters from './useBootableVolumesFilters';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  t: (str: string) => str,
  useKubevirtTranslation: () => ({ t: (str: string) => str }),
}));

jest.mock('@multicluster/useIsACMPage', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter', () => ({
  __esModule: true,
  default: () => ({
    categoryLabel: 'Cluster',
    id: 'cluster',
    match: jest.fn(),
    options: [],
  }),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useProjectFilter', () => ({
  __esModule: true,
  default: () => ({
    categoryLabel: 'Project',
    filterLayout: 'select',
    id: 'project',
    match: jest.fn(() => true),
    options: [],
  }),
}));

const ARCHITECTURE_LABEL = 'template.kubevirt.io/architecture';
const KUBEVIRT_ISO_LABEL = 'kubevirt.io/iso';
const DEFAULT_PREFERENCE_LABEL = 'instancetype.kubevirt.io/default-preference';

const createMockBootableVolume = (
  overrides: Partial<{
    architecture: string;
    isoLabel: string;
    kind: string;
    name: string;
    namespace: string;
    preferenceLabel: string;
  }> = {},
): BootableVolume =>
  ({
    apiVersion: 'v1',
    kind: overrides.kind ?? 'PersistentVolumeClaim',
    metadata: {
      labels: {
        ...(overrides.architecture && { [ARCHITECTURE_LABEL]: overrides.architecture }),
        ...(overrides.isoLabel && { [KUBEVIRT_ISO_LABEL]: overrides.isoLabel }),
        ...(overrides.preferenceLabel && { [DEFAULT_PREFERENCE_LABEL]: overrides.preferenceLabel }),
      },
      name: overrides.name ?? 'test-volume',
      namespace: overrides.namespace ?? 'default',
    },
  }) as unknown as BootableVolume;

describe('useBootableVolumesFilters', () => {
  const sampleVolumes: BootableVolume[] = [
    createMockBootableVolume({
      architecture: 'x86_64',
      name: 'rhel9-vol',
      preferenceLabel: 'rhel.9',
    }),
    createMockBootableVolume({
      architecture: 'aarch64',
      kind: 'DataSource',
      name: 'fedora-vol',
      preferenceLabel: 'fedora',
    }),
    createMockBootableVolume({
      architecture: 'x86_64',
      isoLabel: 'true',
      name: 'win-iso',
      preferenceLabel: 'windows.11',
    }),
  ];

  const getFilterById = (id: string) => {
    const { result } = renderHook(() => useBootableVolumesFilters(sampleVolumes));
    return result.current.find((f) => f.id === id);
  };

  describe('deprecated filter', () => {
    it('should hide deprecated volumes when nothing is selected', () => {
      const filter = getFilterById(BootableVolumesFilterID.SHOW_DEPRECATED_BOOTABLE_VOLUMES);
      const deprecatedVol = createMockBootableVolume({ name: 'centos-stream8' });
      const normalVol = createMockBootableVolume({ name: 'rhel9-server' });

      expect(filter.match(deprecatedVol, [])).toBe(false);
      expect(filter.match(normalVol, [])).toBe(true);
    });

    it('should show all volumes (including deprecated) when "true" is selected', () => {
      const filter = getFilterById(BootableVolumesFilterID.SHOW_DEPRECATED_BOOTABLE_VOLUMES);
      const deprecatedVol = createMockBootableVolume({ name: 'centos-stream8' });
      const normalVol = createMockBootableVolume({ name: 'rhel9-server' });

      expect(filter.match(deprecatedVol, ['true'])).toBe(true);
      expect(filter.match(normalVol, ['true'])).toBe(true);
    });

    it('should hide centos7 when nothing is selected', () => {
      const filter = getFilterById(BootableVolumesFilterID.SHOW_DEPRECATED_BOOTABLE_VOLUMES);
      const centos7Vol = createMockBootableVolume({ name: 'centos7' });

      expect(filter.match(centos7Vol, [])).toBe(false);
    });
  });

  describe('architecture filter', () => {
    it('should match volumes by architecture label', () => {
      const filter = getFilterById(BootableVolumesFilterID.ARCHITECTURE);
      const x86Vol = createMockBootableVolume({ architecture: 'x86_64' });
      const armVol = createMockBootableVolume({ architecture: 'aarch64' });

      expect(filter.match(x86Vol, ['x86_64'])).toBe(true);
      expect(filter.match(armVol, ['x86_64'])).toBe(false);
      expect(filter.match(armVol, ['aarch64'])).toBe(true);
    });

    it('should match with NODATA_ID when volume has no architecture', () => {
      const filter = getFilterById(BootableVolumesFilterID.ARCHITECTURE);
      const noArchVol = createMockBootableVolume({});

      expect(filter.match(noArchVol, ['NO_DATA'])).toBe(true);
      expect(filter.match(noArchVol, ['x86_64'])).toBe(false);
    });

    it('should generate options from available architectures in data', () => {
      const filter = getFilterById(BootableVolumesFilterID.ARCHITECTURE);
      const optionValues = filter.options.map((o) => o.value);

      expect(optionValues).toContain('x86_64');
      expect(optionValues).toContain('aarch64');
    });
  });

  describe('OS filter', () => {
    it('should match volumes by preference OS type', () => {
      const filter = getFilterById(BootableVolumesFilterID.OS);
      const rhelVol = createMockBootableVolume({ preferenceLabel: 'rhel.9' });
      const windowsVol = createMockBootableVolume({ preferenceLabel: 'windows.11' });

      expect(filter.match(rhelVol, ['rhel'])).toBe(true);
      expect(filter.match(rhelVol, ['windows'])).toBe(false);
      expect(filter.match(windowsVol, ['windows'])).toBe(true);
    });

    it('should classify volumes without known OS as "other"', () => {
      const filter = getFilterById(BootableVolumesFilterID.OS);
      const unknownVol = createMockBootableVolume({ preferenceLabel: 'ubuntu.22' });

      expect(filter.match(unknownVol, ['other'])).toBe(true);
      expect(filter.match(unknownVol, ['rhel'])).toBe(false);
    });
  });

  describe('resource kind filter', () => {
    it('should match PersistentVolumeClaim volumes', () => {
      const filter = getFilterById(BootableVolumesFilterID.RESOURCE_KIND);
      const pvcVol = createMockBootableVolume({ kind: 'PersistentVolumeClaim' });

      expect(filter.match(pvcVol, ['PersistentVolumeClaim'])).toBe(true);
      expect(filter.match(pvcVol, ['DataSource'])).toBe(false);
    });

    it('should match DataSource volumes', () => {
      const filter = getFilterById(BootableVolumesFilterID.RESOURCE_KIND);
      const dsVol = createMockBootableVolume({ kind: 'DataSource' });

      expect(filter.match(dsVol, ['DataSource'])).toBe(true);
      expect(filter.match(dsVol, ['PersistentVolumeClaim'])).toBe(false);
    });
  });

  describe('type (ISO) filter', () => {
    it('should match volumes with ISO label', () => {
      const filter = getFilterById(BootableVolumesFilterID.TYPE);
      const isoVol = createMockBootableVolume({ isoLabel: 'true' });

      expect(filter.match(isoVol, ['ISO'])).toBe(true);
    });

    it('should not match volumes without ISO label', () => {
      const filter = getFilterById(BootableVolumesFilterID.TYPE);
      const normalVol = createMockBootableVolume({});

      expect(filter.match(normalVol, ['ISO'])).toBe(false);
    });
  });

  describe('filter structure', () => {
    it('should not include cluster filter when not on ACM page', () => {
      const { result } = renderHook(() => useBootableVolumesFilters(sampleVolumes));
      const filterIds = result.current.map((f) => f.id);

      expect(filterIds).not.toContain('cluster');
    });

    it('should include project filter', () => {
      const { result } = renderHook(() => useBootableVolumesFilters(sampleVolumes));
      const filterIds = result.current.map((f) => f.id);

      expect(filterIds).toContain('project');
    });

    it('should include all expected filter IDs', () => {
      const { result } = renderHook(() => useBootableVolumesFilters(sampleVolumes));
      const filterIds = result.current.map((f) => f.id);

      expect(filterIds).toContain(BootableVolumesFilterID.SHOW_DEPRECATED_BOOTABLE_VOLUMES);
      expect(filterIds).toContain(BootableVolumesFilterID.ARCHITECTURE);
      expect(filterIds).toContain(BootableVolumesFilterID.OS);
      expect(filterIds).toContain(BootableVolumesFilterID.RESOURCE_KIND);
      expect(filterIds).toContain(BootableVolumesFilterID.TYPE);
    });
  });
});
