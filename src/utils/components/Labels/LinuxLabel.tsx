import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '@patternfly/react-core';
import { LinuxIcon } from '@patternfly/react-icons';

import './labels.scss';

const LinuxLabel: FC = () => {
  const { t } = useTranslation();
  return (
    <Label className="os-label" icon={<LinuxIcon />} variant="outline">
      {t('Linux only')}
    </Label>
  );
};

export default LinuxLabel;
