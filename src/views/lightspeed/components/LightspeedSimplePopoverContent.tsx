import React, { FC, ReactNode } from 'react';

import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';

type LightspeedSimplePopoverContentProps = {
  content: ReactNode;
  hide: any;
  promptType: OLSPromptType;
};

const LightspeedSimplePopoverContent: FC<LightspeedSimplePopoverContentProps> = ({
  content,
  hide,
  promptType,
}) => {
  return (
    <>
      {content}
      <br />
      <LightspeedHelpButton onClick={hide} promptType={promptType} />
    </>
  );
};

export default LightspeedSimplePopoverContent;
