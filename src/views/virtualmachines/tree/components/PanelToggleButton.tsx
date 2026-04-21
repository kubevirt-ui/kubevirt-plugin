import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';

type PanelToggleButtonProps = {
  isOpen: boolean;
  toggleDrawer: () => void;
};

const PanelToggleButton: FC<PanelToggleButtonProps> = ({ isOpen, toggleDrawer }) => {
  const { t } = useKubevirtTranslation();

  const SvgIcon = isOpen ? AngleLeftIcon : AngleRightIcon;

  return (
    <Tooltip content={isOpen ? t('Close') : t('Open')}>
      <button className="vms-tree-view__panel-toggle-button" onClick={toggleDrawer}>
        <SvgIcon />
      </button>
    </Tooltip>
  );
};

export default PanelToggleButton;
