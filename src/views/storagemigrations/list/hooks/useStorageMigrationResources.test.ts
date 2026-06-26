import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MigPlan,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import useK8sListData from '@multicluster/hooks/useK8sListData';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import useStorageMigrationResources from './useStorageMigrationResources';

jest.mock('@kubevirt-utils/hooks/useNamespaceParam', () => ({
  __esModule: true,
  default: jest.fn(() => 'test-ns'),
}));

jest.mock('@multicluster/hooks/useK8sWatchData', () => ({
  __esModule: true,
  default: jest.fn(() => [[], true, undefined]),
}));

jest.mock('@multicluster/hooks/useK8sListData', () => ({
  __esModule: true,
  default: jest.fn(() => [[], true, undefined]),
}));

const multiNsGVK = modelToGroupVersionKind(MultiNamespaceVirtualMachineStorageMigrationPlanModel);
const singleNsGVK = modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel);

const multiNsPlan: MultiNamespaceVirtualMachineStorageMigrationPlan = {
  apiVersion: 'migrations.kubevirt.io/v1alpha1',
  kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
  metadata: { name: 'multi-plan-1', namespace: 'test-ns' },
  spec: {
    namespaces: [
      {
        name: 'test-ns',
        virtualMachines: [{ name: 'vm-a', targetMigrationPVCs: [{ volumeName: 'disk0' }] }],
      },
    ],
  },
} as MultiNamespaceVirtualMachineStorageMigrationPlan;

const singleNsPlan: VirtualMachineStorageMigrationPlan = {
  apiVersion: 'migrations.kubevirt.io/v1alpha1',
  kind: 'VirtualMachineStorageMigrationPlan',
  metadata: { name: 'single-plan-1', namespace: 'test-ns' },
  spec: {
    virtualMachines: [{ name: 'vm-b', targetMigrationPVCs: [{ volumeName: 'disk1' }] }],
  },
} as VirtualMachineStorageMigrationPlan;

const mtcPlan: MigPlan = {
  apiVersion: 'migration.openshift.io/v1alpha1',
  kind: 'MigPlan',
  metadata: { name: 'mtc-plan-1', namespace: 'openshift-migration' },
  spec: {
    namespaces: ['test-ns'],
    persistentVolumes: [
      {
        pvc: { name: 'pvc-a', namespace: 'test-ns' },
        selection: { storageClass: 'fast' },
      },
    ],
  },
} as MigPlan;

afterEach(() => {
  cleanup();
  (useK8sWatchData as jest.Mock).mockReset();
  (useK8sListData as jest.Mock).mockReset();
});

describe('useStorageMigrationResources', () => {
  const bothKubevirtApis404 = () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [undefined, false, { code: 404 }];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [undefined, false, { code: 404 }];
      }
      return [[], true, undefined];
    });
  };

  it('should combine MultiNamespace, VirtualMachineStorageMigration, and MTC plans when all APIs exist', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [[multiNsPlan], true, undefined];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [[singleNsPlan], true, undefined];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[mtcPlan], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.storageMigPlans).toHaveLength(2);

    const names = result.current.storageMigPlans.map((p) => p.metadata.name);
    expect(names).toContain('multi-plan-1');
    expect(names).toContain('single-plan-1');
    expect(names).not.toContain('mtc-plan-1');
    expect(useK8sListData).toHaveBeenCalledWith(null);
  });

  it('should include MTC plans only when both KubeVirt APIs are absent', () => {
    bothKubevirtApis404();
    (useK8sListData as jest.Mock).mockReturnValue([[mtcPlan], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.storageMigPlans).toHaveLength(1);
    expect(result.current.storageMigPlans[0].metadata.name).toBe('mtc-plan-1');
    expect(useK8sListData).toHaveBeenCalledWith(
      expect.objectContaining({ namespace: 'openshift-migration' }),
    );
  });

  it('should normalize VirtualMachineStorageMigrationPlan into MultiNamespace shape', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [[], true, undefined];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [[singleNsPlan], true, undefined];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());
    const normalized = result.current.storageMigPlans[0];

    expect(normalized.spec.namespaces).toHaveLength(1);
    expect(normalized.spec.namespaces[0].name).toBe('test-ns');
    expect(normalized.spec.namespaces[0].virtualMachines[0].name).toBe('vm-b');
  });

  it('should filter MTC plans by the active namespace', () => {
    bothKubevirtApis404();
    (useK8sListData as jest.Mock).mockReturnValue([
      [
        mtcPlan,
        {
          ...mtcPlan,
          metadata: { name: 'mtc-plan-other', namespace: 'openshift-migration' },
          spec: { namespaces: ['other-ns'], persistentVolumes: [] },
        },
      ],
      true,
      undefined,
    ]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.storageMigPlans).toHaveLength(1);
    expect(result.current.storageMigPlans[0].metadata.name).toBe('mtc-plan-1');
  });

  it('should treat a 404 on MultiNamespace CRD as empty (not an error)', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [undefined, false, { code: 404 }];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [[singleNsPlan], true, undefined];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.storageMigPlans).toHaveLength(1);
    expect(result.current.storageMigPlans[0].metadata.name).toBe('single-plan-1');
  });

  it('should treat a 404 on VirtualMachineStorageMigration CRD as empty (not an error)', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [[multiNsPlan], true, undefined];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [undefined, false, { code: 404 }];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.storageMigPlans).toHaveLength(1);
    expect(result.current.storageMigPlans[0].metadata.name).toBe('multi-plan-1');
  });

  it('should treat a 404 on MigPlan LIST as empty (not an error)', () => {
    bothKubevirtApis404();
    (useK8sListData as jest.Mock).mockReturnValue([[], false, { code: 404 }]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.storageMigPlans).toHaveLength(0);
  });

  it('should surface non-404 errors from either watch', () => {
    const serverError = { code: 500, message: 'Internal Server Error' };

    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [undefined, false, serverError];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [[singleNsPlan], true, undefined];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBe(serverError);
  });

  it('should report not loaded while either watch is pending', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      const gvk = resource.groupVersionKind;
      if (JSON.stringify(gvk) === JSON.stringify(multiNsGVK)) {
        return [[multiNsPlan], true, undefined];
      }
      if (JSON.stringify(gvk) === JSON.stringify(singleNsGVK)) {
        return [undefined, false, undefined];
      }
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(false);
  });

  it('should return empty list when all sources return no data', () => {
    (useK8sWatchData as jest.Mock).mockImplementation((resource) => {
      if (!resource) return [undefined, true, undefined];
      return [[], true, undefined];
    });
    (useK8sListData as jest.Mock).mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useStorageMigrationResources());

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.storageMigPlans).toHaveLength(0);
  });
});
