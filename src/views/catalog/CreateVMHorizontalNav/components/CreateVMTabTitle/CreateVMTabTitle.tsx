import React, { ComponentClass, FC } from 'react';

import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { TabTitleIcon, TabTitleText } from '@patternfly/react-core';

type CreateVMTabTitleProps = {
  titleText: string;
  Icon: ComponentClass;
  badge?: boolean;
};

const CreateVMTabTitle: FC<CreateVMTabTitleProps> = ({ Icon, titleText, badge }) => (
  <>
    <TabTitleIcon>
      <Icon />
    </TabTitleIcon>
    <TabTitleText>{titleText}</TabTitleText>
    {badge && <DeveloperPreviewLabel />}
  </>
);

export default CreateVMTabTitle;
