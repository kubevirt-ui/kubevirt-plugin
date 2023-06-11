import React, { ComponentClass, FC, ReactNode } from 'react';

import { TabTitleIcon, TabTitleText } from '@patternfly/react-core';

type CreateVMTabTitleProps = {
  badge?: ReactNode;
  Icon: ComponentClass;
  titleText: string;
};

const CreateVMTabTitle: FC<CreateVMTabTitleProps> = ({ badge, Icon, titleText }) => (
  <>
    <TabTitleIcon>
      <Icon />
    </TabTitleIcon>
    <TabTitleText>{titleText}</TabTitleText>
    {badge}
  </>
);

export default CreateVMTabTitle;
