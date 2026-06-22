import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  CONDITION_TYPE_FAILED,
  K8S_CONDITION_STATUS_TRUE,
  MigMigration,
  MigPlan,
  MTC_PLAN_VM_PLACEHOLDER,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STATUS_READY,
  STORAGE_MIGRATION_PHASE,
} from '../constants';
import { isMigrationCompleted } from '../utils';

import {
  doesMTCPlanTargetVM,
  isMigMigrationFailed,
  isMigMigrationSucceeded,
  mergeMTCMigMigrationStatusIntoPlan,
  MTC_WIZARD_PROGRESS_PHASE_TYPE,
  normalizeMTCPlanForOverview,
  pickLatestMigMigrationForPlan,
} from './index';

const baseVM = (): V1VirtualMachine =>
  ({
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: { name: 'vm-a', namespace: 'ns-1' },
    spec: {
      template: {
        spec: {
          volumes: [
            {
              name: 'disk0',
              persistentVolumeClaim: { claimName: 'pvc-vm-a-root' },
            },
          ],
        },
      },
    },
  }) as V1VirtualMachine;

const migPlanWithPVCs = (pvs: MigPlan['spec']['persistentVolumes']): MigPlan =>
  ({
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: { name: 'p1', namespace: 'openshift-migration' },
    spec: {
      namespaces: ['ns-1'],
      persistentVolumes: pvs,
    },
  }) as MigPlan;

const pvcVmARootNs1 = { name: 'pvc-vm-a-root', namespace: 'ns-1' };

describe('doesMTCPlanTargetVM', () => {
  it('returns true when a plan PVC matches a VM volume claim', () => {
    const vm = baseVM();
    const plan = migPlanWithPVCs([{ pvc: pvcVmARootNs1, selection: {} }]);
    expect(doesMTCPlanTargetVM(plan, vm)).toBe(true);
  });

  it('returns false when PVCs are for another VM in the same namespace', () => {
    const vm = baseVM();
    const plan = migPlanWithPVCs([
      { pvc: { name: 'pvc-other-vm', namespace: 'ns-1' }, selection: {} },
    ]);
    expect(doesMTCPlanTargetVM(plan, vm)).toBe(false);
  });

  it('returns false when persistentVolumes is empty', () => {
    const vm = baseVM();
    const plan = migPlanWithPVCs([]);
    expect(doesMTCPlanTargetVM(plan, vm)).toBe(false);
  });
});

describe('normalizeMTCPlanForOverview', () => {
  it('maps spec.closed to completed migration status (not running)', () => {
    const base = migPlanWithPVCs([{ pvc: pvcVmARootNs1, selection: { storageClass: 'fast' } }]);
    const migPlan = {
      ...base,
      spec: { ...base.spec, closed: true },
      status: { conditions: [] },
    } as MigPlan;

    const normalized = normalizeMTCPlanForOverview(migPlan);
    expect(isMigrationCompleted(normalized)).toBe(true);
    expect(
      normalized.status?.namespaces?.every((ns) =>
        isEmpty(ns?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS] ?? []),
      ),
    ).toBe(true);
  });
});

describe('isMigMigrationFailed / isMigMigrationSucceeded', () => {
  it('does not treat Requested phase as failed even if a Failed condition is True', () => {
    const m = {
      status: {
        conditions: [{ status: K8S_CONDITION_STATUS_TRUE, type: CONDITION_TYPE_FAILED }],
        phase: 'Requested',
      },
    } as MigMigration;
    expect(isMigMigrationFailed(m)).toBe(false);
    expect(isMigMigrationSucceeded(m)).toBe(false);
  });

  it('treats phase Failed as failed', () => {
    const m = { status: { phase: 'Failed' } } as MigMigration;
    expect(isMigMigrationFailed(m)).toBe(true);
  });

  it('treats completed phase case-insensitively as success', () => {
    const m = { status: { phase: 'completed' } } as MigMigration;
    expect(isMigMigrationSucceeded(m)).toBe(true);
  });
});

