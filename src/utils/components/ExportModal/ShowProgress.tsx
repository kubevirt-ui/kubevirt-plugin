import React, { FC } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  ProgressStep,
  ProgressStepper,
  ProgressStepVariant,
  Stack,
} from '@patternfly/react-core';

import { STATUS_TO_PROGRESS_VARIANT, UPLOAD_STATUSES } from './constants';
import { exportFailed, exportInProgress } from './utils';

type ShowProgressProps = {
  uploadPod: IoK8sApiCoreV1Pod;
};

const ShowProgress: FC<ShowProgressProps> = ({ uploadPod }) => {
  const { t } = useKubevirtTranslation();

  const phase = uploadPod?.status?.phase;
  const progressStatus = STATUS_TO_PROGRESS_VARIANT[phase];
  const isFailed = exportFailed(uploadPod);
  const isInProgress = exportInProgress(uploadPod);

  if (isEmpty(uploadPod)) return null;

  return (
    <Stack className="kv-exportmodal__showprogress" hasGutter>
      <ProgressStepper aria-label="Upload steps" isCenterAligned>
        <ProgressStep
          aria-label={t('Started')}
          id="upload-step-1"
          titleId="Started"
          variant={ProgressStepVariant.success}
        >
          {t('Started')}
        </ProgressStep>
        <ProgressStep
          aria-label={isFailed ? t('Failed') : t('In process')}
          id="upload-step-2"
          isCurrent
          titleId="In process"
          variant={progressStatus}
        >
          {isFailed ? t('Failed') : t('In process')}
        </ProgressStep>
        <ProgressStep
          variant={
            phase === UPLOAD_STATUSES.SUCCEEDED
              ? ProgressStepVariant.success
              : ProgressStepVariant.pending
          }
          aria-label={t('Completed')}
          id="upload-step-3"
          titleId="Completed"
        >
          {t('Completed')}
        </ProgressStep>
      </ProgressStepper>

      {isFailed && (
        <Alert
          isInline
          title={t('An error occurred during the upload process')}
          variant={AlertVariant.danger}
        >
          {uploadPod?.status?.conditions?.find((c) => c.status === 'True')?.message || 'unknown'}
        </Alert>
      )}

      {isInProgress && (
        <Alert
          isInline
          title={t('The upload process will continue after you close the modal.')}
          variant={AlertVariant.info}
        ></Alert>
      )}
    </Stack>
  );
};

export default ShowProgress;
