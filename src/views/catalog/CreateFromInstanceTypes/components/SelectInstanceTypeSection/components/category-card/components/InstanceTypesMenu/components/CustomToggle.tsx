import React, { ElementType, ForwardedRef, forwardRef } from 'react';

export type CustomToggleElement = HTMLDivElement;

export type CustomToggleProps = {
  className?: string;
  isExpanded?: boolean;
  isDisabled?: boolean;
  innerRef?: ForwardedRef<HTMLDivElement>;
  onClick?: (...args: any[]) => void;
  'aria-label'?: string;
  Component: ElementType;
};

const CustomToggleBase: React.FC<CustomToggleProps> = ({ ...props }) => {
  const { Component, isExpanded, isDisabled, innerRef, onClick, 'aria-label': ariaLabel } = props;

  return (
    <Component
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      ref={innerRef}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    />
  );
};

const CustomToggle = forwardRef<CustomToggleElement, CustomToggleProps>((props, ref) => (
  <CustomToggleBase innerRef={ref} {...props} />
));

export default CustomToggle;
