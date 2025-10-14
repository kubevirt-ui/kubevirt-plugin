import React, { FC, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Title } from '@patternfly/react-core';

type VirtualMachineDiagnosticTabTableTitleProps = {
  helpContent: ReactNode;
  title: string;
};

const VirtualMachineDiagnosticTabTableTitle: FC<VirtualMachineDiagnosticTabTableTitleProps> = ({
  helpContent,
  title,
}) => (
  <Title className="VirtualMachineDiagnosticTab--header" headingLevel="h2">
    {title}
    <HelpTextIcon bodyContent={helpContent} helpIconClassName="pf-v6-u-ml-sm" size="headingMd" />
  </Title>
);

export default VirtualMachineDiagnosticTabTableTitle;
