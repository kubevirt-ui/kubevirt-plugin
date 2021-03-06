import * as React from 'react';

import { Select, SelectProps } from '@patternfly/react-core';

type FormPFSelectProps = Omit<SelectProps, 'onToggle' | 'isOpen'> & {
  closeOnSelect?: boolean;
};

const FormPFSelect: React.FC<FormPFSelectProps> = ({
  onSelect,
  children,
  menuAppendTo = 'parent',
  closeOnSelect = true,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Select
      menuAppendTo={menuAppendTo}
      isOpen={isOpen}
      onToggle={(isExpanded) => setIsOpen(isExpanded)}
      onSelect={(e, v, i) => {
        onSelect(e, v, i);
        closeOnSelect && setIsOpen(false);
      }}
      {...props}
    >
      {children}
    </Select>
  );
};

export default FormPFSelect;
