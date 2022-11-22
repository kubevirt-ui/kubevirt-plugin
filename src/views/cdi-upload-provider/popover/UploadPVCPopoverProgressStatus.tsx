import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ProgressStatus } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';

type UploadPVCPopoverProgressStatusProps = {
  title: string;
  onCancelClick: () => void;
};

const UploadPVCPopoverProgressStatus: React.FC<UploadPVCPopoverProgressStatusProps> = ({
  title,
  onCancelClick,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ProgressStatus title={title}>
      <Button
        id="cdi-upload-cancel-btn"
        className="pf-m-link--align-left"
        variant="link"
        onMouseUp={onCancelClick}
      >
        {t('Cancel upload')}
      </Button>
    </ProgressStatus>
  );
};

export default UploadPVCPopoverProgressStatus;
