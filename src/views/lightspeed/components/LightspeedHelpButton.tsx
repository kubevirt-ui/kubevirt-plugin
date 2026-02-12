import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useResourceEvents from '@kubevirt-utils/hooks/useResourceEvents/useResourceEvents';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import AIExperienceIcon from '@lightspeed/components/AIExperienceIcon';
import useLightspeedActions from '@lightspeed/hooks/useLightspeedActions/useLightspeedActions';
import { DEFAULT_MAX_EVENTS } from '@lightspeed/utils/constants';
import { getOLSPrompt, OLSPromptType } from '@lightspeed/utils/prompts';
import {
  asOLSEventsAttachment,
  asOLSYAMLAttachment,
  clickOLSPromptSubmitButton,
} from '@lightspeed/utils/utils';
import { Button, ButtonVariant, Skeleton } from '@patternfly/react-core';

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
  const { events, loaded } = useResourceEvents(obj, DEFAULT_MAX_EVENTS, false);

  const eventsAttachment = events && !isEmpty(events) ? asOLSEventsAttachment(obj, events) : null;
  const yamlAttachment = obj ? asOLSYAMLAttachment(obj) : null;
  const prompt = getOLSPrompt(promptType, isVM(obj) && { vm: obj });

  const handleClick = async () => {
    onClick();
    openOLSDrawer();

    setQuery(prompt);

    if (eventsAttachment) setAttachment(eventsAttachment);
    if (yamlAttachment) setAttachment(yamlAttachment);

    await clickOLSPromptSubmitButton();
  };

  return !loaded ? (
    <Skeleton />
  ) : (
    <Button className="pf-v6-u-py-0" onClick={() => handleClick()} variant={ButtonVariant.link}>
      <AIExperienceIcon />
      {isTroubleshootContext ? t('Troubleshoot') : t('Learn more')}
    </Button>
  );
};

export default LightspeedHelpButton;
