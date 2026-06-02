import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

type CheckupRerunToastContentProps = {
  name: string;
  navigate: (path: string) => void;
  onDismiss?: () => void;
  url: string;
};

const CheckupRerunToastContent: FC<CheckupRerunToastContentProps> = ({
  name,
  navigate,
  onDismiss,
  url,
}) => {
  const { t } = useKubevirtTranslation();

  const handleClick = () => {
    navigate(url);
    onDismiss?.();
  };

  return (
    <Button isInline onClick={handleClick} variant={ButtonVariant.link}>
      {t('View checkup {{name}}', { name })}
    </Button>
  );
};

export default CheckupRerunToastContent;
