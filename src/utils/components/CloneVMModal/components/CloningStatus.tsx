import React, { FCC } from 'react';

import { V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  vmCloneRequest: V1beta1VirtualMachineClone;
};

const CloningStatus: FCC<CloningStatusProps> = ({ vmCloneRequest }) => {
  const { t } = useKubevirtTranslation();

  const phase = vmCloneRequest?.status?.phase;

  const progressStatus = STATUS_TO_PROGRESS_VARIANT[phase];

  const isFailed = [CLONING_STATUSES.FAILED, CLONING_STATUSES.UNKNOWN].includes(
    phase as CLONING_STATUSES,
  );

  const isInProgress = phase && !isFailed && phase !== CLONING_STATUSES.SUCCEEDED;

  if (!Boolean(vmCloneRequest)) return null;

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
            phase === CLONING_STATUSES.SUCCEEDED
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

      {phase === CLONING_STATUSES.FAILED && (
        <Alert
          isInline
          title={t('An error occurred during the cloning process')}
          variant={AlertVariant.danger}
        >
          {vmCloneRequest?.status?.conditions?.find((c) => c.status === 'True')?.message ||
            'unknown'}
        </Alert>
      )}

      {isInProgress && (
        <Alert
          title={t(
            'The cloning process will continue after you close the modal. The cloned VirtualMachine may take some time to appear.',
          )}
          isInline
          variant={AlertVariant.info}
        />
      )}
    </Stack>
  );
};

export default CloningStatus;
