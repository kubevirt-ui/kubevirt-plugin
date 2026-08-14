import classNames from 'classnames';
import React, { FC, PropsWithChildren } from 'react';

import { Divider, Stack } from '@patternfly/react-core';

type TemplatesSectionHeadingProps = PropsWithChildren<{
  isMenu: boolean;
  showDivider: boolean;
  title: string;
}>;

const TemplatesSectionHeading: FC<TemplatesSectionHeadingProps> = ({
  children,
  isMenu,
  showDivider,
  title,
}) => (
  <Stack className={classNames({ 'pf-v6-u-px-md pf-v6-u-py-md': isMenu })} hasGutter>
    {showDivider && <Divider />}
    <h4 className="pf-v6-u-font-weight-bold">{title}</h4>
    {children}
  </Stack>
);

export default TemplatesSectionHeading;
