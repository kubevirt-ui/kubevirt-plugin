import React, { FC, ReactNode } from 'react';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import './LightspeedSimplePopoverContent.scss';

type LightspeedSimplePopoverContentProps = {
  content: ReactNode;
  hide: () => void;
  obj?: K8sResourceCommon;
  promptType: OLSPromptType;
};

const LightspeedSimplePopoverContent: FC<LightspeedSimplePopoverContentProps> = ({
  content,
  hide,
  obj,
  promptType,
}) => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);

  if (!hasOLSConsole) return null;

  return (
    <Stack hasGutter>
      <StackItem>{content}</StackItem>
      <StackItem>
        <LightspeedHelpButton
          className="lightspeed-popover-content__help-button"
          obj={obj}
          onClick={hide}
          promptType={promptType}
        />
      </StackItem>
    </Stack>
  );
};

export default LightspeedSimplePopoverContent;
