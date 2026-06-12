import { STORAGE_MIGRATION_API } from '@kubevirt-utils/resources/migrations/constants';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { cleanup, renderHook } from '@testing-library/react';

import useStorageMigrationNavigation from './useStorageMigrationNavigation';

jest.mock('@multicluster/hooks/useManagedClusterConsoleURLs', () => ({
  __esModule: true,
  default: jest.fn(() => ({ spokeConsoleURL: '' })),
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  useHubClusterName: jest.fn(() => ['hub-cluster', true, undefined]),
}));

jest.mock('@multicluster/urls', () => ({
  buildSpokeConsoleUrl: jest.fn((base: string, path: string) => `${base}${path}`),
}));

jest.mock('@virtualmachines/actions/hooks/storageMigrationApi/constants', () => ({
  ...jest.requireActual('@virtualmachines/actions/hooks/storageMigrationApi/constants'),
  spokeSupportsCustomMigrationsRoute: jest.fn((version: string | undefined) => {
    if (!version) return false;
    const [major, minor] = version.split('.').map(Number);
    return major > 4 || (major === 4 && minor >= 23);
  }),
}));

const mockUseManagedClusterConsoleURLs = useManagedClusterConsoleURLs as jest.Mock;

afterEach(() => {
  cleanup();
  mockUseManagedClusterConsoleURLs.mockReset();
  mockUseManagedClusterConsoleURLs.mockReturnValue({ spokeConsoleURL: '' });
});

describe('useStorageMigrationNavigation', () => {
  describe('when storageMigAPI is LOADING', () => {
    it('should return empty paths', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.LOADING, undefined),
      );

      expect(result.current.basePath).toBe('');
      expect(result.current.pendingUrl).toBe('');
      expect(result.current.runningUrl).toBe('');
      expect(result.current.isExternal).toBe(false);
    });
  });

  describe('when storageMigAPI is NONE', () => {
    it('should return empty paths', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.NONE, undefined),
      );

      expect(result.current.basePath).toBe('');
      expect(result.current.pendingUrl).toBe('');
      expect(result.current.runningUrl).toBe('');
    });
  });

  describe('hub cluster (non-spoke)', () => {
    it('should always use custom route regardless of CSV version', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.MULTI_NS, '4.22.0'),
      );

      expect(result.current.basePath).toBe('/k8s/all-namespaces/storagemigrations');
      expect(result.current.isExternal).toBe(false);
    });

    it('should always use custom route even when CSV version is undefined', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.MULTI_NS, undefined),
      );

      expect(result.current.basePath).toBe('/k8s/all-namespaces/storagemigrations');
    });

    it('should always use custom route for SINGLE_NS API', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.SINGLE_NS, '4.22.0'),
      );

      expect(result.current.basePath).toBe('/k8s/all-namespaces/storagemigrations');
    });

    it('should always use custom route for MTC API', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.MTC, '4.23.0'),
      );

      expect(result.current.basePath).toBe('/k8s/all-namespaces/storagemigrations');
    });
  });

  describe('spoke cluster', () => {
    beforeEach(() => {
      mockUseManagedClusterConsoleURLs.mockReturnValue({
        spokeConsoleURL: 'https://spoke.example.com',
      });
    });

    it('should use spoke custom route when CSV version >= 4.23', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation('spoke-cluster', STORAGE_MIGRATION_API.MULTI_NS, '4.23.0'),
      );

      expect(result.current.basePath).toContain('https://spoke.example.com');
      expect(result.current.basePath).toContain('/k8s/all-namespaces/storagemigrations');
      expect(result.current.isExternal).toBe(true);
    });

    it('should fall back to GVK resource URL when CSV version < 4.23', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation('spoke-cluster', STORAGE_MIGRATION_API.MULTI_NS, '4.22.0'),
      );

      expect(result.current.basePath).toContain('https://spoke.example.com');
      expect(result.current.basePath).toContain('migrations.kubevirt.io');
      expect(result.current.isExternal).toBe(true);
    });

    it('should fall back to GVK resource URL when CSV version is undefined', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation('spoke-cluster', STORAGE_MIGRATION_API.MULTI_NS, undefined),
      );

      expect(result.current.basePath).toContain('https://spoke.example.com');
      expect(result.current.basePath).toContain('migrations.kubevirt.io');
    });

    it('should always use MTC GVK resource URL regardless of CSV version', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation('spoke-cluster', STORAGE_MIGRATION_API.MTC, '4.23.0'),
      );

      expect(result.current.basePath).toContain('https://spoke.example.com');
      expect(result.current.basePath).toContain('migration.openshift.io');
      expect(result.current.basePath).not.toContain('/k8s/all-namespaces/storagemigrations');
    });
  });

  describe('status filter URLs', () => {
    it('should append status filter params to pending and running URLs', () => {
      const { result } = renderHook(() =>
        useStorageMigrationNavigation(undefined, STORAGE_MIGRATION_API.MULTI_NS, '4.23.0'),
      );

      expect(result.current.pendingUrl).toContain('?');
      expect(result.current.runningUrl).toContain('?');
      expect(result.current.pendingUrl).not.toBe(result.current.runningUrl);
    });
  });
});
