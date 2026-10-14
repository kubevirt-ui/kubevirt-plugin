import type { FC } from 'react';

import { VMWizardFormProviderBoundary } from '@virtualmachines/wizard/form/VMWizardFormProviderBoundary';

import VMWizardStateProvider from './state/VMWizardStateProvider';
import WizardNavigationGuardProvider from './state/WizardNavigationGuardProvider';
import VMCreationWizardContent from './VMCreationWizardContent';

const VMCreationWizard: FC = () => {
  return (
    <VMWizardFormProviderBoundary>
      <VMWizardStateProvider>
        <WizardNavigationGuardProvider>
          <VMCreationWizardContent />
        </WizardNavigationGuardProvider>
      </VMWizardStateProvider>
    </VMWizardFormProviderBoundary>
  );
};

export default VMCreationWizard;
