import React, { ElementType, RefObject, SetStateAction } from 'react';

import { CLICK, ESCAPE, KEYDOWN, TAB } from '../../../../../utils/constants';

import CustomToggle from './CustomToggle';

type EnhancedMenuToggleProps = {
  isOpen: boolean;
  menuRef: RefObject<HTMLElement>;
  onToggleClick: (state: SetStateAction<boolean>) => void;
  toggleComponent: ElementType;
  toggleRef: RefObject<HTMLButtonElement>;
  customData?: any;
};

const EnhancedMenuToggle: React.FC<EnhancedMenuToggleProps> = (props) => {
  const { isOpen, menuRef, onToggleClick, toggleComponent, toggleRef } = props;

  const handleMenuKeys = (event) => {
    if (!isOpen) {
      return;
    }
    if (menuRef?.current) {
      if (event?.key === ESCAPE) {
        onToggleClick(false);
        toggleRef?.current?.focus();
      }
      if (!menuRef?.current?.contains(event?.target) && event?.key === TAB) {
        onToggleClick(false);
      }
    }
  };

  const handleClickOutside = (event) => {
    if (
      toggleRef?.current !== event?.target &&
      !toggleRef?.current?.contains(event?.target) &&
      !menuRef?.current?.contains(event?.target)
    ) {
      onToggleClick(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window?.addEventListener(KEYDOWN, handleMenuKeys);
      window?.addEventListener(CLICK, handleClickOutside);
    }
    return () => {
      window?.removeEventListener(KEYDOWN, handleMenuKeys);
      window?.removeEventListener(CLICK, handleClickOutside);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // This needs to be run only on component mount/unmount

  const handleToggleClick = () => {
    onToggleClick((open) => !open);
  };

  return <CustomToggle Component={toggleComponent} onClick={handleToggleClick} {...props} />;
};

export default EnhancedMenuToggle;
