import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

type BootableVolumeViewLinkProps = {
  name: string;
  onNavigate: (url: string) => void;
  url: string;
};

const BootableVolumeViewLink: FC<BootableVolumeViewLinkProps> = ({ name, onNavigate, url }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Button isInline onClick={() => onNavigate(url)} variant={ButtonVariant.link}>
      {t('View {{name}}', { name })}
    </Button>
  );
};

export default BootableVolumeViewLink;
