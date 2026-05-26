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

export const getMigrationRequiredConditionMessageParts = (
  t: TFunction,
  condition?: V1VirtualMachineCondition,
): string[] => {
  const parts: string[] = [];

  if (condition?.message) {
    parts.push(condition.message);
  }

  if (condition?.reason && condition.reason !== condition.message) {
    parts.push(condition.reason);
  }

  if (parts.length === 0) {
    parts.push(t('MigrationRequired condition has been set on this VirtualMachine.'));
  }

  return parts;
};
