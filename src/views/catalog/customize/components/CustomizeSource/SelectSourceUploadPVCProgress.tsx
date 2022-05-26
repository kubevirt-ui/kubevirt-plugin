import React from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import {
  UPLOAD_STATUS,
  uploadStatusLabels,
  uploadStatusToProgressVariant,
} from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  FormGroup,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const SelectSourceUploadPVCProgress: React.FC<{ upload: DataUpload }> = ({ upload }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="upload-progress">
      <Stack hasGutter>
        <StackItem>
          <Progress
            value={upload?.progress}
            title={uploadStatusLabels(t)?.[upload?.uploadStatus]}
            variant={uploadStatusToProgressVariant[upload?.uploadStatus]}
            measureLocation={ProgressMeasureLocation.inside}
          />
        </StackItem>
        <StackItem>
          <Button
            isDisabled={
              upload?.uploadStatus === UPLOAD_STATUS.CANCELED ||
              upload?.uploadStatus === UPLOAD_STATUS.ERROR ||
              upload?.uploadStatus === UPLOAD_STATUS.SUCCESS
            }
            variant="link"
            isInline
            onClick={() => upload?.cancelUpload()}
          >
            {t('Cancel upload')}
          </Button>
        </StackItem>
      </Stack>
    </FormGroup>
  );
};
