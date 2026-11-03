import type { FC } from 'react';

import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import { useInFlightToastStore } from '../inFlightToastStore';
import { type InFlightToastStoreState } from '../types';

type UploadProgressAbortButtonProps = {
  abortTooltip?: string;
  storeSlice: keyof InFlightToastStoreState;
  uploadKey: string;
};

const UploadProgressAbortButton: FC<UploadProgressAbortButtonProps> = ({
  abortTooltip,
  storeSlice,
  uploadKey,
}) => {
  const { t } = useKubevirtTranslation();
  const cancelTrackedUpload = useInFlightToastStore(
    (state) => state?.[storeSlice].actions?.cancelTrackedUpload,
  );

  const button = (
    <Button
      data-test="upload-progress-abort"
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
