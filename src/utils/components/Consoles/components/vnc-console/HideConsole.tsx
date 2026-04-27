import React, { FC, ReactNode } from 'react';

import '../../consoles.scss';

const HideConsole: FC<{ children?: ReactNode; isHidden: boolean }> = ({ children, isHidden }) => (
  <div className="console-container" style={isHidden ? { display: 'none' } : {}}>
    {children}
  </div>
);

export default HideConsole;
