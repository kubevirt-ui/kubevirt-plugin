import React, { FC } from 'react';

const ShortcutTable: FC = ({ children }) => (
  <table>
    <tbody>{children}</tbody>
  </table>
);

export default ShortcutTable;
