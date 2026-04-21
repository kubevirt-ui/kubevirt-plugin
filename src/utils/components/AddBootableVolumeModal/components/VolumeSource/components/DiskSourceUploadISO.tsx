import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox } from '@patternfly/react-core';

type DiskSourceUploadISOProps = {
  isIso: boolean;
  setIsIso: (value: boolean) => void;
};

const DiskSourceUploadISO: FC<DiskSourceUploadISOProps> = ({ isIso, setIsIso }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Checkbox
      id="iso-checkbox"
      isChecked={isIso}
      label={t('This is an ISO file')}
      onChange={(_, value: boolean) => setIsIso(value)}
    />
  );
};

export default DiskSourceUploadISO;
