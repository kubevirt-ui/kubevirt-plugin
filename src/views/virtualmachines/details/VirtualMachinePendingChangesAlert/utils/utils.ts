import { TFunction } from 'i18next';

import { V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

const MIGRATION_REQUIRED_REASONS = {
  AutoMigrationDueToLiveUpdate: 'AutoMigrationDueToLiveUpdate',
} as const;

export const getPendingChangesAlertTitle = (
  t: TFunction,
  isRestartRequired: boolean,
  isMigrationRequired: boolean,
): string | undefined => {
  if (isRestartRequired) {
    return t('Restart required');
  }

  if (isMigrationRequired) {
    return t('Migration required');
  }

  return undefined;
};

const getMigrationRequiredReasonMessage = (t: TFunction, reason?: string): string | undefined => {
  switch (reason) {
    case MIGRATION_REQUIRED_REASONS.AutoMigrationDueToLiveUpdate:
      return t(
        'Pending configuration changes require migrating or restarting the VirtualMachine to take effect.',
      );
    default:
      return undefined;
  }
};

export const getMigrationRequiredConditionMessage = (
  t: TFunction,
  condition?: V1VirtualMachineCondition,
): string => {
  const baseMessage =
    condition?.message ||
    getMigrationRequiredReasonMessage(t, condition?.reason) ||
    t(
      'This VirtualMachine has pending changes that require migration or restart before they can take effect.',
    );

  if (!condition?.reason || baseMessage.includes(condition.reason)) {
    return baseMessage;
  }

  return t('{{message}} Reason: {{reason}}.', {
    message: baseMessage,
    reason: condition.reason,
  });
};
