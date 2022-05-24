import React from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import {
  uploadStatusLabels,
  uploadStatusToProgressVariant,
} from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Progress, ProgressMeasureLocation } from '@patternfly/react-core';

export const DiskSourceUploadPVCProgress: React.FC<{ upload: DataUpload }> = ({ upload }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="upload-progress">
      <Progress
        value={upload?.progress}
        title={uploadStatusLabels(t)?.[upload?.uploadStatus]}
        variant={uploadStatusToProgressVariant[upload?.uploadStatus]}
        measureLocation={ProgressMeasureLocation.inside}
      />
    </FormGroup>
  );
};
