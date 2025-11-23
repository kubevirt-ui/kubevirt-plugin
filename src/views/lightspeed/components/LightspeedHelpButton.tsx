import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import AIExperienceIcon from '@lightspeed/components/AIExperienceIcon';
import useLightspeedActions from '@lightspeed/hooks/useLightspeedActions/useLightspeedActions';
import { clickOLSPromptSubmitButton } from '@lightspeed/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';

type LightspeedHelpButtonProps = {
  isTroubleshootContext?: boolean;
  onClick?: () => void;
  prompt: string;
};

const LightspeedHelpButton: FC<LightspeedHelpButtonProps> = ({
  isTroubleshootContext,
  onClick,
  prompt,
}) => {
  const { t } = useKubevirtTranslation();
  const { openOLSDrawer, setQuery } = useLightspeedActions();

  const handleClick = async () => {
    onClick();
    openOLSDrawer();
    setQuery(prompt);
    await clickOLSPromptSubmitButton();
  };

  return (
    <Button className="pf-v6-u-py-0" onClick={() => handleClick()} variant={ButtonVariant.link}>
      <AIExperienceIcon />
      {isTroubleshootContext ? t('Troubleshoot') : t('Learn more')}
    </Button>
  );
};

export default LightspeedHelpButton;
