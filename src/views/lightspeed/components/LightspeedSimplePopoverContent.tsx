import React, { FC, ReactNode } from 'react';

import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';

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
  return (
    <>
      {content}
      <br />
      <LightspeedHelpButton obj={obj} onClick={hide} promptType={promptType} />
    </>
  );
};

export default LightspeedSimplePopoverContent;
