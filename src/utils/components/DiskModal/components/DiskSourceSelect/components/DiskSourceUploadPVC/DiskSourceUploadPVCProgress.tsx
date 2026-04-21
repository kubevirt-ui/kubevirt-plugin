import React, { FC } from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import {
  UPLOAD_STATUS,
  UPLOAD_STATUS_LABELS,
  uploadStatusToProgressVariant,
} from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  FormGroup,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const DiskSourceUploadPVCProgress: FC<{ upload: DataUpload }> = ({ upload }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="upload-progress">
      <Stack hasGutter>
        <StackItem>
          <Progress
            measureLocation={ProgressMeasureLocation.inside}
            title={UPLOAD_STATUS_LABELS[upload?.uploadStatus]}
            value={upload?.progress}
            variant={uploadStatusToProgressVariant[upload?.uploadStatus]}
          />
        </StackItem>
        <StackItem>
          <Button
            isDisabled={
              upload?.uploadStatus === UPLOAD_STATUS.CANCELED ||
              upload?.uploadStatus === UPLOAD_STATUS.ERROR ||
              upload?.uploadStatus === UPLOAD_STATUS.SUCCESS
            }
            isInline
            onClick={() => upload?.cancelUpload()}
            variant={ButtonVariant.link}
          >
            {t('Cancel upload')}
          </Button>
        </StackItem>
      </Stack>
    </FormGroup>
  );
};
