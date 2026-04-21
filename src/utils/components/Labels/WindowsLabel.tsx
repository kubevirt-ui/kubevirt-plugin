import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';
import { WindowsIcon } from '@patternfly/react-icons';

import './labels.scss';

const WindowsLabel: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className="os-label" icon={<WindowsIcon />} variant="outline">
      {t('Windows only')}
    </Label>
  );
};

export default WindowsLabel;
