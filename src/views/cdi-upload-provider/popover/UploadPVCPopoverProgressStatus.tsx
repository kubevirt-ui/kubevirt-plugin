import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ProgressStatus } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';

type UploadPVCPopoverProgressStatusProps = {
  onCancelClick: () => void;
  title: string;
};

const UploadPVCPopoverProgressStatus: React.FC<UploadPVCPopoverProgressStatusProps> = ({
  onCancelClick,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ProgressStatus title={title}>
      <Button
        className="pf-m-link--align-left"
        id="cdi-upload-cancel-btn"
        onMouseUp={onCancelClick}
        variant="link"
      >
        {t('Cancel upload')}
      </Button>
    </ProgressStatus>
  );
};

export default UploadPVCPopoverProgressStatus;
