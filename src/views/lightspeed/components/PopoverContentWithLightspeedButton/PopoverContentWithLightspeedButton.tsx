import React, { FCC, ReactNode } from 'react';

import LightspeedPopoverContentFooter from '@lightspeed/components/LightspeedPopoverContentFooter';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Stack, StackItem } from '@patternfly/react-core';

import './PopoverContentWithLightspeedButton.scss';

type PopoverContentWithLightspeedButtonProps = {
  breadcrumb?: string;
  content: ReactNode;
  hide: () => void;
  obj?: K8sResourceCommon;
  promptType: OLSPromptType;
};

const PopoverContentWithLightspeedButton: FCC<PopoverContentWithLightspeedButtonProps> = ({
  breadcrumb,
  content,
  hide,
  obj,
  promptType,
}) => (
  <Stack hasGutter>
    <StackItem>{content}</StackItem>
    <LightspeedPopoverContentFooter
      breadcrumb={breadcrumb}
      hide={hide}
      obj={obj}
      promptType={promptType}
    />
  </Stack>
);

export default PopoverContentWithLightspeedButton;
