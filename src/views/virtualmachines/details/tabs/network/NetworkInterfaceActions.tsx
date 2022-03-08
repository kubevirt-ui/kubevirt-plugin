import * as React from 'react';

import { Dropdown, KebabToggle } from '@patternfly/react-core';

const NetworkInterfaceActions: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dropdown
      toggle={<KebabToggle onToggle={setIsOpen} id="toggle-id-6" />}
      isOpen={isOpen}
      isPlain
    />
  );
};

export default NetworkInterfaceActions;
