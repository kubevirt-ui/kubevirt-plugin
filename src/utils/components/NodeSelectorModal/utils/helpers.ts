import { type TFunction } from 'i18next';
import { produce } from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNodeSelector } from '@kubevirt-utils/resources/vm';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { type IDLabel } from './types';

export const nodeSelectorToIDLabels = (nodeSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(nodeSelector).map(([key, value], id) => ({ id, key, value }));

export const idLabelsToNodeSelector = (labels: IDLabel[]): Record<string, string> =>
  labels.reduce<Record<string, string>>((acc, { key, value }) => {
    if (key.trim()) {
      acc[key] = value ?? '';
    }
    return acc;
  }, {});

export const hasIncompleteSelectorLabels = (labels: IDLabel[]): boolean =>
  labels.some(({ key }) => !key.trim());

export const getIncompleteSelectorLabelMessage = (key: string, t: TFunction): string | undefined =>
  key.trim() ? undefined : t('Key is required');

export const getNodeSelectorModalSubmitTooltip = (
  hasNotChanged: boolean,
  isIncomplete: boolean,
  t: TFunction,
): string | undefined => {
  if (hasNotChanged) return getNoModalChangesTooltip(t);
  if (isIncomplete) return t('Key must not be empty');
  return undefined;
};

export const isEqualObject = (object: unknown, otherObject: unknown): boolean => {
  if (object === otherObject) {
    return true;
  }

  if (object === null || otherObject === null) {
    return false;
  }

  if (typeof object !== 'object' || typeof otherObject !== 'object') {
    return false;
  }

  if (object.constructor !== otherObject.constructor) {
    return false;
  }

  const objectRecord = object as Record<string, unknown>;
  const otherObjectRecord = otherObject as Record<string, unknown>;

  const objectKeys = Object.keys(objectRecord);
  const otherObjectKeys = Object.keys(otherObjectRecord);

  if (objectKeys.length !== otherObjectKeys.length) {
    return false;
  }

  for (const key of objectKeys) {
    if (
      !otherObjectKeys.includes(key) ||
      !isEqualObject(objectRecord[key], otherObjectRecord[key])
    ) {
      return false;
    }
  }

  return true;
};

export const produceVMWithNodeSelector = (
  vm: V1VirtualMachine,
  selectorLabels: IDLabel[],
): V1VirtualMachine => {
  return produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    ensurePath(vmDraft, ['spec.template.spec.nodeSelector']);

    const k8sSelector = idLabelsToNodeSelector(selectorLabels);

    if (!isEqualObject(getNodeSelector(vmDraft), k8sSelector)) {
      vmDraft.spec.template.spec.nodeSelector = k8sSelector;
    }
  });
};
