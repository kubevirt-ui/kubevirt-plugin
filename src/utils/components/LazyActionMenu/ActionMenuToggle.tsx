import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/internal-types';
import { MenuToggle } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

type ActionMenuToggleProps = {
  isDisabled: boolean;
  isOpen: boolean;
  menuRef: React.RefObject<HTMLElement>;
  onToggleClick: (state: React.SetStateAction<boolean>) => void;
  onToggleHover: () => void;
  toggleRef: React.RefObject<HTMLButtonElement>;
  toggleTitle?: string;
  toggleVariant?: ActionMenuVariant;
};

const ActionMenuToggle: React.FC<ActionMenuToggleProps> = ({
  isDisabled,
  isOpen,
  menuRef,
  onToggleClick,
  onToggleHover,
  toggleRef,
  toggleTitle,
  toggleVariant = ActionMenuVariant.KEBAB,
}) => {
  const { t } = useKubevirtTranslation();
  const isKebabVariant = toggleVariant === ActionMenuVariant.KEBAB;
  const toggleLabel = toggleTitle || t('Actions');

  const handleMenuKeys = (event) => {
    if (!isOpen) {
      return;
    }
    if (menuRef.current) {
      if (event.key === 'Escape') {
        onToggleClick(false);
        toggleRef.current.focus();
      }
      if (!menuRef.current?.contains(event.target) && event.key === 'Tab') {
        onToggleClick(false);
      }
    }
  };

  const handleClickOutside = (event) => {
    if (
      toggleRef.current !== event.target &&
      !toggleRef.current?.contains(event.target) &&
      !menuRef.current?.contains(event.target)
    ) {
      onToggleClick(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleMenuKeys);
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleMenuKeys);
      window.removeEventListener('click', handleClickOutside);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // This needs to be run only on component mount/unmount

  const handleToggleClick = () => {
    setTimeout(() => {
      const firstElement = menuRef?.current?.querySelector<HTMLElement>(
        'li > button:not(:disabled)',
      );
      firstElement?.focus();
    }, 0);
    onToggleClick((open) => !open);
  };

  return (
    <MenuToggle
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={toggleLabel}
      data-test-id={isKebabVariant ? 'kebab-button' : 'actions-menu-button'}
      innerRef={toggleRef}
      isDisabled={isDisabled}
      isExpanded={isOpen}
      onClick={handleToggleClick}
      onFocus={onToggleHover}
      onMouseOver={onToggleHover}
      variant={toggleVariant}
    >
      {isKebabVariant ? <EllipsisVIcon /> : toggleLabel}
    </MenuToggle>
  );
};

export default ActionMenuToggle;
