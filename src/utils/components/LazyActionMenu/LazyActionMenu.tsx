import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { Action, ActionServiceProvider, MenuOption } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionMenuVariant,
  LazyActionMenuProps,
} from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

import ActionMenuContent from './ActionMenuContent';
import ActionMenuToggle from './ActionMenuToggle';
import { checkAccess, createLocalMenuOptions } from './overrides';

type LazyMenuRendererProps = {
  actions: Action[];
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  toggleRef: React.RefObject<HTMLButtonElement>;
} & React.ComponentProps<typeof ActionMenuContent>;

export type ExtendedLazyActionMenuProps = LazyActionMenuProps & {
  isMulticluster?: boolean;
  localActions?: ActionDropdownItemType[];
};

const LazyMenuRenderer = connect(impersonateStateToProps)(
  ({
    actions,
    impersonate,
    isMulticluster,
    isOpen,
    menuRef,
    toggleRef,
    ...restProps
  }: LazyMenuRendererProps & { impersonate: ImpersonateKind; isMulticluster: boolean }) => {
    React.useEffect(() => {
      // Check access after loading actions from service over a kebab to minimize flicker when opened.
      // This depends on `checkAccess` being memoized.
      _.each(actions, (action: Action) => {
        if (action.accessReview) {
          checkAccess(isMulticluster, action.accessReview, impersonate).catch((e) =>
            // eslint-disable-next-line no-console
            console.warn('Could not check access for action menu', e),
          );
        }
      });
    }, [actions, isMulticluster, impersonate]);

    const menu = (
      <Menu containsFlyout onSelect={restProps.onClick} ref={menuRef}>
        <MenuContent data-test-id="action-items">
          <MenuList>
            <ActionMenuContent {...restProps} isMulticluster={isMulticluster} />
          </MenuList>
        </MenuContent>
      </Menu>
    );

    return (
      <Popper isVisible={isOpen} placement="bottom-end" popper={menu} triggerRef={toggleRef} />
    );
  },
);

const LazyActionMenu: React.FC<ExtendedLazyActionMenuProps> = ({
  context,
  isDisabled,
  isMulticluster = false,
  label,
  localActions = [],
  variant = ActionMenuVariant.KEBAB,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [initActionLoader, setInitActionLoader] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  const hideMenu = () => {
    setIsOpen(false);
  };

  const handleHover = React.useCallback(() => {
    setInitActionLoader(true);
  }, []);

  const localOptions: MenuOption[] = React.useMemo(
    () => createLocalMenuOptions(localActions),
    [localActions],
  );

  return (
    <>
      <ActionMenuToggle
        isDisabled={isDisabled}
        isOpen={isOpen}
        menuRef={menuRef}
        onToggleClick={setIsOpen}
        onToggleHover={handleHover}
        toggleRef={toggleRef}
        toggleTitle={label}
        toggleVariant={variant}
      />
      {initActionLoader && (
        <ActionServiceProvider context={context}>
          {({ actions, loaded, options }) => {
            // stable de-duplication
            // local items have higher priority
            const allOptions = _.uniqBy([...localOptions, ...options], (op) => op.id);
            const allActions = _.unionBy([...localActions, ...actions], (act) => act.id);
            return (
              loaded && (
                <LazyMenuRenderer
                  actions={allActions}
                  focusItem={allOptions[0]}
                  isMulticluster={isMulticluster}
                  isOpen={isOpen}
                  menuRef={menuRef}
                  onClick={hideMenu}
                  options={allOptions}
                  toggleRef={toggleRef}
                />
              )
            );
          }}
        </ActionServiceProvider>
      )}
    </>
  );
};

export default LazyActionMenu;
