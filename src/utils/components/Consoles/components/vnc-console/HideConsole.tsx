import React, { FC } from 'react';

import '../../consoles.scss';

const HideConsole: FC<{ isHidden: boolean }> = ({ children, isHidden }) => (
  <div className="console-container" style={isHidden ? { display: 'none' } : {}}>
    {children}
  </div>
);

export default HideConsole;
