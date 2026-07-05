import {
  MigPlanModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { STORAGE_MIGRATION_API } from '@kubevirt-utils/resources/migrations/constants';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { renderHook, waitFor } from '@testing-library/react';

import useClusterStorageMigrationApiProbe from './useClusterStorageMigrationApiProbe';
import { csvBelow21 } from './useClusterStorageMigrationApiProbe.test.mocks';

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
  (kubevirtK8sListItems as jest.Mock).mockReset();
  (useIsACMPage as jest.Mock).mockImplementation(() => true);
});

describe('useClusterStorageMigrationApiProbe – fallback scenarios', () => {
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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

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

    const { result } = renderHook(() =>
      useClusterStorageMigrationApiProbe('my-cluster', csvBelow21),
    );

    await waitFor(() => {
      expect(result.current).toBe(STORAGE_MIGRATION_API.MTC);
    });
  });
});
