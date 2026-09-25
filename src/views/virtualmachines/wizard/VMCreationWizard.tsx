import type { FC } from 'react';

import { VMWizardFormProviderBoundary } from '@virtualmachines/wizard/form/VMWizardFormProviderBoundary';

import VMWizardStateProvider from './state/VMWizardStateProvider';
import VMCreationWizardContent from './VMCreationWizardContent';

const VMCreationWizard: FC = () => {
  return (
    <VMWizardFormProviderBoundary>
      {(resources) => (
        <VMWizardStateProvider>
          <VMCreationWizardContent {...resources} />
        </VMWizardStateProvider>
      )}
    </VMWizardFormProviderBoundary>
  );
};

export default VMCreationWizard;
