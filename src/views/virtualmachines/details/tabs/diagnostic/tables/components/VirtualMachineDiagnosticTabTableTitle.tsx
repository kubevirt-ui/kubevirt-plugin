import React, { FC, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Title } from '@patternfly/react-core';

type VirtualMachineDiagnosticTabTableTitleProps = {
  helpContent: ReactNode;
  olsPromptType: OLSPromptType;
  title: string;
};

const VirtualMachineDiagnosticTabTableTitle: FC<VirtualMachineDiagnosticTabTableTitleProps> = ({
  helpContent,
  olsPromptType,
  title,
}) => (
  <Title className="VirtualMachineDiagnosticTab--header" headingLevel="h2">
    {title}
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={helpContent}
          hide={hide}
          promptType={olsPromptType}
        />
      )}
      helpIconClassName="pf-v6-u-ml-sm"
      size="headingMd"
    />
  </Title>
);

export default VirtualMachineDiagnosticTabTableTitle;
