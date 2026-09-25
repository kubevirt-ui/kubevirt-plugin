import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const reconcileValue = (
  originalValue: unknown,
  currentValue: unknown,
  updatedValue: unknown,
): unknown => {
  if (isEqual(currentValue, originalValue)) return updatedValue;
  if (isEqual(updatedValue, originalValue)) return currentValue;

  if (isObjectRecord(currentValue) && (isObjectRecord(updatedValue) || updatedValue == null)) {
    const originalRecord = isObjectRecord(originalValue) ? originalValue : {};
    const updatedRecord = isObjectRecord(updatedValue) ? updatedValue : {};
    const reconciledRecord: Record<string, unknown> = {};
    const propertyNames = new Set([
      ...Object.keys(originalRecord),
      ...Object.keys(currentValue),
      ...Object.keys(updatedRecord),
    ]);

    propertyNames.forEach((propertyName) => {
      const value = reconcileValue(
        originalRecord[propertyName],
        currentValue[propertyName],
        updatedRecord[propertyName],
      );
      if (value !== undefined) reconciledRecord[propertyName] = value;
    });

    return reconciledRecord;
  }

  // Both the current draft and the submitted update changed the value. The submitted update wins.
  return updatedValue;
};

export const reconcileVMDraftUpdate = (
  originalVM: V1VirtualMachine,
  currentVM: V1VirtualMachine,
  updatedVM: V1VirtualMachine,
): V1VirtualMachine => reconcileValue(originalVM, currentVM, updatedVM) as V1VirtualMachine;
