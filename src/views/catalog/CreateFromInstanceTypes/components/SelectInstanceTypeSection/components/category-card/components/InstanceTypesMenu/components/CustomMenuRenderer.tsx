import React, { ElementType, RefObject } from 'react';

import { Popper } from '@patternfly/react-core';

type CustomMenuRendererProps = {
  isOpen: boolean;
  containerRef: RefObject<HTMLDivElement>;
  menuRef: RefObject<HTMLDivElement>;
  toggleRef: RefObject<HTMLButtonElement>;
  MenuComponent: ElementType;
  onClick: () => void;
};

const CustomMenuRenderer: React.FC<CustomMenuRendererProps> = ({
  isOpen,
  containerRef,
  menuRef,
  toggleRef,
  MenuComponent,
  ...restProps
}) => {
  const Menu = <MenuComponent menuRef={menuRef} {...restProps} />;

  return (
    <Popper
      reference={toggleRef}
      popper={Menu}
      placement="bottom-end"
      isVisible={isOpen}
      appendTo={containerRef.current}
      popperMatchesTriggerWidth={false}
    />
  );
};

export default CustomMenuRenderer;
