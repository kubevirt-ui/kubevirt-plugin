import React, { FC } from 'react';

import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import { useUploadProgressStore } from '../uploadProgressStore';

type UploadProgressAbortButtonProps = {
  abortTooltip?: string;
  uploadKey: string;
};

const UploadProgressAbortButton: FC<UploadProgressAbortButtonProps> = ({
  abortTooltip,
  uploadKey,
}) => {
  const { t } = useKubevirtTranslation();
  const cancelTrackedUpload = useUploadProgressStore((state) => state.cancelTrackedUpload);

  const button = (
    <Button
      isDanger
      onClick={() => cancelTrackedUpload(uploadKey)}
      variant={ButtonVariant.secondary}
    >
      {getCancelUploadLabel(t)}
    </Button>
  );

  if (!abortTooltip) {
    return button;
  }

  return <Tooltip content={abortTooltip}>{button}</Tooltip>;
};

export default UploadProgressAbortButton;
