import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox } from '@patternfly/react-core';

type DiskSourceUploadISOProps = {
  isDisabled?: boolean;
  isIso: boolean;
  setIsIso: (value: boolean) => void;
};

const DiskSourceUploadISO: FC<DiskSourceUploadISOProps> = ({ isDisabled, isIso, setIsIso }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Checkbox
      id="iso-checkbox"
      isChecked={isIso}
      isDisabled={isDisabled}
      label={t('This is an ISO file')}
      onChange={(_, value: boolean) => setIsIso(value)}
    />
  );
};

export default DiskSourceUploadISO;
