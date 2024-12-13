import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { PanelCloseIcon, PanelOpenIcon } from '@patternfly/react-icons';

type PanelToggleButtonProps = {
  className?: string;
  isOpen: boolean;
  toggleDrawer: () => void;
};

const PanelToggleButton: FC<PanelToggleButtonProps> = ({ className, isOpen, toggleDrawer }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Tooltip content={isOpen ? t('Close') : t('Open')}>
      <Button className={className} onClick={toggleDrawer} variant={ButtonVariant.plain}>
        {isOpen ? <PanelCloseIcon /> : <PanelOpenIcon />}
      </Button>
    </Tooltip>
  );
};

export default PanelToggleButton;
