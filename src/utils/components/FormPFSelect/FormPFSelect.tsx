import * as React from 'react';

import { Select, SelectProps } from '@patternfly/react-core';

type FormPFSelectProps = Omit<SelectProps, 'isOpen' | 'onToggle'> & {
  closeOnSelect?: boolean;
};

const FormPFSelect: React.FC<FormPFSelectProps> = ({
  children,
  closeOnSelect = true,
  menuAppendTo = 'parent',
  onSelect,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Select
      onSelect={(e, v, i) => {
        onSelect(e, v, i);
        closeOnSelect && setIsOpen(false);
      }}
      isOpen={isOpen}
      menuAppendTo={menuAppendTo}
      onToggle={(isExpanded) => setIsOpen(isExpanded)}
      {...props}
    >
      {children}
    </Select>
  );
};

export default FormPFSelect;
