import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { connect } from 'react-redux';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  ActionService,
  ActionServiceProvider,
  checkAccess as defaultCheckAccess,
  MenuOption,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionContext,
  ActionMenuVariant,
  LazyActionMenuProps,
} from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { Menu, MenuContent, MenuList, MenuToggle, Popper, Tooltip } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import ActionMenuContent from './ActionMenuContent';
import { flattenToAccessReview, mergeOptions } from './overrides';

export type CheckAccess = typeof defaultCheckAccess;

export type ExtendedLazyActionMenuProps = LazyActionMenuProps & {
  checkAccessDelegate?: CheckAccess;
  disabledTooltip?: string;
  localOptions?: MenuOption[];
};

type LazyFetchProps = {
  checkAccess: CheckAccess;
  context: ActionContext;
  mergedOptions?: MenuOption[];
  setRemoteOptions: Dispatch<SetStateAction<MenuOption[]>>;
};

const ActionReceiver: FC<
  ActionService & { setRemoteOptions: Dispatch<SetStateAction<MenuOption[]>> }
> = ({ loaded, options, setRemoteOptions }) => {
  useEffect(
    () => {
      loaded && setRemoteOptions(options);
    },
    // the props are expected not to change after initialization:
    // loadded - initially false, toggled once to true
    // setRemoreOptions - setter from useState
    // options - memoized by ActionServiceProvider
    [loaded, setRemoteOptions, options],
  );
  return null;
};

const LazyFetchInternal: FC<LazyFetchProps & { impersonate: ImpersonateKind }> = ({
  checkAccess,
  context,
  impersonate,
  mergedOptions,
  setRemoteOptions,
}) => {
  useEffect(() => {
    // Check access after loading actions from service over a kebab to minimize flicker when opened.
    // This depends on `checkAccess` being memoized.
    flattenToAccessReview(mergedOptions).forEach((accessReview) =>
      checkAccess(accessReview, impersonate).catch((e) =>
        kubevirtConsole.warn('Could not check access for action menu', e),
      ),
    );
  }, [mergedOptions, impersonate, checkAccess]);

  return (
    <ActionServiceProvider context={context}>
      {(service) => <ActionReceiver {...service} setRemoteOptions={setRemoteOptions} />}
    </ActionServiceProvider>
  );
};

const LazyFetch = connect(impersonateStateToProps)(LazyFetchInternal);

const LazyActionMenu: FC<ExtendedLazyActionMenuProps> = ({
  checkAccessDelegate = defaultCheckAccess,
  context,
  disabledTooltip,
  isDisabled,
  label,
  localOptions = [],
  variant = ActionMenuVariant.KEBAB,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initActionLoader, setInitActionLoader] = useState<boolean>(false);
  const [remoteOptions, setRemoteOptions] = useState<MenuOption[]>();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useClickOutside([menuRef, toggleRef], () => setIsOpen(false));

  const isKebabVariant = variant === ActionMenuVariant.KEBAB;
  const toggleLabel = label || t('Actions');

  const hideMenu = useCallback(() => setIsOpen(false), []);
  const onToggleClick = useCallback(() => setIsOpen((prevIsOpen) => !prevIsOpen), []);
  const onToggleHover = useCallback(() => setInitActionLoader(true), []);

  // assume localOptions are already memoized and stable
  const mergedOptions = useMemo(
    () => mergeOptions([...(localOptions ?? []), ...(remoteOptions ?? [])]),
    [localOptions, remoteOptions],
  );

  const toggle = (
    <MenuToggle
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={toggleLabel}
      data-test={isKebabVariant ? 'kebab-button' : 'actions-dropdown'}
      isDisabled={isDisabled}
      isExpanded={isOpen}
      onClick={onToggleClick}
      onFocus={onToggleHover}
      onMouseOver={onToggleHover}
      ref={toggleRef}
      variant={variant}
    >
      {isKebabVariant ? <EllipsisVIcon /> : toggleLabel}
    </MenuToggle>
  );

  const menu = (
    <>
      {initActionLoader && (
        <LazyFetch
          checkAccess={checkAccessDelegate}
          context={context}
          mergedOptions={mergedOptions}
          setRemoteOptions={setRemoteOptions}
        />
      )}
      {toggle}
      <Popper
        popper={
          <Menu containsFlyout ref={menuRef}>
            <MenuContent>
              <MenuList>
                <ActionMenuContent
                  checkAccess={checkAccessDelegate}
                  onClick={hideMenu}
                  options={mergedOptions}
                />
              </MenuList>
            </MenuContent>
          </Menu>
        }
        isVisible={isOpen}
        placement="bottom-end"
        triggerRef={toggleRef}
      />
    </>
  );

  return isDisabled && disabledTooltip ? (
    <Tooltip content={disabledTooltip} position="left">
      <div>{menu}</div>
    </Tooltip>
  ) : (
    menu
  );
};

export default LazyActionMenu;
