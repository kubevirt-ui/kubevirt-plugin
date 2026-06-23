import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  CONDITION_TYPE_FAILED,
  CONDITION_TYPE_SUCCEEDED,
  K8S_CONDITION_STATUS_TRUE,
  MIG_MIGRATION_PHASE,
  MigMigration,
  MigPlan,
  MigrationStatus,
  MTC_PLAN_VM_PLACEHOLDER,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STATUS_COMPLETED,
  STATUS_READY,
  STORAGE_MIGRATION_PHASE,
} from '../constants';
import { getStorageMigrationPlanSpecNamespaces } from '../selectors';

import { emptyNamespaceStatus } from './constants';
import { MTC_WIZARD_PROGRESS_PHASE_TYPE } from './matching';
import { migPlanHasFailedCondition } from './migPlanEval';

/*
 * MTC reports progress on MigMigration / MigPlan (migration.openshift.io). The wizard and shared
 * progress code expect MultiNamespaceVirtualMachineStorageMigrationPlan status (namespace slices,
 * phases, conditions). This file maps MTC outcomes into that shape so MTC reuses the same helpers
 * as the native storage migration APIs.
 */
const mtcConditionTimestamp = (m: MigMigration): string | undefined =>
  m?.status?.conditions
    ?.filter((c) => c.status === K8S_CONDITION_STATUS_TRUE && c.lastTransitionTime)
    .sort(
      (a, b) => new Date(b.lastTransitionTime).getTime() - new Date(a.lastTransitionTime).getTime(),
    )[0]?.lastTransitionTime;

const normalizeMigMigrationPhase = (m: MigMigration | undefined): string =>
  (m?.status?.phase ?? '').trim().toLowerCase();

export const isMigMigrationSucceeded = (m: MigMigration | undefined): boolean => {
  if (!m) return false;
  const phase = normalizeMigMigrationPhase(m);
  if (phase === MIG_MIGRATION_PHASE.COMPLETED || phase === MIG_MIGRATION_PHASE.SUCCESSFUL)
    return true;
  return (
    m.status?.conditions?.some(
      (c) =>
        (c.type === CONDITION_TYPE_SUCCEEDED || c.type === STATUS_COMPLETED) &&
        c.status === K8S_CONDITION_STATUS_TRUE,
    ) ?? false
  );
};

/**
 * Treat as failed when the migration has reached a terminal failed phase OR has a Failed
 * condition with status True AND no active phase (empty/unset). Transient Failed conditions
 * during early phases like Requested are not treated as terminal.
 * @param m MigMigration to evaluate (undefined treated as not failed).
 */
export const isMigMigrationFailed = (m: MigMigration | undefined): boolean => {
  if (!m) return false;
  const phase = normalizeMigMigrationPhase(m);
  if (phase === MIG_MIGRATION_PHASE.FAILED) return true;
  if (phase) return false;
  return (
    m.status?.conditions?.some(
      (c) => c.type === CONDITION_TYPE_FAILED && c.status === K8S_CONDITION_STATUS_TRUE,
    ) ?? false
  );
};

const buildFailedNamespaceStatuses = (
  spec: MultiNamespaceVirtualMachineStorageMigrationPlan['spec'],
): MultiNamespaceVirtualMachineStorageMigrationPlan['status']['namespaces'] =>
  getStorageMigrationPlanSpecNamespaces({ spec }).map((ns) => {
    const failed: MigrationStatus[] = (ns.virtualMachines ?? []).map((vm) => ({
      name: vm.name,
      sourcePVCs: (vm.targetMigrationPVCs ?? []).map((t) => ({ name: t.volumeName })),
    }));

    return {
      ...emptyNamespaceStatus(),
      [STORAGE_MIGRATION_PHASE.FAILED]: !isEmpty(failed)
        ? failed
        : [{ name: MTC_PLAN_VM_PLACEHOLDER, sourcePVCs: [] }],
    };
  });

// Merge polled MigMigration outcome into a normalized MTC plan for shared progress helpers.
export const mergeMTCMigMigrationStatusIntoPlan = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
  migMigration: MigMigration | undefined,
  rawMigPlan?: MigPlan,
): MultiNamespaceVirtualMachineStorageMigrationPlan => {
  const spec = plan.spec;
  const ts = mtcConditionTimestamp(migMigration) ?? plan.metadata?.creationTimestamp;

  if (rawMigPlan && migPlanHasFailedCondition(rawMigPlan)) {
    return {
      ...plan,
      status: {
        namespaces: buildFailedNamespaceStatuses(spec),
      },
    };
  }

  if (isMigMigrationFailed(migMigration)) {
    return {
      ...plan,
      status: {
        namespaces: buildFailedNamespaceStatuses(spec),
      },
    };
  }

  if (isMigMigrationSucceeded(migMigration)) {
    return {
      ...plan,
      status: {
        namespaces: getStorageMigrationPlanSpecNamespaces(plan).map((ns) => {
          const completed: MigrationStatus[] = (ns.virtualMachines ?? []).map((vm) => ({
            name: vm.name,
            sourcePVCs: (vm.targetMigrationPVCs ?? []).map((t) => ({ name: t.volumeName })),
          }));
          return {
            ...emptyNamespaceStatus(),
            completedOutOf: ns.virtualMachines?.length ?? 0,
            conditions: [
              { lastTransitionTime: ts, status: K8S_CONDITION_STATUS_TRUE, type: STATUS_READY },
            ],
            [STORAGE_MIGRATION_PHASE.COMPLETED]: completed,
          };
        }),
      },
    };
  }

  const phase = migMigration?.status?.phase?.trim();

  return {
    ...plan,
    status: {
      namespaces: getStorageMigrationPlanSpecNamespaces(plan).map(() => ({
        ...emptyNamespaceStatus(),
        ...(phase
          ? {
              conditions: [
                {
                  lastTransitionTime: ts,
                  message: phase,
                  status: K8S_CONDITION_STATUS_TRUE,
                  type: MTC_WIZARD_PROGRESS_PHASE_TYPE,
                },
              ],
              [STORAGE_MIGRATION_PHASE.IN_PROGRESS]: [
                { name: MTC_PLAN_VM_PLACEHOLDER, sourcePVCs: [] },
              ],
            }
          : {}),
      })),
    },
  };
};

export const pickLatestMigMigrationForPlan = (
  migrations: MigMigration[],
  planName: string,
): MigMigration | undefined =>
  (migrations ?? [])
    .filter((m) => m.spec?.migPlanRef?.name === planName)
    .sort(
      (a, b) =>
        new Date(b.metadata?.creationTimestamp ?? 0).getTime() -
        new Date(a.metadata?.creationTimestamp ?? 0).getTime(),
    )[0];
