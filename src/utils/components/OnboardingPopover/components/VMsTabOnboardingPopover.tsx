import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import OnboardingPopover from '../OnboardingPopover';
import { OnboardingPopoverKey } from '../types';

const VMsTabOnboardingPopover: FC = ({ children }) => {
  const { t } = useKubevirtTranslation();

  return (
    <OnboardingPopover
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          We&apos;ve moved the complete list of virtual machines to the{' '}
          <span className="pf-v6-u-font-weight-bold">Virtual machines</span> tab to help you manage
          at scale. Use the <span className="pf-v6-u-font-weight-bold">Overview</span> tab for a
          high-level summary of your current view, including health and alerts.
        </Trans>
      }
      headerContent={t('Looking for your VMs?')}
      hideOnTriggerClick
      popoverKey={OnboardingPopoverKey.VMsTab}
    >
      {children}
    </OnboardingPopover>
  );
};

export default VMsTabOnboardingPopover;
