import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  Action,
  checkAccess,
  MenuOption,
  useSafetyFirst,
} from '@openshift-console/dynamic-plugin-sdk';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';

import ActionMenuContent from './components/ActionMenuContent/ActionMenuContent';
import ActionMenuToggle from './components/ActionMenuToggle';

type ActionMenuProps = {
  actions: Action[];
  options?: MenuOption[];
  isDisabled?: boolean;
  variant?: ActionMenuVariant;
  label?: string;
};

const ActionMenu: FC<ActionMenuProps> = ({
  actions,
  options,
  isDisabled,
  variant = ActionMenuVariant.KEBAB,
  label,
}) => {
  const isKebabVariant = variant === ActionMenuVariant.KEBAB;
  const [isVisible, setVisible] = useSafetyFirst(isKebabVariant);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuOptions = options?.length > 0 ? options : actions;

  const hideMenu = () => {
    setIsOpen(false);
  };

  const handleHover = useCallback(() => {
    // Check access when hovering over a kebab to minimize flicker when opened.
    // This depends on `checkAccess` being memoized.
    actions?.forEach((action: Action) => {
      if (action.accessReview) {
        checkAccess(action.accessReview).catch((e) =>
          // eslint-disable-next-line no-console
          console.warn('Could not check access for action menu', e),
        );
      }
    });
  }, [actions]);

  // Check if any actions are visible when actions have access reviews.
  useEffect(() => {
    if (!actions.length) {
      setVisible(false);
      return;
    }
    // Do nothing if variant is kebab. The action menu should be visible and acces review happens on hover.
    if (isKebabVariant) return;

    const promises = actions.reduce((acc, action) => {
      if (action.accessReview) {
        acc.push(checkAccess(action.accessReview));
      }
      return acc;
    }, []);

    // Only need to resolve if all actions require access review
    if (promises.length !== actions.length) {
      setVisible(true);
      return;
    }
    Promise.all(promises)
      .then((results) => setVisible(results?.some((result) => Boolean(result?.status?.allowed))))
      .catch(() => setVisible(true));
  }, [actions, isKebabVariant, setVisible]);

  const menu = (
    <Menu ref={menuRef} containsFlyout onSelect={hideMenu}>
      <MenuContent data-test-id="action-items" translate="no">
        <MenuList>
          <ActionMenuContent options={menuOptions} onClick={hideMenu} focusItem={menuOptions[0]} />
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    isVisible && (
      <div ref={containerRef}>
        <ActionMenuToggle
          isOpen={isOpen}
          isDisabled={isDisabled}
          toggleRef={toggleRef}
          toggleVariant={variant}
          toggleTitle={label}
          menuRef={menuRef}
          onToggleClick={setIsOpen}
          onToggleHover={handleHover}
        />
        <Popper
          reference={toggleRef}
          popper={menu}
          placement="bottom-end"
          isVisible={isOpen}
          appendTo={containerRef.current}
          popperMatchesTriggerWidth={false}
        />
      </div>
    )
  );
};

export default ActionMenu;
