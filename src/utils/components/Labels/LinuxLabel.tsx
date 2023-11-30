import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';
import { LinuxIcon } from '@patternfly/react-icons';

import './labels.scss';

const LinuxLabel: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Label className="os-label" icon={<LinuxIcon />} variant="outline">
      {t('Linux only')}
    </Label>
  );
};

export default LinuxLabel;
