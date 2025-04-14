import React, { FC, ReactNode } from 'react';
import Linkify from 'react-linkify';

const LinkifyExternal: FC<{ children: ReactNode }> = ({ children }) => (
  <Linkify properties={{ rel: 'noopener noreferrer', target: '_blank' }}>{children}</Linkify>
);

export default LinkifyExternal;
