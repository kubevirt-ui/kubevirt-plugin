import React, {
  ComponentProps,
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { connect } from 'react-redux';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  ActionServiceProvider,
  checkAccess as defaultCheckAccess,
  MenuOption,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionMenuVariant,
  LazyActionMenuProps,
} from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';

import ActionMenuContent from './ActionMenuContent';
import ActionMenuToggle from './ActionMenuToggle';
import { flattenToAccessReview, mergeOptions } from './overrides';

export type CheckAccess = typeof defaultCheckAccess;

export type ExtendedLazyActionMenuProps = LazyActionMenuProps & {
  checkAccessDelegate?: CheckAccess;
  localOptions?: MenuOption[];
};

type LazyMenuRendererProps = {
  checkAccess: CheckAccess;
  isOpen: boolean;
  localOptions?: MenuOption[];
  menuRef: RefObject<HTMLDivElement>;
  toggleRef: RefObject<HTMLButtonElement>;
} & ComponentProps<typeof ActionMenuContent>;

const LazyMenuRendererInternal: FC<LazyMenuRendererProps & { impersonate: ImpersonateKind }> = ({
  checkAccess,
  impersonate,
  isOpen,
  localOptions,
  menuRef,
  options,
  toggleRef,
  ...restProps
}) => {
  // assume localOptions are already memoized
  const mergedOptions = useMemo(
    () => mergeOptions([...localOptions, ...options]),
    [localOptions, options],
  );

  useEffect(
    () =>
      // Check access after loading actions from service over a kebab to minimize flicker when opened.
      // This depends on `checkAccess` being memoized.
      flattenToAccessReview(mergedOptions).forEach((accessReview) =>
        checkAccess(accessReview, impersonate).catch((e) =>
          kubevirtConsole.warn('Could not check access for action menu', e),
        ),
      ),

    [mergedOptions, impersonate, checkAccess],
  );

  const menu = (
    <Menu containsFlyout onSelect={restProps.onClick} ref={menuRef}>
      <MenuContent data-test-id="action-items">
        <MenuList>
          <ActionMenuContent
            options={mergedOptions}
            {...restProps}
            checkAccess={checkAccess}
            focusItem={mergedOptions[0]}
          />
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return <Popper isVisible={isOpen} placement="bottom-end" popper={menu} triggerRef={toggleRef} />;
};

const LazyMenuRenderer = connect(impersonateStateToProps)(LazyMenuRendererInternal);

const LazyActionMenu: FC<ExtendedLazyActionMenuProps> = ({
  checkAccessDelegate = defaultCheckAccess,
  context,
  isDisabled,
  label,
  localOptions = [],
  variant = ActionMenuVariant.KEBAB,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initActionLoader, setInitActionLoader] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const hideMenu = () => {
    setIsOpen(false);
  };

  const handleHover = useCallback(() => {
    setInitActionLoader(true);
  }, []);

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
          {({ loaded, options }) =>
            loaded && (
              <LazyMenuRenderer
                checkAccess={checkAccessDelegate}
                isOpen={isOpen}
                localOptions={localOptions}
                menuRef={menuRef}
                onClick={hideMenu}
                options={options}
                toggleRef={toggleRef}
              />
            )
          }
        </ActionServiceProvider>
      )}
    </>
  );
};

export default LazyActionMenu;
