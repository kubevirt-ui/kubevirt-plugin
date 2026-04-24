import React, { FCC } from 'react';

import '../../consoles.scss';

const HideConsole: FCC<{ isHidden: boolean }> = ({ children, isHidden }) => (
  <div className="console-container" style={isHidden ? { display: 'none' } : {}}>
    {children}
  </div>
);

export default HideConsole;
