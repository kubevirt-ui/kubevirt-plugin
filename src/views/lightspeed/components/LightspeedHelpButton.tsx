import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import AIExperienceIcon from '@lightspeed/components/AIExperienceIcon';
import useLightspeedActions from '@lightspeed/hooks/useLightspeedActions/useLightspeedActions';
import { getOLSPrompt, OLSPromptType } from '@lightspeed/utils/prompts';
import { asOLSAttachment, clickOLSPromptSubmitButton } from '@lightspeed/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';

type LightspeedHelpButtonProps = {
  isTroubleshootContext?: boolean;
  obj?: K8sResourceCommon;
  onClick?: () => void;
  promptType: OLSPromptType;
};

const LightspeedHelpButton: FC<LightspeedHelpButtonProps> = ({
  isTroubleshootContext,
  obj,
  onClick,
  promptType,
}) => {
  const { t } = useKubevirtTranslation();
  const { openOLSDrawer, setAttachment, setQuery } = useLightspeedActions();

  const attachment = obj ? asOLSAttachment(obj) : null;
  const prompt = getOLSPrompt(promptType, isVM(obj) && { vm: obj });

  const handleClick = async () => {
    onClick();
    openOLSDrawer();

    setQuery(prompt);

    if (attachment) {
      setAttachment(attachment);
    }

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
