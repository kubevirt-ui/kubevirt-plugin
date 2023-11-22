import React, { FC, useEffect } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import { V1alpha1VirtualMachineClone } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  ProgressStep,
  ProgressStepper,
  ProgressStepVariant,
  Stack,
} from '@patternfly/react-core';

import { CLONING_STATUSES, STATUS_TO_PROGRESS_VARIANT } from '../utils/constants';

type CloningStatusProps = {
  onComplete: (status: CLONING_STATUSES) => void;
  vmCloneRequest: V1alpha1VirtualMachineClone;
};

const CloningStatus: FC<CloningStatusProps> = ({ onComplete, vmCloneRequest }) => {
  const { t } = useKubevirtTranslation();

  const [freshVMCloneRequest] = useK8sWatchResource<V1alpha1VirtualMachineClone>(
    vmCloneRequest && {
      groupVersionKind: modelToGroupVersionKind(VirtualMachineCloneModel),
      name: vmCloneRequest.metadata.name,
      namespace: vmCloneRequest.metadata.namespace,
    },
  );

  const cloneRequest = freshVMCloneRequest || vmCloneRequest;

  const phrase = cloneRequest?.status?.phase;

  useEffect(() => {
    if (
      [CLONING_STATUSES.FAILED, CLONING_STATUSES.SUCCEEDED, CLONING_STATUSES.UNKNOWN].includes(
        freshVMCloneRequest?.status?.phase as CLONING_STATUSES,
      )
    ) {
      onComplete(freshVMCloneRequest?.status?.phase as CLONING_STATUSES);
    }
  }, [freshVMCloneRequest, onComplete]);

  const progressStatus = STATUS_TO_PROGRESS_VARIANT[phrase];

  const isFailed = phrase === CLONING_STATUSES.FAILED;

  return (
    <Stack hasGutter>
      <ProgressStepper aria-label="VirtualMachine cloning steps" isCenterAligned>
        <ProgressStep
          aria-label={t('Request sent')}
          id="basic-step1"
          titleId="Request sent"
          variant={ProgressStepVariant.success}
        >
          {t('Request sent')}
        </ProgressStep>
        <ProgressStep
          aria-label={isFailed ? t('Failed') : t('In process')}
          id="basic-step2"
          isCurrent
          titleId="In process"
          variant={progressStatus}
        >
          {isFailed ? t('Failed') : t('In process')}
        </ProgressStep>
        <ProgressStep
          variant={
            phrase === CLONING_STATUSES.SUCCEEDED
              ? ProgressStepVariant.success
              : ProgressStepVariant.pending
          }
          aria-label={t('Created')}
          id="basic-step3"
          titleId="Created"
        >
          {t('Created')}
        </ProgressStep>
      </ProgressStepper>

      {phrase === CLONING_STATUSES.FAILED && (
        <Alert
          isInline
          title={t('An error occurred during the cloning process')}
          variant={AlertVariant.danger}
        >
          {cloneRequest?.status?.conditions?.find((c) => c.status === 'True')?.message || 'unknown'}
        </Alert>
      )}
    </Stack>
  );
};

export default CloningStatus;
