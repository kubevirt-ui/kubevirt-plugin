import type { TFunction } from 'i18next';
import produce from 'immer';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  CLONING_STATUSES,
  isClonePhaseFailed,
} from '@kubevirt-utils/components/CloneVMModal/utils/constants';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_FAILED,
  CUSTOMIZE_VM_SUCCEEDED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import {
  TELEMETRY_RESOURCE_CREATION_METHOD,
  TELEMETRY_RESOURCE_TYPE,
  TELEMETRY_VM_CREATION_METHOD,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import {
  logVMCreated,
  logVMCreatedFromTemplate,
  logVMCreationFailed,
  mapCreationMethodToTelemetry,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { logResourceCreated } from '@kubevirt-utils/extensions/telemetry/yaml-vs-ui';
import { getName } from '@kubevirt-utils/resources/shared';
import type { Template } from '@kubevirt-utils/resources/template';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { getErrorMessage, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';
import { VMCreationMethod } from '@virtualmachines/creation-wizard-new/utils/constants';
import { HandleCloneRequestPhaseChangeParams } from '@virtualmachines/creation-wizard-new/utils/types';

export const prepareVMToCreate = (
  storeVM: V1VirtualMachine,
  vmName: string | undefined,
  isIPv6SingleStack: boolean,
): V1VirtualMachine =>
  produce(storeVM, (draft) => {
    if (vmName && vmName !== getName(draft)) {
      draft.metadata.name = vmName;
    }
    if (isIPv6SingleStack) {
      removePodNetworkFromVM(draft);
    }
  });

export const logSuccessfulVMCreation = (
  createdVM: V1VirtualMachine,
  creationMethod: undefined | VMCreationMethod,
  selectedTemplate: null | Template,
): void => {
  logITFlowEvent(CUSTOMIZE_VM_SUCCEEDED, createdVM);
  logResourceCreated(TELEMETRY_RESOURCE_TYPE.VM, TELEMETRY_RESOURCE_CREATION_METHOD.FORM);

  if (creationMethod === VMCreationMethod.TEMPLATE && selectedTemplate) {
    logVMCreatedFromTemplate(selectedTemplate);
    return;
  }

  logVMCreated(mapCreationMethodToTelemetry(creationMethod ?? VMCreationMethod.INSTANCE_TYPE));
};

export const logFailedVMCreation = (
  storeVM: V1VirtualMachine,
  creationMethod: undefined | VMCreationMethod,
  err: unknown,
): void => {
  logITFlowEvent(CUSTOMIZE_VM_FAILED, storeVM);
  logVMCreationFailed(
    mapCreationMethodToTelemetry(creationMethod ?? VMCreationMethod.INSTANCE_TYPE),
    err,
  );
};

export const createHeadlessServiceSafely = async (
  createdVM: V1VirtualMachine,
  t: TFunction,
): Promise<void> => {
  try {
    await createHeadlessService(createdVM);
  } catch (svcErr) {
    kubevirtConsole.warn(t('Headless service creation failed: '), getErrorMessage(svcErr));
  }
};

export const handleCloneRequestPhaseChange = ({
  cloneRequest,
  formValues: { cluster, name, project: targetNamespace },
  navigate,
  setError,
  setIsSubmitting,
  submittedCloneRequest,
  setSubmittedCloneRequest,
  t,
}: HandleCloneRequestPhaseChangeParams): void => {
  if (!submittedCloneRequest) {
    return;
  }

  const clonePhase = cloneRequest?.status?.phase;

  if (clonePhase === CLONING_STATUSES.SUCCEEDED) {
    logVMCreated(TELEMETRY_VM_CREATION_METHOD.CLONE);
    navigate(getVMURL(getCluster(cloneRequest) || cluster, targetNamespace, name));
    return;
  }

  if (isClonePhaseFailed(clonePhase)) {
    const cloneError = new Error(
      cloneRequest?.status?.conditions?.[0]?.message || t('Clone failed'),
    );
    setError(cloneError);
    setIsSubmitting(false);
    setSubmittedCloneRequest(undefined);
    logVMCreationFailed(TELEMETRY_VM_CREATION_METHOD.CLONE, cloneError);
  }
};
