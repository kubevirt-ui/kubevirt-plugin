import React, { FC } from 'react';

type SidebarSectionHeadingProps = {
  children?: any;
  style?: any;
  className?: string;
  text: string;
};

const SidebarSectionHeading: FC<SidebarSectionHeadingProps> = ({
  text,
  children,
  style,
  className,
}) => (
  <h2 className={`sidebar__section-heading ${className}`} style={style}>
    {text}
    {children}
  </h2>
);

export default SidebarSectionHeading;
