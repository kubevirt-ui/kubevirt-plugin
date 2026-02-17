import React, { FC, ReactNode } from 'react';

import LightspeedPopoverContentFooter from '@lightspeed/components/LightspeedPopoverContentFooter';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Stack, StackItem } from '@patternfly/react-core';

import './LightspeedSimplePopoverContent.scss';

type LightspeedSimplePopoverContentProps = {
  breadcrumb?: string;
  content: ReactNode;
  hide: () => void;
  obj?: K8sResourceCommon;
  promptType: OLSPromptType;
};

const LightspeedSimplePopoverContent: FC<LightspeedSimplePopoverContentProps> = ({
  breadcrumb,
  content,
  hide,
  obj,
  promptType,
}) => (
  <Stack hasGutter>
    <StackItem>{content}</StackItem>
    <StackItem>
      <LightspeedPopoverContentFooter
        breadcrumb={breadcrumb}
        hide={hide}
        obj={obj}
        promptType={promptType}
      />
    </StackItem>
  </Stack>
);

export default LightspeedSimplePopoverContent;
