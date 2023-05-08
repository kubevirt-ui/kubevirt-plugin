import React, { FC } from 'react';

const ShortcutCommand: FC = ({ children }) => (
  <span className="ocs-shortcut__command">
    <kbd className="co-kbd">{children}</kbd>
  </span>
);

export default ShortcutCommand;
