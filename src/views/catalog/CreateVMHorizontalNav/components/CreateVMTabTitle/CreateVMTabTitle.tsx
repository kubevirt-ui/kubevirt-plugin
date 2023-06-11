import React, { ComponentClass, FC, ReactNode } from 'react';

import { TabTitleIcon, TabTitleText } from '@patternfly/react-core';

type CreateVMTabTitleProps = {
  titleText: string;
  Icon: ComponentClass;
  badge?: ReactNode;
};

const CreateVMTabTitle: FC<CreateVMTabTitleProps> = ({ Icon, titleText, badge }) => (
  <>
    <TabTitleIcon>
      <Icon />
    </TabTitleIcon>
    <TabTitleText>{titleText}</TabTitleText>
    {badge}
  </>
);

export default CreateVMTabTitle;