const basePlan = (): MultiNamespaceVirtualMachineStorageMigrationPlan =>
  ({
    apiVersion: 'storagemigration.kubevirt.io/v1alpha1',
    kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
    metadata: { creationTimestamp: '2024-01-01T00:00:00Z', name: 'plan-1', namespace: 'ns-1' },
    spec: {
      namespaces: [
        {
          name: 'ns-1',
          virtualMachines: [{ name: 'vm-a', targetMigrationPVCs: [{ volumeName: 'disk0' }] }],
        },
      ],
    },
  }) as MultiNamespaceVirtualMachineStorageMigrationPlan;

const baseMigMigration = (overrides: Partial<MigMigration> = {}): MigMigration =>
  ({
    metadata: { creationTimestamp: '2024-01-01T01:00:00Z', name: 'mig-1' },
    spec: { migPlanRef: { name: 'plan-1' } },
    status: { conditions: [], phase: '' },
    ...overrides,
  }) as MigMigration;

describe('pickLatestMigMigrationForPlan', () => {
  it('selects the newest MigMigration for a given plan', () => {
    const older = baseMigMigration({
      metadata: { creationTimestamp: '2024-01-01T01:00:00Z', name: 'mig-old' },
    });
    const newer = baseMigMigration({
      metadata: { creationTimestamp: '2024-06-01T01:00:00Z', name: 'mig-new' },
    });
    const result = pickLatestMigMigrationForPlan([older, newer], 'plan-1');
    expect(result?.metadata?.name).toBe('mig-new');
  });

  it('filters out migrations for other plans', () => {
    const mine = baseMigMigration();
    const other = baseMigMigration({
      metadata: {
        creationTimestamp: '2099-01-01T00:00:00Z',
        name: 'mig-other',
        namespace: 'openshift-migration',
      },
      spec: { migPlanRef: { name: 'other-plan', namespace: 'openshift-migration' } },
    });
    const result = pickLatestMigMigrationForPlan([mine, other], 'plan-1');
    expect(result?.metadata?.name).toBe('mig-1');
  });

  it('returns undefined for an empty array', () => {
    expect(pickLatestMigMigrationForPlan([], 'plan-1')).toBeUndefined();
  });
});

describe('mergeMTCMigMigrationStatusIntoPlan', () => {
  it('produces failed namespace status when MigMigration has Failed phase', () => {
    const plan = basePlan();
    const mig = baseMigMigration({ status: { conditions: [], phase: 'Failed' } });

    const result = mergeMTCMigMigrationStatusIntoPlan(plan, mig);
    const ns = result.status?.namespaces?.[0];
    expect(ns?.[STORAGE_MIGRATION_PHASE.FAILED]?.length).toBeGreaterThan(0);
  });

  it('produces failed namespace status when rawMigPlan has a Failed condition', () => {
    const plan = basePlan();
    const rawMigPlan = {
      status: {
        conditions: [{ status: K8S_CONDITION_STATUS_TRUE, type: CONDITION_TYPE_FAILED }],
      },
    } as MigPlan;

    const result = mergeMTCMigMigrationStatusIntoPlan(plan, undefined, rawMigPlan);
    const ns = result.status?.namespaces?.[0];
    expect(ns?.[STORAGE_MIGRATION_PHASE.FAILED]?.length).toBeGreaterThan(0);
  });

  it('produces completed namespace status with STATUS_READY and completedOutOf on success', () => {
    const plan = basePlan();
    const mig = baseMigMigration({ status: { conditions: [], phase: 'Completed' } });

    const result = mergeMTCMigMigrationStatusIntoPlan(plan, mig);
    const ns = result.status?.namespaces?.[0];
    expect(ns?.completedOutOf).toBe(1);
    expect(ns?.conditions?.some((c) => c.type === STATUS_READY)).toBe(true);
    expect(ns?.[STORAGE_MIGRATION_PHASE.COMPLETED]?.length).toBeGreaterThan(0);
  });

  it('produces in-progress namespace status with wizard progress condition', () => {
    const plan = basePlan();
    const mig = baseMigMigration({ status: { conditions: [], phase: 'StorageMigration' } });

    const result = mergeMTCMigMigrationStatusIntoPlan(plan, mig);
    const ns = result.status?.namespaces?.[0];
    expect(ns?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]).toEqual([
      { name: MTC_PLAN_VM_PLACEHOLDER, sourcePVCs: [] },
    ]);
    expect(ns?.conditions?.some((c) => c.type === MTC_WIZARD_PROGRESS_PHASE_TYPE)).toBe(true);
  });
});
