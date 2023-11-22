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
            measureLocation={ProgressMeasureLocation.inside}
            title={uploadStatusLabels(t)?.[upload?.uploadStatus]}
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
            variant="link"
          >
            {t('Cancel upload')}
          </Button>
        </StackItem>
      </Stack>
    </FormGroup>
  );
};
