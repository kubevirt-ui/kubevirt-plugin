import { TFunction } from 'i18next';

import { V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

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

export const getMigrationRequiredConditionMessage = (
  t: TFunction,
  condition?: V1VirtualMachineCondition,
): string => {
  const baseMessage =
    condition?.message ||
    t(
      'Pending configuration changes require migrating or restarting the VirtualMachine to take effect.',
    );

  if (!condition?.reason || baseMessage.includes(condition.reason)) {
    return baseMessage;
  }

  return t('{{message}} Reason: {{reason}}.', {
    message: baseMessage,
    reason: condition.reason,
  });
};
