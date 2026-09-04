import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getDisks,
  getInterfaces,
  getNetworks,
  getVolumes,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { isMutableObject } from '@kubevirt-utils/signals/customizeWizardVMSignalPathUtils';

export const reconcileValue = (
  previousGeneratedValue: unknown,
  customizedValue: unknown,
  nextGeneratedValue: unknown,
): unknown => {
  if (isEqual(customizedValue, previousGeneratedValue)) {
    return nextGeneratedValue;
  }

  if (isEqual(nextGeneratedValue, previousGeneratedValue)) {
    return customizedValue;
  }

  if (
    isMutableObject(customizedValue) &&
    (isMutableObject(nextGeneratedValue) || nextGeneratedValue == null)
  ) {
    const previousGeneratedRecord = isMutableObject(previousGeneratedValue)
      ? previousGeneratedValue
      : {};
    const nextGeneratedRecord = isMutableObject(nextGeneratedValue) ? nextGeneratedValue : {};
    const reconciledRecord: Record<string, unknown> = {};
    const propertyNames = new Set([
      ...Object.keys(previousGeneratedRecord),
      ...Object.keys(customizedValue),
      ...Object.keys(nextGeneratedRecord),
    ]);

    propertyNames.forEach((propertyName) => {
      const reconciledValue = reconcileValue(
        previousGeneratedRecord[propertyName],
        customizedValue[propertyName],
        nextGeneratedRecord[propertyName],
      );

      if (reconciledValue !== undefined) {
        reconciledRecord[propertyName] = reconciledValue;
      }
    });

    return reconciledRecord;
  }

  // Both generation and customization changed this value. Form-owned generation wins.
  return nextGeneratedValue;
};

type GeneratedVMResourceGroup = Record<string, unknown>;

export const getGeneratedStorageConfiguration = (
  vm: V1VirtualMachine,
): GeneratedVMResourceGroup => ({
  dataVolumeTemplates: vm.spec?.dataVolumeTemplates,
  disks: getDisks(vm),
  volumes: getVolumes(vm),
});

export const getGeneratedNetworkConfiguration = (
  vm: V1VirtualMachine,
): GeneratedVMResourceGroup => ({
  interfaces: getInterfaces(vm),
  networks: getNetworks(vm),
});
