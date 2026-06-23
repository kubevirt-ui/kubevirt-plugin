import {
  MigPlanModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { STORAGE_MIGRATION_API } from '@kubevirt-utils/resources/migrations/constants';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

import useClusterStorageMigrationApiProbe, {
  type StorageMigrationProbeCsv,
} from './useClusterStorageMigrationApiProbe';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sListItems: jest.fn(),
}));

jest.mock('@multicluster/useIsACMPage', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  useHubClusterName: jest.fn(() => ['hub-cluster', true, undefined]),
}));

afterEach(() => {
  cleanup();
  (kubevirtK8sListItems as jest.Mock).mockReset();
  (useIsACMPage as jest.Mock).mockImplementation(() => true);
});

describe('useClusterStorageMigrationApiProbe', () => {
  it('single-cluster (non-ACM): assumes MULTI_NS without LIST probe', () => {
    (useIsACMPage as jest.Mock).mockImplementation(() => false);

    const csv = {
      installedCSV: undefined,
      loaded: false,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    expect(result.current).toBe(STORAGE_MIGRATION_API.MULTI_NS);
    expect(kubevirtK8sListItems).not.toHaveBeenCalled();

    (useIsACMPage as jest.Mock).mockImplementation(() => true);
  });

  it('resolves MULTI_NS without LIST when CSV is loaded and minor is 21 or above', async () => {
    const csv = {
      installedCSV: { spec: { version: '4.21.0' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.MULTI_NS);
    });

    expect(kubevirtK8sListItems).not.toHaveBeenCalled();
  });

  it('runs LIST probe when CSV minor is below 21', async () => {
    (kubevirtK8sListItems as jest.Mock).mockResolvedValue([]);

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.MULTI_NS);
    });

    expect(kubevirtK8sListItems).toHaveBeenCalled();
  });

  it('resolves MTC when multi-namespace API 404s and MigPlan LIST succeeds (CSV minor below 21)', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ code: 404 });
      }
      if (model === MigPlanModel) {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.MTC);
    });
  });

  it('resolves SINGLE_NS when multi-namespace API and MigPlan 404 but single-namespace plan LIST succeeds', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ code: 404 });
      }
      if (model === MigPlanModel) {
        return Promise.reject({ code: 404 });
      }
      if (model === VirtualMachineStorageMigrationPlanModel) {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.SINGLE_NS);
    });
  });

  it('resolves NONE when multi-namespace API, MigPlan, and single-namespace plan LIST all 404', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (
        model === MultiNamespaceVirtualMachineStorageMigrationPlanModel ||
        model === MigPlanModel ||
        model === VirtualMachineStorageMigrationPlanModel
      ) {
        return Promise.reject({ code: 404 });
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.NONE);
    });
  });

  it('falls through to SINGLE_NS when multi-namespace LIST fails with 403 Forbidden', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ response: { status: 403 } });
      }
      if (model === VirtualMachineStorageMigrationPlanModel) {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.SINGLE_NS);
    });
  });

  it('falls through to SINGLE_NS when multi-namespace LIST fails with 500', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ response: { status: 500 } });
      }
      if (model === VirtualMachineStorageMigrationPlanModel) {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.SINGLE_NS);
    });
  });

  it('falls through when multi-namespace LIST has no HTTP status (transport-like) and single-namespace LIST 404s', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject(new TypeError('Failed to fetch'));
      }
      if (model === VirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ code: 404 });
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.NONE);
    });
  });

  it('resolves MTC when MigPlan LIST fails with 403 Forbidden', async () => {
    (kubevirtK8sListItems as jest.Mock).mockImplementation(({ model }) => {
      if (model === MultiNamespaceVirtualMachineStorageMigrationPlanModel) {
        return Promise.reject({ code: 404 });
      }
      if (model === MigPlanModel) {
        return Promise.reject({ response: { status: 403 } });
      }
      return Promise.reject(new Error('unexpected LIST model in probe'));
    });

    const csv = {
      installedCSV: { spec: { version: '4.20.5' } },
      loaded: true,
    } as StorageMigrationProbeCsv;

    const { result } = renderHook(() => useClusterStorageMigrationApiProbe('my-cluster', csv));

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.MTC);
    });
  });
});
