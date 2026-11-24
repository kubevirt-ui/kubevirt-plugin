import produce from 'immer';
import isEqual from 'lodash/isEqual';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

import { DEFAULT_SERVICE_ACCOUNT_NAME } from '../constants/constants';
import { type CloudIdentityProvider } from '../types/types';
import { vmProviderMap } from './vmProviderMap';

const managedTemplateLabelKeys = [
  ...new Set(
    Object.values(vmProviderMap).flatMap(({ templateLabels }) => Object.keys(templateLabels)),
  ),
];

export const getVMServiceAccountName = (vm: V1VirtualMachine): string | undefined =>
  vm.spec?.template?.spec?.serviceAccountName;

const getVMTemplateLabel = (vm: V1VirtualMachine, label: string): string | undefined =>
  vm.spec?.template ? getLabel(vm.spec.template, label) : undefined;

type ServiceAccountVolumeReference = {
  name: string;
  serviceAccountName?: string;
};

const getServiceAccountVolumeReferences = (
  volumes: V1Volume[] | undefined,
): ServiceAccountVolumeReference[] =>
  (volumes ?? [])
    .filter((volume) => Boolean(volume.serviceAccount))
    .map(({ name, serviceAccount }) => ({
      name,
      serviceAccountName: serviceAccount?.serviceAccountName,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

export const getChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance | undefined,
): boolean => {
  if (!vmi) return false;

  const vmSpec = vm.spec?.template?.spec;
  const vmiServiceAccountName = vmi.spec.serviceAccountName;

  return (
    vmSpec?.serviceAccountName !== vmiServiceAccountName ||
    !isEqual(
      getServiceAccountVolumeReferences(vmSpec?.volumes),
      getServiceAccountVolumeReferences(vmi.spec.volumes),
    ) ||
    managedTemplateLabelKeys.some((label) => getVMTemplateLabel(vm, label) !== getLabel(vmi, label))
  );
};

export const isLabelUpdateRequired = (
  vm: V1VirtualMachine,
  provider: CloudIdentityProvider,
): boolean => {
  const requiredLabels = vmProviderMap[provider].templateLabels;

  return managedTemplateLabelKeys.some(
    (label) => getVMTemplateLabel(vm, label) !== requiredLabels[label],
  );
};

type UpdateVMOptions = {
  provider?: CloudIdentityProvider;
  serviceAccountName?: string;
};

export const updateVM = (
  vm: V1VirtualMachine,
  { provider, serviceAccountName }: UpdateVMOptions = {},
): V1VirtualMachine =>
  produce(vm, (draft) => {
    const template = draft.spec?.template;
    const spec = template?.spec;

    if (!template || !spec) {
      throw new Error('VirtualMachine template spec is required to update cloud identity');
    }

    if (serviceAccountName) {
      spec.serviceAccountName = serviceAccountName;
    } else {
      delete spec.serviceAccountName;
    }

    const volumeServiceAccountName = serviceAccountName ?? DEFAULT_SERVICE_ACCOUNT_NAME;

    for (const volume of spec.volumes ?? []) {
      if (volume.serviceAccount) {
        volume.serviceAccount.serviceAccountName = volumeServiceAccountName;
      }
    }

    for (const label of managedTemplateLabelKeys) {
      if (template.metadata?.labels) delete template.metadata.labels[label];
    }

    const providerLabels = provider ? vmProviderMap[provider].templateLabels : {};

    if (!isEmpty(providerLabels)) {
      ensurePath(template, 'metadata.labels');
      Object.assign(template.metadata.labels, providerLabels);
    }
  });
