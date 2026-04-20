import React, { FCC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import OnboardingPopover from '../OnboardingPopover';
import { OnboardingPopoverKey } from '../types';

const CatalogOnboardingPopover: FCC = () => {
  const { t } = useKubevirtTranslation();

  const triggerElement = document.querySelector<HTMLElement>(
    '[data-test-id="virtualmachines-nav-item"]',
  );

  return (
    <OnboardingPopover
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          You can now create VMs directly from the{' '}
          <span className="pf-v6-u-font-weight-bold">VirtualMachines</span> page or by
          right-clicking a project in the navigation tree.
        </Trans>
      }
      headerContent={t('Looking for the catalog? VM creation has moved!')}
      popoverKey={OnboardingPopoverKey.Catalog}
      triggerElement={triggerElement}
    />
  );
};

export default CatalogOnboardingPopover;
