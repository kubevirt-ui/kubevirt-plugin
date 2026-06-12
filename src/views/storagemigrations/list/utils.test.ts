import {
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';

import {
  compareMigrationNamespaces,
  compareMigrationStarted,
  compareMigrationStorageClasses,
  getStorageClassesFromMigPlan,
  getStorageMigrationRowModel,
} from './utils';

const makePlan = (
  overrides: Partial<MultiNamespaceVirtualMachineStorageMigrationPlan> = {},
): MultiNamespaceVirtualMachineStorageMigrationPlan =>
  ({
    apiVersion: 'migrations.kubevirt.io/v1alpha1',
    kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
    metadata: { name: 'plan-1', namespace: 'ns-1' },
    spec: {
      namespaces: [
        {
          name: 'ns-1',
          virtualMachines: [
            {
              name: 'vm-a',
              targetMigrationPVCs: [
                { destinationPVC: { storageClassName: 'fast' }, volumeName: 'disk0' },
              ],
            },
          ],
        },
      ],
    },
    ...overrides,
  } as MultiNamespaceVirtualMachineStorageMigrationPlan);

describe('getStorageMigrationRowModel', () => {
  it('should return MultiNamespaceVirtualMachineStorageMigrationPlanModel for MultiNamespace kind', () => {
    const plan = makePlan({ kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan' });
    expect(getStorageMigrationRowModel(plan)).toBe(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    );
  });

  it('should return VirtualMachineStorageMigrationPlanModel for single-namespace kind', () => {
    const plan = makePlan({ kind: 'VirtualMachineStorageMigrationPlan' });
    expect(getStorageMigrationRowModel(plan)).toBe(VirtualMachineStorageMigrationPlanModel);
  });

  it('should default to MultiNamespace model when kind is undefined', () => {
    const plan = makePlan({ kind: undefined });
    expect(getStorageMigrationRowModel(plan)).toBe(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    );
  });
});

describe('getStorageClassesFromMigPlan', () => {
  it('should extract unique storage classes from namespaces', () => {
    const plan = makePlan({
      spec: {
        namespaces: [
          {
            name: 'ns-1',
            virtualMachines: [
              {
                name: 'vm-a',
                targetMigrationPVCs: [
                  { destinationPVC: { storageClassName: 'fast' }, volumeName: 'disk0' },
                  { destinationPVC: { storageClassName: 'slow' }, volumeName: 'disk1' },
                ],
              },
            ],
          },
          {
            name: 'ns-2',
            virtualMachines: [
              {
                name: 'vm-b',
                targetMigrationPVCs: [
                  { destinationPVC: { storageClassName: 'fast' }, volumeName: 'disk0' },
                ],
              },
            ],
          },
        ],
      },
    } as Partial<MultiNamespaceVirtualMachineStorageMigrationPlan>);

    const result = getStorageClassesFromMigPlan(plan);
    expect(result).toEqual(expect.arrayContaining(['fast', 'slow']));
    expect(result).toHaveLength(2);
  });

  it('should handle plan with empty namespaces (normalized single-ns plan with no spec.namespaces)', () => {
    const plan = makePlan({ spec: { namespaces: [] } });
    expect(getStorageClassesFromMigPlan(plan)).toEqual([]);
  });
});

describe('compareMigrationNamespaces', () => {
  it('should compare plans by number of namespaces', () => {
    const planA = makePlan({
      spec: { namespaces: [{ name: 'ns-1', virtualMachines: [] }] },
    } as Partial<MultiNamespaceVirtualMachineStorageMigrationPlan>);

    const planB = makePlan({
      spec: {
        namespaces: [
          { name: 'ns-1', virtualMachines: [] },
          { name: 'ns-2', virtualMachines: [] },
        ],
      },
    } as Partial<MultiNamespaceVirtualMachineStorageMigrationPlan>);

    expect(compareMigrationNamespaces(planA, planB)).toBeLessThan(0);
    expect(compareMigrationNamespaces(planB, planA)).toBeGreaterThan(0);
    expect(compareMigrationNamespaces(planA, planA)).toBe(0);
  });
});

describe('compareMigrationStorageClasses', () => {
  it('should compare plans by first storage class alphabetically', () => {
    const planA = makePlan();
    const planB = makePlan({
      spec: {
        namespaces: [
          {
            name: 'ns-1',
            virtualMachines: [
              {
                name: 'vm-a',
                targetMigrationPVCs: [
                  { destinationPVC: { storageClassName: 'zeta' }, volumeName: 'disk0' },
                ],
              },
            ],
          },
        ],
      },
    } as Partial<MultiNamespaceVirtualMachineStorageMigrationPlan>);

    expect(compareMigrationStorageClasses(planA, planB)).toBeLessThan(0);
  });

  it('should not throw when plans have no storage classes', () => {
    const planA = makePlan({ spec: { namespaces: [] } });
    const planB = makePlan({ spec: { namespaces: [] } });
    expect(() => compareMigrationStorageClasses(planA, planB)).not.toThrow();
  });
});

describe('compareMigrationStarted', () => {
  it('should not throw when plans have no start timestamp', () => {
    const planA = makePlan();
    const planB = makePlan();
    expect(() => compareMigrationStarted(planA, planB)).not.toThrow();
  });
});
