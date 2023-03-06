import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '@patternfly/react-core';
import { WindowsIcon } from '@patternfly/react-icons';

import './labels.scss';

const WindowsLabel: FC = () => {
  const { t } = useTranslation();
  return (
    <Label variant="outline" className="os-label" icon={<WindowsIcon />}>
      {t('Windows only')}
    </Label>
  );
};

export default WindowsLabel;
