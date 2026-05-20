import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNavToggleButton } from '@virtualmachines/hooks/useAutoHideNavigation/utils';

import OnboardingPopover from '../OnboardingPopover';
import { OnboardingPopoverKey } from '../types';

type NavCollapseOnboardingPopoverProps = {
  isNavCollapsed: boolean;
};

const NavCollapseOnboardingPopover: FC<NavCollapseOnboardingPopoverProps> = ({
  isNavCollapsed,
}) => {
  const { t } = useKubevirtTranslation();

  const triggerElement = isNavCollapsed ? getNavToggleButton() : null;

  return (
    <OnboardingPopover
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          The navigation menu hides here to give you more room for your VM details. Reopen it
          anytime using the menu icon, or turn this off in{' '}
          <span className="pf-v6-u-font-weight-bold">User settings</span>.
        </Trans>
      }
      headerContent={t("We've maximized your workspace")}
      hideOnTriggerClick
      popoverKey={OnboardingPopoverKey.NavCollapse}
      triggerElement={triggerElement}
    />
  );
};

export default NavCollapseOnboardingPopover;
