import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';
import { WindowsIcon } from '@patternfly/react-icons';

import './labels.scss';

const WindowsLabel: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className="os-label" icon={<WindowsIcon />} variant="outline">
      {t('Windows only')}
    </Label>
  );
};

export default WindowsLabel;
